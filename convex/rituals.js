import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const getByTrip = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    const rituals = await ctx.db
      .query("rituals")
      .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
      .order("asc")
      .collect();

    const ritualsWithSteps = await Promise.all(
      rituals.map(async (ritual) => {
        const steps = await ctx.db
          .query("ritual_steps")
          .withIndex("by_ritual", (q) => q.eq("ritual_id", ritual._id))
          .order("asc")
          .collect();

        return {
          ritual,
          steps,
        };
      })
    );

    return ritualsWithSteps;
  },
});

export const create = mutation({
  args: {
    tripId: v.string(),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Verify trip exists
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      const ritualId = await ctx.db.insert("rituals", {
        trip_id: args.tripId,
        title: args.title,
        description: args.description,
        order: args.order,
        created_by: args.userId,
        created_at: Date.now(),
      });

      return await ctx.db.get(ritualId);
    } catch (error) {
      console.error("Error in create ritual:", error);
      throw error;
    }
  },
});
