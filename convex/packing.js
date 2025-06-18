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

export const getByTrip = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting packing items for trip:", args.tripId);

      const items = await ctx.db
        .query("packing_items")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .order("asc")
        .collect();

      return items;
    } catch (error) {
      console.error("Error in getByTrip query:", error);
      throw error;
    }
  },
});

// Packing Categories
export const getCategories = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting packing categories for trip:", args.tripId);

      // Get the trip
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Get all categories for the trip
      const categories = await ctx.db
        .query("packing_categories")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .order("asc")
        .collect();

      return categories;
    } catch (error) {
      console.error("Error in getCategories query:", error);
      throw error;
    }
  },
});

export const createCategory = mutation({
  args: {
    tripId: v.string(),
    title: v.string(),
    order: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Creating packing category:", {
        tripId: args.tripId,
        title: args.title,
        order: args.order,
      });

      // Get the trip
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

      // Create the category
      const categoryId = await ctx.db.insert("packing_categories", {
        trip_id: args.tripId,
        title: args.title,
        order: args.order,
        created_at: Date.now(),
        created_by: args.userId,
      });

      return await ctx.db.get(categoryId);
    } catch (error) {
      console.error("Error in createCategory mutation:", error);
      throw error;
    }
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.string(),
    title: v.optional(v.string()),
    order: v.optional(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating packing category:", {
        categoryId: args.categoryId,
        title: args.title,
        order: args.order,
      });

      // Get the category
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new ConvexError("Category not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", category.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      // Update the category
      const updates = {};
      if (args.title) updates.title = args.title;
      if (args.order !== undefined) updates.order = args.order;

      await ctx.db.patch(args.categoryId, updates);
      return await ctx.db.get(args.categoryId);
    } catch (error) {
      console.error("Error in updateCategory mutation:", error);
      throw error;
    }
  },
});

export const removeCategory = mutation({
  args: {
    categoryId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Removing packing category:", args.categoryId);

      // Get the category
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new ConvexError("Category not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", category.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      // Delete all items in the category
      const items = await ctx.db
        .query("packing_items")
        .withIndex("by_category", (q) => q.eq("category_id", args.categoryId))
        .collect();

      for (const item of items) {
        await ctx.db.delete(item._id);
      }

      // Delete the category
      await ctx.db.delete(args.categoryId);
      return { success: true };
    } catch (error) {
      console.error("Error in removeCategory mutation:", error);
      throw error;
    }
  },
});

// Packing Items
export const getItems = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting packing items for category:", args.categoryId);

      // Get the category
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new ConvexError("Category not found");
      }

      // Get all items for the category
      const items = await ctx.db
        .query("packing_items")
        .withIndex("by_category", (q) => q.eq("category_id", args.categoryId))
        .collect();

      return items;
    } catch (error) {
      console.error("Error in getItems query:", error);
      throw error;
    }
  },
});

export const createItem = mutation({
  args: {
    categoryId: v.string(),
    name: v.string(),
    quantity: v.optional(v.number()),
    essential: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Creating packing item:", {
        categoryId: args.categoryId,
        name: args.name,
        quantity: args.quantity,
        essential: args.essential,
      });

      // Get the category
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new ConvexError("Category not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", category.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      // Create the item
      const itemId = await ctx.db.insert("packing_items", {
        category_id: args.categoryId,
        name: args.name,
        quantity: args.quantity,
        essential: args.essential,
        packed: false,
        created_at: Date.now(),
        created_by: args.userId,
      });

      return await ctx.db.get(itemId);
    } catch (error) {
      console.error("Error in createItem mutation:", error);
      throw error;
    }
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.string(),
    name: v.optional(v.string()),
    quantity: v.optional(v.number()),
    essential: v.optional(v.boolean()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating packing item:", {
        itemId: args.itemId,
        name: args.name,
        quantity: args.quantity,
        essential: args.essential,
      });

      // Get the item
      const item = await ctx.db.get(args.itemId);
      if (!item) {
        throw new ConvexError("Item not found");
      }

      // Get the category
      const category = await ctx.db.get(item.category_id);
      if (!category) {
        throw new ConvexError("Category not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", category.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      // Update the item
      const updates = {};
      if (args.name) updates.name = args.name;
      if (args.quantity !== undefined) updates.quantity = args.quantity;
      if (args.essential !== undefined) updates.essential = args.essential;

      await ctx.db.patch(args.itemId, updates);
      return await ctx.db.get(args.itemId);
    } catch (error) {
      console.error("Error in updateItem mutation:", error);
      throw error;
    }
  },
});

export const toggleItemPacked = mutation({
  args: {
    itemId: v.string(),
    packed: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Toggling packing item packed status:", {
        itemId: args.itemId,
        packed: args.packed,
      });

      // Get the item
      const item = await ctx.db.get(args.itemId);
      if (!item) {
        throw new ConvexError("Item not found");
      }

      // Get the category
      const category = await ctx.db.get(item.category_id);
      if (!category) {
        throw new ConvexError("Category not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", category.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      // Update the item's packed status
      await ctx.db.patch(args.itemId, { packed: args.packed });
      return await ctx.db.get(args.itemId);
    } catch (error) {
      console.error("Error in toggleItemPacked mutation:", error);
      throw error;
    }
  },
});

export const removeItem = mutation({
  args: {
    itemId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Removing packing item:", args.itemId);

      // Get the item
      const item = await ctx.db.get(args.itemId);
      if (!item) {
        throw new ConvexError("Item not found");
      }

      // Get the category
      const category = await ctx.db.get(item.category_id);
      if (!category) {
        throw new ConvexError("Category not found");
      }

      // Verify user is a member of the trip
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", category.trip_id))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!membership) {
        throw new ConvexError("Not a member of this trip");
      }

      // Delete the item
      await ctx.db.delete(args.itemId);
      return { success: true };
    } catch (error) {
      console.error("Error in removeItem mutation:", error);
      throw error;
    }
  },
});

export const getProgress = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting packing progress for trip:", args.tripId);

      // Get the trip
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Get all categories for the trip
      const categories = await ctx.db
        .query("packing_categories")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      // Get progress for each category
      const byCategory = await Promise.all(
        categories.map(async (category) => {
          const items = await ctx.db
            .query("packing_items")
            .withIndex("by_category", (q) => q.eq("category_id", category._id))
            .collect();

          const total = items.length;
          const packed = items.filter((item) => item.packed).length;

          return {
            category: category.title,
            packed,
            total,
          };
        })
      );

      // Calculate total progress
      const totalItems = byCategory.reduce((sum, cat) => sum + cat.total, 0);
      const packedItems = byCategory.reduce((sum, cat) => sum + cat.packed, 0);
      const percentage =
        totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

      return {
        total_items: totalItems,
        packed_items: packedItems,
        percentage,
        by_category: byCategory,
      };
    } catch (error) {
      console.error("Error in getProgress query:", error);
      throw error;
    }
  },
});
