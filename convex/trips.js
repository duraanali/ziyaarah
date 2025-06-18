import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Helper function to generate group code
function generateGroupCode() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ZIYAA${year}${randomNum}`;
}

export const create = mutation({
  args: {
    name: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    created_at: v.number(),
    created_by: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Creating trip with args:", args);

      // Generate unique group code
      const group_code = generateGroupCode();
      console.log("Generated group code:", group_code);

      const tripData = {
        name: args.name,
        start_date: args.start_date,
        end_date: args.end_date,
        created_at: args.created_at,
        created_by: args.created_by,
        group_code,
      };

      console.log("Inserting trip data:", tripData);
      const tripId = await ctx.db.insert("trips", tripData);
      console.log("Trip inserted with ID:", tripId);

      // Add creator as trip member with owner role
      const memberData = {
        trip_id: tripId,
        user_id: args.created_by,
        role: "owner",
        joined_at: Date.now(),
      };
      await ctx.db.insert("trip_members", memberData);

      // Return the complete trip data including the group code
      const trip = await ctx.db.get(tripId);
      return trip;
    } catch (error) {
      console.error("Error in create trip mutation:", error);
      throw error;
    }
  },
});

export const update = mutation({
  args: {
    tripId: v.string(),
    name: v.optional(v.string()),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
    group_code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating trip:", args.tripId);

      // Get the trip
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Check if user is the owner
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .filter((q) => q.eq(q.field("user_id"), trip.created_by))
        .first();

      if (!membership || membership.role !== "owner") {
        throw new ConvexError("Only trip owner can update trip details");
      }

      // Update trip fields
      const updates = {};
      if (args.name) updates.name = args.name;
      if (args.start_date) updates.start_date = args.start_date;
      if (args.end_date) updates.end_date = args.end_date;
      if (args.group_code !== undefined) updates.group_code = args.group_code;

      await ctx.db.patch(args.tripId, updates);
      return { success: true };
    } catch (error) {
      console.error("Error in update trip mutation:", error);
      throw error;
    }
  },
});

export const remove = mutation({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Deleting trip:", args.tripId);

      // Get the trip
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Check if user is the owner
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .filter((q) => q.eq(q.field("user_id"), trip.created_by))
        .first();

      if (!membership || membership.role !== "owner") {
        throw new ConvexError("Only trip owner can delete trip");
      }

      // Delete all related data
      // 1. Delete trip members
      const members = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      for (const member of members) {
        await ctx.db.delete(member._id);
      }

      // 2. Delete packing items
      const packingItems = await ctx.db
        .query("packing_items")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      for (const item of packingItems) {
        await ctx.db.delete(item._id);
      }

      // 3. Delete checkpoints
      const checkpoints = await ctx.db
        .query("checkpoints")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      for (const checkpoint of checkpoints) {
        await ctx.db.delete(checkpoint._id);
      }

      // 4. Finally, delete the trip
      await ctx.db.delete(args.tripId);

      return { success: true };
    } catch (error) {
      console.error("Error in delete trip mutation:", error);
      throw error;
    }
  },
});

export const list = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Listing trips for user:", args.user_id);

      // Get all trips where user is a member
      const memberships = await ctx.db
        .query("trip_members")
        .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
        .collect();

      console.log("Found memberships:", memberships.length);

      const tripIds = memberships.map((m) => m.trip_id);
      const trips = await Promise.all(tripIds.map((id) => ctx.db.get(id)));

      console.log("Found trips:", trips.length);
      return trips;
    } catch (error) {
      console.error("Error in list trips query:", error);
      throw error;
    }
  },
});

export const getById = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting trip by ID:", args.tripId);

      // Get trip details
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Get packing items
      const packingItems = await ctx.db
        .query("packing_items")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      // Get checkpoints
      const checkpoints = await ctx.db
        .query("checkpoints")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      // Get members
      const members = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      // Get member details
      const memberDetails = await Promise.all(
        members.map(async (member) => {
          const user = await ctx.db.get(member.user_id);
          return {
            id: member.user_id,
            name: user.name,
            role: member.role,
            joined_at: member.joined_at,
          };
        })
      );

      return {
        ...trip,
        packing_items: packingItems,
        checkpoints,
        members: memberDetails,
      };
    } catch (error) {
      console.error("Error in getById query:", error);
      throw error;
    }
  },
});

export const joinByCode = mutation({
  args: {
    group_code: v.string(),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(
        "Joining trip with code:",
        args.group_code,
        "for user:",
        args.user_id
      );

      // Find trip by group code
      const trip = await ctx.db
        .query("trips")
        .filter((q) => q.eq(q.field("group_code"), args.group_code))
        .first();

      if (!trip) {
        console.log("No trip found with group code:", args.group_code);
        throw new ConvexError("Invalid group code");
      }

      // Check if user is already a member
      const existingMembership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", trip._id))
        .filter((q) => q.eq(q.field("user_id"), args.user_id))
        .first();

      if (existingMembership) {
        console.log("User already a member of trip:", trip._id);
        return { message: "You are already part of this trip" };
      }

      // Add user as member
      const memberData = {
        trip_id: trip._id,
        user_id: args.user_id,
        role: "member",
        joined_at: Date.now(),
      };

      console.log("Adding user as member:", memberData);
      await ctx.db.insert("trip_members", memberData);

      return trip._id;
    } catch (error) {
      console.error("Error in joinByCode mutation:", error);
      throw error;
    }
  },
});

export const getMembers = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Getting members for trip:", args.tripId);

      // Get the trip
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Get all members for the trip
      const members = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .collect();

      // Get user details for each member
      const membersWithDetails = await Promise.all(
        members.map(async (member) => {
          const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", member.user_id))
            .first();
          return {
            ...member,
            user: user
              ? {
                  name: user.name,
                  email: user.email,
                  avatarUrl: user.avatarUrl,
                }
              : null,
          };
        })
      );

      return membersWithDetails;
    } catch (error) {
      console.error("Error in getMembers query:", error);
      throw error;
    }
  },
});

export const addMember = mutation({
  args: {
    tripId: v.string(),
    memberId: v.string(),
    role: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Adding member to trip:", {
        tripId: args.tripId,
        memberId: args.memberId,
        role: args.role,
        userId: args.userId,
      });

      // Get the trip
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Verify the requesting user is a member of the trip
      const requesterMembership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!requesterMembership) {
        throw new ConvexError("Not authorized");
      }

      // Check if the new member is already a member
      const existingMembership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .filter((q) => q.eq(q.field("user_id"), args.memberId))
        .first();

      if (existingMembership) {
        throw new ConvexError("User is already a member of this trip");
      }

      // Add the new member
      const memberId = await ctx.db.insert("trip_members", {
        trip_id: args.tripId,
        user_id: args.memberId,
        role: args.role,
        joined_at: Date.now(),
      });

      return await ctx.db.get(memberId);
    } catch (error) {
      console.error("Error in addMember mutation:", error);
      throw error;
    }
  },
});

export const removeMember = mutation({
  args: {
    tripId: v.string(),
    memberId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Removing member from trip:", {
        tripId: args.tripId,
        memberId: args.memberId,
        userId: args.userId,
      });

      // Get the trip
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError("Trip not found");
      }

      // Verify the requesting user is the trip owner
      const requesterMembership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .filter((q) => q.eq(q.field("user_id"), args.userId))
        .first();

      if (!requesterMembership || requesterMembership.role !== "owner") {
        throw new ConvexError("Not authorized");
      }

      // Find the member to remove
      const memberToRemove = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("trip_id", args.tripId))
        .filter((q) => q.eq(q.field("user_id"), args.memberId))
        .first();

      if (!memberToRemove) {
        throw new ConvexError("Member not found");
      }

      // Don't allow removing the owner
      if (memberToRemove.role === "owner") {
        throw new ConvexError("Cannot remove trip owner");
      }

      // Remove the member
      await ctx.db.delete(memberToRemove._id);
      return { success: true };
    } catch (error) {
      console.error("Error in removeMember mutation:", error);
      throw error;
    }
  },
});
