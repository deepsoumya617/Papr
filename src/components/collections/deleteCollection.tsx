import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { deleteCollection } from "@/server/queries/collections";
import { TrashIcon } from "lucide-react";

interface DeleteCollectionProps {
  title: string;
  collectionId: string;
  children: ReactNode;
  onDelete?: () => void;
}

const DeleteCollection = (props: DeleteCollectionProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const handleDeleteCollection = async () => {
    try {
      await deleteCollection(props.collectionId);
      await queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
      setIsOpen(false);
      props.onDelete?.();
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Collection</DialogTitle>
          <DialogDescription>
            This <strong>{props.title} collection</strong> and{" "}
            <strong>its reminders</strong> will be deleted from your account.
            Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => handleDeleteCollection()}
            className="cursor-pointer"
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCollection;
