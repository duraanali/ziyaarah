import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const add = mutation({
  args: {
    trip_id: v.string(),
    name: v.string(),
    note: v.optional(v.string()),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Adding packing item:", args);

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

      const itemData = {
        trip_id: args.trip_id,
        name: args.name,
        note: args.note || "",
        checked: false,
        created_by: args.user_id,
        created_at: Date.now(),
      };

      console.log("Inserting packing item:", itemData);
      const itemId = await ctx.db.insert("packing_items", itemData);
      console.log("Successfully inserted packing item with ID:", itemId);

      return itemId;
    } catch (error) {
      console.error("Error in add packing item:", error);
      throw error;
    }
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting packing item by ID:", args.id);
      const item = await ctx.db.get(args.id);
      if (!item) {
        throw new ConvexError("Item not found");
      }
      return item;
    } catch (error) {
      console.error("Error in getById query:", error);
      throw error;
    }
  },
});

export const toggleCheck = mutation({
  args: {
    id: v.string(),
    checked: v.boolean(),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Toggling packing item check:", args);

      // Get the item
      const item = await ctx.db.get(args.id);
      if (!item) {
        throw new ConvexError("Item not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", item.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.user_id))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      console.log("Updating item check status:", {
        id: args.id,
        checked: args.checked,
      });
      await ctx.db.patch(args.id, { checked: args.checked });
      return { success: true };
    } catch (error) {
      console.error("Error in toggle packing item check:", error);
      throw error;
    }
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Removing packing item:", args);

      // Get the item
      const item = await ctx.db.get(args.id);
      if (!item) {
        throw new ConvexError("Item not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", item.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.user_id))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      console.log("Deleting item:", args.id);
      await ctx.db.delete(args.id);
      return { success: true };
    } catch (error) {
      console.error("Error in remove packing item:", error);
      throw error;
    }
  },
});
