import { trpc } from "@/lib/trpc";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteTodoConfirmProps {
  todoId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteTodoConfirm({
  todoId,
  onClose,
  onSuccess,
}: DeleteTodoConfirmProps) {
  const deleteMutation = trpc.todo.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ id: todoId });
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
