import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import AddTodoForm from "./AddTodoForm";

interface AddTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddTodoDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTodoDialogProps) {
  const createMutation = trpc.todo.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const handleSubmit = async (title: string, description?: string) => {
    try {
      await createMutation.mutateAsync({
        title,
        description,
      });
    } catch (error) {
      // Error is already handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your to-do list. You can add a description for more details.
          </DialogDescription>
        </DialogHeader>
        <AddTodoForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
