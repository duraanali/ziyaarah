import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    avatarUrl: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_email", ["email"]),

  trips: defineTable({
    name: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    group_code: v.optional(v.string()),
    created_at: v.number(),
    created_by: v.string(),
  }).index("by_creator", ["created_by"]),

  packing_items: defineTable({
    trip_id: v.string(),
    name: v.string(),
    note: v.optional(v.string()),
    checked: v.boolean(),
    created_by: v.string(),
    created_at: v.number(),
  }).index("by_trip", ["trip_id"]),

  checkpoints: defineTable({
    trip_id: v.string(),
    title: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    created_by: v.string(),
    created_at: v.number(),
  }).index("by_trip", ["trip_id"]),

  trip_members: defineTable({
    trip_id: v.string(),
    user_id: v.string(),
    role: v.string(),
    joined_at: v.number(),
  })
    .index("by_trip", ["trip_id"])
    .index("by_user", ["user_id"]),
});
