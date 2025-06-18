import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    created_at: v.number(),
  },
  handler: async (ctx, args) => {
    const hashedPassword = await bcrypt.hash(args.password, 10);
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: hashedPassword,
      created_at: Date.now(),
    });
    return userId;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    return user;
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

export const verifyPassword = mutation({
  args: {
    userId: v.id("users"),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return await bcrypt.compare(args.password, user.password);
  },
});

export const generateToken = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
  },
});
