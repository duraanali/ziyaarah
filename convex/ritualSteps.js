import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const getByRitual = query({
  args: { ritualId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting steps for ritual:", args.ritualId);

      const steps = await ctx.db
        .query("ritual_steps")
        .withIndex("by_ritual", (q) => q.eq("ritual_id", args.ritualId))
        .order("asc")
        .collect();

      return steps;
    } catch (error) {
      console.error("Error in getByRitual query:", error);
      throw error;
    }
  },
});

export const create = mutation({
  args: {
    ritualId: v.string(),
    title: v.string(),
    type: v.string(),
    order: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the ritual
      const ritual = await ctx.db.get(args.ritualId);
      if (!ritual) {
        throw new ConvexError("Ritual not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", ritual.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      const stepId = await ctx.db.insert("ritual_steps", {
        ritual_id: args.ritualId,
        title: args.title,
        type: args.type,
        completed: false,
        order: args.order,
        created_by: args.userId,
        created_at: Date.now(),
      });

      return await ctx.db.get(stepId);
    } catch (error) {
      console.error("Error in create step:", error);
      throw error;
    }
  },
});

export const updateCompletion = mutation({
  args: {
    stepId: v.string(),
    completed: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the step
      const step = await ctx.db.get(args.stepId);
      if (!step) {
        throw new ConvexError("Step not found");
      }

      // Get the ritual
      const ritual = await ctx.db.get(step.ritual_id);
      if (!ritual) {
        throw new ConvexError("Ritual not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", ritual.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      await ctx.db.patch(args.stepId, {
        completed: args.completed,
      });

      return await ctx.db.get(args.stepId);
    } catch (error) {
      console.error("Error in update step completion:", error);
      throw error;
    }
  },
});

export const remove = mutation({
  args: {
    stepId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the step
      const step = await ctx.db.get(args.stepId);
      if (!step) {
        throw new ConvexError("Step not found");
      }

      // Get the ritual
      const ritual = await ctx.db.get(step.ritual_id);
      if (!ritual) {
        throw new ConvexError("Ritual not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", ritual.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      await ctx.db.delete(args.stepId);
      return { success: true };
    } catch (error) {
      console.error("Error in remove step:", error);
      throw error;
    }
  },
});
