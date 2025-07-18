"use client";

import type { GetCollections, GetReminders } from "@/server/db/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import CollectionOptions from "./collectionOptions";
import CreateReminder from "../reminders/createReminder";
import ReminderItem from "../reminders/reminderItem";

interface ShowCollectionProps {
  collection: GetCollections;
  reminders: GetReminders[];
  fetchCollections: () => Promise<void>;
}

const ShowCollection = ({
  collection,
  reminders,
  fetchCollections,
}: ShowCollectionProps) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue={collection.id}
    >
      <AccordionItem value={collection.id}>
        <div className="flex w-full items-center justify-between px-4 py-3 transition">
          <AccordionTrigger
            className={cn(
              "flex flex-1 items-center justify-between p-0 text-left",
            )}
          >
            <div className="flex cursor-pointer items-center space-x-3">
              {collection.colors && (
                <div
                  className={cn(collection.colors, "h-4 w-4 rounded-full")}
                />
              )}
              <span className="text-base font-semibold">{collection.name}</span>
            </div>
          </AccordionTrigger>

          <div className="flex items-center space-x-3 pl-4">
            <CreateReminder
              collectionId={collection.id || ""}
              collectionName={collection.name || ""}
              collectionColor={collection.colors}
            />
            <CollectionOptions
              collection={collection}
              fetchCollections={fetchCollections}
            />
          </div>
        </div>

        <AccordionContent className="px-5 pb-4">
          {reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <p className="opacity-50">
                Add some reminders to this collection
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col space-y-3">
              {reminders.map((reminder) => (
                <ReminderItem reminderData={reminder} key={reminder.id} />
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ShowCollection;