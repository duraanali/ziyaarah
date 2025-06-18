import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByTrip = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    const stages = await ctx.db
      .query("trip_stages")
      .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
      .order("asc")
      .collect();

    return stages;
  },
});

export const create = mutation({
  args: {
    tripId: v.string(),
    title: v.string(),
    description: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const stageId = await ctx.db.insert("trip_stages", {
      trip_id: args.tripId,
      title: args.title,
      description: args.description,
      order: args.order,
      created_at: Date.now(),
    });

    return await ctx.db.get(stageId);
  },
});

export const update = mutation({
  args: {
    stageId: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const stage = await ctx.db.get(args.stageId);
    if (!stage) {
      throw new Error("Stage not found");
    }

    const updates = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args.stageId, updates);

    return await ctx.db.get(args.stageId);
  },
});

export const remove = mutation({
  args: {
    stageId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const stage = await ctx.db.get(args.stageId);
    if (!stage) {
      throw new Error("Stage not found");
    }

    await ctx.db.delete(args.stageId);
  },
});
