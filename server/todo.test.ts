import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTodoContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("todo procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("input validation", () => {
    it("validates title is required for create", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.todo.create({
          title: "",
          description: "Test description",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("validates title is required for update", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.todo.update({
          id: 1,
          title: "",
          description: "Test description",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("validates status enum for updateStatus", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.todo.updateStatus({
          id: 1,
          status: "invalid" as any,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("requires id for delete", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.todo.delete({} as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("authorization & ownership", () => {
    it("returns not found when updating todo from different user", async () => {
      const ctx = createTodoContext(1);
      const caller = appRouter.createCaller(ctx);

      vi.spyOn(db, "getTodoById").mockResolvedValueOnce(undefined);

      try {
        await caller.todo.update({
          id: 1,
          title: "Updated Title",
        });
        expect.fail("Should have thrown not found error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
        expect(error.message).toContain("unauthorized");
      }
    });

    it("returns not found when updating status of todo from different user", async () => {
      const ctx = createTodoContext(1);
      const caller = appRouter.createCaller(ctx);

      vi.spyOn(db, "getTodoById").mockResolvedValueOnce(undefined);

      try {
        await caller.todo.updateStatus({
          id: 1,
          status: "completed",
        });
        expect.fail("Should have thrown not found error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });

    it("returns not found when deleting todo from different user", async () => {
      const ctx = createTodoContext(1);
      const caller = appRouter.createCaller(ctx);

      vi.spyOn(db, "getTodoById").mockResolvedValueOnce(undefined);

      try {
        await caller.todo.delete({
          id: 1,
        });
        expect.fail("Should have thrown not found error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("successful operations", () => {
    it("creates a todo with title and description", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      vi.spyOn(db, "createTodo").mockResolvedValueOnce({ insertId: 1 } as any);

      const result = await caller.todo.create({
        title: "Test Todo",
        description: "Test Description",
      });

      expect(result.success).toBe(true);
      expect(db.createTodo).toHaveBeenCalledWith(ctx.user.id, "Test Todo", "Test Description");
    });

    it("creates a todo with title only", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      vi.spyOn(db, "createTodo").mockResolvedValueOnce({ insertId: 1 } as any);

      const result = await caller.todo.create({
        title: "Test Todo",
      });

      expect(result.success).toBe(true);
      expect(db.createTodo).toHaveBeenCalledWith(ctx.user.id, "Test Todo", undefined);
    });

    it("updates a todo successfully", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      const mockTodo = { id: 1, userId: ctx.user.id, title: "Old", description: null, status: "pending", createdAt: new Date(), updatedAt: new Date() };
      vi.spyOn(db, "getTodoById").mockResolvedValueOnce(mockTodo as any);
      vi.spyOn(db, "updateTodo").mockResolvedValueOnce({} as any);

      const result = await caller.todo.update({
        id: 1,
        title: "Updated Title",
        description: "Updated Description",
      });

      expect(result.success).toBe(true);
      expect(db.updateTodo).toHaveBeenCalledWith(1, ctx.user.id, "Updated Title", "Updated Description");
    });

    it("updates todo status successfully", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      const mockTodo = { id: 1, userId: ctx.user.id, title: "Test", description: null, status: "pending", createdAt: new Date(), updatedAt: new Date() };
      vi.spyOn(db, "getTodoById").mockResolvedValueOnce(mockTodo as any);
      vi.spyOn(db, "updateTodoStatus").mockResolvedValueOnce({} as any);

      const result = await caller.todo.updateStatus({
        id: 1,
        status: "completed",
      });

      expect(result.success).toBe(true);
      expect(db.updateTodoStatus).toHaveBeenCalledWith(1, ctx.user.id, "completed");
    });

    it("deletes a todo successfully", async () => {
      const ctx = createTodoContext();
      const caller = appRouter.createCaller(ctx);

      const mockTodo = { id: 1, userId: ctx.user.id, title: "Test", description: null, status: "pending", createdAt: new Date(), updatedAt: new Date() };
      vi.spyOn(db, "getTodoById").mockResolvedValueOnce(mockTodo as any);
      vi.spyOn(db, "deleteTodo").mockResolvedValueOnce({} as any);

      const result = await caller.todo.delete({
        id: 1,
      });

      expect(result.success).toBe(true);
      expect(db.deleteTodo).toHaveBeenCalledWith(1, ctx.user.id);
    });

    it("lists todos for current user", async () => {
      const ctx = createTodoContext(1);
      const caller = appRouter.createCaller(ctx);

      const mockTodos = [
        { id: 1, userId: 1, title: "Todo 1", description: null, status: "pending", createdAt: new Date(), updatedAt: new Date() },
        { id: 2, userId: 1, title: "Todo 2", description: null, status: "completed", createdAt: new Date(), updatedAt: new Date() },
      ];
      vi.spyOn(db, "getUserTodos").mockResolvedValueOnce(mockTodos as any);

      const result = await caller.todo.list();

      expect(result).toEqual(mockTodos);
      expect(db.getUserTodos).toHaveBeenCalledWith(ctx.user.id);
    });
  });
});
