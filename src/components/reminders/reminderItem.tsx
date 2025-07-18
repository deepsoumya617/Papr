"use client";

import type { GetReminders } from "@/server/db/types";
import { useState } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { updateReminderStatus } from "@/server/queries/client";
import { cn } from "@/lib/utils";
import EditReminder from "@/components/reminders/editReminder";
import DeleteReminder from "@/components/reminders/deleteReminder";

type Reminder = GetReminders;

interface ReminderItemProps {
  reminderData: Reminder;
}

interface CheckboxProps {
  reminderId: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const CheckBoxAnimatedIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M5 7.5L7 9.5L7.40859 8.81902C8.13346 7.6109 9.00376 6.49624 10 5.5V5.5"
        className="stroke-white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{
          pathLength: 0,
        }}
        animate={{
          pathLength: 1,
        }}
        exit={{
          pathLength: 0,
        }}
        transition={{
          delay: 0.025,
          duration: 0.35,
        }}
      />
    </svg>
  );
};

const Checkbox = ({ reminderId, checked, onCheckedChange }: CheckboxProps) => {
  return (
    <RadixCheckbox.Root
      id={reminderId}
      checked={checked}
      title={checked ? "Mark as not completed" : "Mark as completed"}
      onCheckedChange={onCheckedChange}
      className={cn(
        "cursor-pointer",
        "flex h-4 w-4 flex-shrink-0 appearance-none items-center justify-center rounded outline-none",
        "bg-zinc-100",
        "border border-zinc-400",
        "transition-colors ease-in-out hover:border-zinc-400",
      )}
    >
      <RadixCheckbox.Indicator>
        <motion.div
          className="h-[inherit] w-[inherit] rounded bg-black"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <CheckBoxAnimatedIcon />
        </motion.div>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
};

const ReminderItem = ({ reminderData }: ReminderItemProps) => {
  const queryClient = useQueryClient();
  const [optimisticIsCompleted, setOptimisticIsCompleted] = useState(
    reminderData.isCompleted,
  );

  const mutation = useMutation({
    mutationFn: async (isCompleted: boolean) => {
      const updateReminder = await updateReminderStatus({
        id: reminderData.id,
        createdBy: reminderData.createdBy!,
        isCompleted,
      });
      return updateReminder;
    },
    onMutate: async (newIsCompleted) => {
      await queryClient.cancelQueries({ queryKey: ["reminders"] });
      const previousReminders = queryClient.getQueryData<Reminder[]>([
        "reminders",
      ]);
      queryClient.setQueryData<Reminder[]>(["reminders"], (old) =>
        old?.map((r) =>
          r.id === reminderData.id ? { ...r, isCompleted: newIsCompleted } : r,
        ),
      );
      setOptimisticIsCompleted(newIsCompleted);
      return { previousReminders };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(["reminders"], context.previousReminders);
        setOptimisticIsCompleted(reminderData.isCompleted);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  return (
    <div className="flex w-full items-center gap-3.5 py-2">
      <Checkbox
        reminderId={reminderData.id}
        checked={optimisticIsCompleted ?? false}
        onCheckedChange={mutation.mutate}
      />
      <div className="group grid gap-1.5">
        <div className="flex w-full items-center space-x-3">
          <label
            htmlFor={reminderData.id}
            className="text-sm text-pretty font-medium text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {reminderData.title}
          </label>
          <div className="flex items-center shrink-0 space-x-2.5 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
            <EditReminder reminderData={reminderData} />
            <DeleteReminder
              reminderId={reminderData.id}
              title={reminderData.title}
            />
          </div>
        </div>
        {reminderData.dueDate && (
          <div className="flex items-center space-x-1.5 text-sm">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(reminderData.dueDate), "dd MMM yyyy")}</span>
          </div>
        )}
        {reminderData.description && (
          <span className="text-sm">
            {reminderData.description}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReminderItem;