"use client";

import type { InsertCollection } from "@/server/db/types";
import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCollection } from "@/server/queries/collections";
import { collectionZodSchema } from "@/server/schemas/collection";
import { Input } from "@/components/ui/input";
import { ColorSelector } from "@/components/ui/colorSelector";
import { colorOptions } from "./colors";
import { toast } from "sonner";

interface CreateCollectionProps {
  children: ReactNode;
  organizationId?: string;
  onCreate?: () => void;
}

const CreateCollection = ({
  children,
  organizationId,
  onCreate,
}: CreateCollectionProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<InsertCollection>({
    resolver: zodResolver(collectionZodSchema),
  });

  const handleCreateCollection = async (data: InsertCollection) => {
    setLoading(true);
    try {
      await createCollection({
        ...data,
        organizationId: organizationId,
      });

      toast.success("Collection created successfully");
      form.reset();
      setIsOpen(false);

      onCreate?.();
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection.", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOnClose = (value: boolean) => {
    setIsOpen(value);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your reminders.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateCollection)}
            className="mt-2 space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Collection Name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <ColorSelector
                      options={colorOptions}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer justify-center"
              >
                {loading ? (
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                <span>{loading ? "Creating..." : "Create"}</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollection;
