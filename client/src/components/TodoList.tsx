import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2 } from "lucide-react";
import { type Todo } from "@shared/types";

interface TodoListProps {
  todos: Todo[];
  onToggleStatus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: number) => void;
  isUpdating?: boolean;
}

export default function TodoList({
  todos,
  onToggleStatus,
  onEdit,
  onDelete,
  isUpdating = false,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">No tasks to display</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          {/* Checkbox */}
          <Checkbox
            checked={todo.status === "completed"}
            onCheckedChange={() => onToggleStatus(todo)}
            className="mt-1"
            disabled={isUpdating}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-semibold text-base ${
                  todo.status === "completed"
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {todo.title}
              </h3>
              <Badge
                variant={todo.status === "completed" ? "secondary" : "default"}
                className={
                  todo.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }
              >
                {todo.status === "completed" ? "Completed" : "Pending"}
              </Badge>
            </div>
            {todo.description && (
              <p
                className={`text-sm ${
                  todo.status === "completed"
                    ? "line-through text-muted-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {todo.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(todo)}
              disabled={isUpdating}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.id)}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
