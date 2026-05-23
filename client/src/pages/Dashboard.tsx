import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import AddTodoDialog from "@/components/AddTodoDialog";
import EditTodoDialog from "@/components/EditTodoDialog";
import DeleteTodoConfirm from "@/components/DeleteTodoConfirm";
import TodoList from "@/components/TodoList";
import { type Todo } from "@shared/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const utils = trpc.useUtils();
  const { data: todos = [], isLoading, error, refetch } = trpc.todo.list.useQuery();
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const updateStatusMutation = trpc.todo.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await utils.todo.list.cancel();

      // Snapshot the previous value
      const previousTodos = utils.todo.list.getData();

      // Optimistically update the cache
      if (previousTodos) {
        utils.todo.list.setData(undefined, (old) =>
          old?.map((todo) =>
            todo.id === id ? { ...todo, status } : todo
          ) || []
        );
      }

      return { previousTodos };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        utils.todo.list.setData(undefined, context.previousTodos);
      }
      toast.error("Failed to update todo status");
    },
    onSuccess: () => {
      toast.success("Todo status updated");
    },
  });

  const filteredTodos = todos.filter((todo) => {
    if (filterStatus === "all") return true;
    return todo.status === filterStatus;
  });

  const handleToggleStatus = (todo: Todo) => {
    const newStatus = todo.status === "pending" ? "completed" : "pending";
    updateStatusMutation.mutate({ id: todo.id, status: newStatus });
  };

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const completedCount = todos.filter((t) => t.status === "completed").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">To-Do Dashboard</h1>
        <p className="text-muted-foreground">Manage your tasks efficiently and stay organized</p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load tasks. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>Create, edit, and manage your to-do items</CardDescription>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {/* Tabs for filtering */}
          <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All ({todos.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filterStatus}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading tasks...</div>
                </div>
              ) : (
                <TodoList
                  todos={filteredTodos}
                  onToggleStatus={handleToggleStatus}
                  onEdit={setEditingTodo}
                  onDelete={setDeletingTodoId}
                  isUpdating={updateStatusMutation.isPending}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTodoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false);
          refetch();
        }}
      />
      {editingTodo && (
        <EditTodoDialog
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSuccess={() => {
            setEditingTodo(null);
            refetch();
          }}
        />
      )}
      {deletingTodoId && (
        <DeleteTodoConfirm
          todoId={deletingTodoId}
          onClose={() => setDeletingTodoId(null)}
          onSuccess={() => {
            setDeletingTodoId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
