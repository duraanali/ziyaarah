import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    // Get basic trip details
    const trip = await convex.query(api.trips.getById, { tripId });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Get trip members
    const members = await convex.query(api.trips.getMembers, { tripId });

    // Get rituals with their steps
    const ritualsWithSteps = await convex.query(api.rituals.getByTrip, {
      tripId,
    });

    // Get packing items
    const packingItems = await convex.query(api.packing.getByTrip, { tripId });

    // Combine all data
    const tripDetails = {
      ...trip,
      members,
      rituals: ritualsWithSteps,
      packing: packingItems,
    };

    return NextResponse.json(tripDetails);
  } catch (error) {
    console.error("Error in GET /api/trips/[tripId]:", error);
    if (error.message === "Trip not found") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (error.message === "Not a member of this trip") {
      return NextResponse.json(
        { error: "Not a member of this trip" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Failed to get trip details" },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const body = await req.json();
    const { name, start_date, end_date, group_code } = body;

    const result = await convex.mutation(api.trips.update, {
      id: tripId,
      name,
      start_date,
      end_date,
      group_code,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PUT /api/trips/[tripId]:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const result = await convex.mutation(api.trips.remove, { id: tripId });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/trips/[tripId]:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
});
