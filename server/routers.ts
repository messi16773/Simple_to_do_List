import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  todo: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getUserTodos(ctx.user.id)
    ),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "Title is required").max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await db.createTodo(ctx.user.id, input.title, input.description);
          return { success: true };
        } catch (error) {
          console.error("[Todo] Create failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create todo",
          });
        }
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1, "Title is required").max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const todo = await db.getTodoById(input.id, ctx.user.id);
          if (!todo) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Todo not found or unauthorized",
            });
          }
          await db.updateTodo(input.id, ctx.user.id, input.title, input.description);
          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Todo] Update failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update todo",
          });
        }
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const todo = await db.getTodoById(input.id, ctx.user.id);
          if (!todo) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Todo not found or unauthorized",
            });
          }
          await db.updateTodoStatus(input.id, ctx.user.id, input.status);
          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Todo] Status update failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update todo status",
          });
        }
      }),
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const todo = await db.getTodoById(input.id, ctx.user.id);
          if (!todo) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Todo not found or unauthorized",
            });
          }
          await db.deleteTodo(input.id, ctx.user.id);
          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Todo] Delete failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete todo",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
