import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// List all public resources with optional filtering
export const list = query({
  args: {
    category: v.optional(v.string()),
    type: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let resources = await ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("is_public"), true))
      .collect();

    // Filter by category if provided
    if (args.category) {
      resources = resources.filter((r) => r.category === args.category);
    }

    // Filter by type if provided
    if (args.type) {
      resources = resources.filter((r) => r.type === args.type);
    }

    // Filter by search term if provided
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      resources = resources.filter((r) => {
        return (
          r.title.toLowerCase().includes(searchTerm) ||
          r.description.toLowerCase().includes(searchTerm) ||
          (r.tags &&
            r.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
        );
      });
    }

    return resources.sort((a, b) => b.created_at - a.created_at);
  },
});

// Get a single resource by ID
export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.id);
    if (!resource) {
      throw new ConvexError("Resource not found");
    }
    return resource;
  },
});

// Create a new resource (admin only)
export const create = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    category: v.string(),
    description: v.string(),
    content_url: v.string(),
    thumbnail: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    is_public: v.boolean(),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin check here
    const resourceId = await ctx.db.insert("resources", {
      ...args,
      created_at: Date.now(),
    });

    return await ctx.db.get(resourceId);
  },
});

// Update a resource (admin only)
export const update = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    type: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    content_url: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    is_public: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin check here
    const { id, ...updates } = args;

    const resource = await ctx.db.get(id);
    if (!resource) {
      throw new ConvexError("Resource not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete a resource (admin only)
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // TODO: Add admin check here
    const resource = await ctx.db.get(args.id);
    if (!resource) {
      throw new ConvexError("Resource not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Bookmark a resource
export const bookmark = mutation({
  args: {
    resourceId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if resource exists
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new ConvexError("Resource not found");
    }

    // Check if already bookmarked
    const existingBookmark = await ctx.db
      .query("resource_bookmarks")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("resource_id"), args.resourceId))
      .first();

    if (existingBookmark) {
      throw new ConvexError("Resource already bookmarked");
    }

    const bookmarkId = await ctx.db.insert("resource_bookmarks", {
      user_id: args.userId,
      resource_id: args.resourceId,
      created_at: Date.now(),
    });

    return await ctx.db.get(bookmarkId);
  },
});

// Remove bookmark
export const removeBookmark = mutation({
  args: {
    resourceId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const bookmark = await ctx.db
      .query("resource_bookmarks")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("resource_id"), args.resourceId))
      .first();

    if (!bookmark) {
      throw new ConvexError("Bookmark not found");
    }

    await ctx.db.delete(bookmark._id);
    return { success: true };
  },
});

// Get user's bookmarked resources
export const getBookmarks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("resource_bookmarks")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .collect();

    const resources = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const resource = await ctx.db.get(bookmark.resource_id);
        return resource;
      })
    );

    return resources
      .filter(Boolean)
      .sort((a, b) => b.created_at - a.created_at);
  },
});

// Check if a resource is bookmarked by user
export const isBookmarked = query({
  args: {
    resourceId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const bookmark = await ctx.db
      .query("resource_bookmarks")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("resource_id"), args.resourceId))
      .first();

    return !!bookmark;
  },
});
