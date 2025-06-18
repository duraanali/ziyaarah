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

  trip_stages: defineTable({
    trip_id: v.string(),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    created_at: v.number(),
  }).index("by_trip", ["trip_id"]),

  rituals: defineTable({
    trip_id: v.string(),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    created_at: v.number(),
    created_by: v.string(),
  }).index("by_trip", ["trip_id"]),

  ritual_steps: defineTable({
    ritual_id: v.string(),
    title: v.string(),
    type: v.string(),
    completed: v.boolean(),
    order: v.number(),
    created_at: v.number(),
    created_by: v.string(),
  }).index("by_ritual", ["ritual_id"]),

  packing_categories: defineTable({
    trip_id: v.string(),
    title: v.string(),
    order: v.number(),
    created_at: v.number(),
    created_by: v.string(),
  }).index("by_trip", ["trip_id"]),

  packing_items: defineTable({
    category_id: v.string(),
    name: v.string(),
    quantity: v.optional(v.number()),
    essential: v.boolean(),
    packed: v.boolean(),
    created_at: v.number(),
    created_by: v.string(),
  }).index("by_category", ["category_id"]),

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
