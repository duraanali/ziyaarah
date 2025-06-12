import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const add = mutation({
  args: {
    trip_id: v.string(),
    title: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Adding checkpoint:", args);

      // Verify trip exists
      const trip = await ctx.db.get(args.trip_id);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.user_id))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      const checkpointData = {
        trip_id: args.trip_id,
        title: args.title,
        type: args.type,
        description: args.description || "",
        completed: false,
        created_by: args.user_id,
        created_at: Date.now(),
      };

      console.log("Inserting checkpoint:", checkpointData);
      const checkpointId = await ctx.db.insert("checkpoints", checkpointData);
      console.log("Successfully inserted checkpoint with ID:", checkpointId);

      return checkpointId;
    } catch (error) {
      console.error("Error in add checkpoint:", error);
      throw error;
    }
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting checkpoint by ID:", args.id);
      const checkpoint = await ctx.db.get(args.id);
      if (!checkpoint) {
        throw new ConvexError("Checkpoint not found");
      }
      return checkpoint;
    } catch (error) {
      console.error("Error in getById query:", error);
      throw error;
    }
  },
});

export const toggleComplete = mutation({
  args: {
    id: v.string(),
    completed: v.boolean(),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Toggling checkpoint completion:", args);

      // Get the checkpoint
      const checkpoint = await ctx.db.get(args.id);
      if (!checkpoint) {
        throw new ConvexError("Checkpoint not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", checkpoint.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.user_id))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      console.log("Updating checkpoint completion status:", {
        id: args.id,
        completed: args.completed,
      });
      await ctx.db.patch(args.id, { completed: args.completed });
      return { success: true };
    } catch (error) {
      console.error("Error in toggle checkpoint completion:", error);
      throw error;
    }
  },
});
