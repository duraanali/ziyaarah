import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

// Create a new trip
export const POST = withAuth(async (req) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const body = await req.json();
    const { name, start_date, end_date } = body;

    if (!name || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating trip with data:", {
      name,
      start_date,
      end_date,
      created_at: Date.now(),
      created_by: req.user.id,
    });

    const trip = await convex.mutation(api.trips.create, {
      name,
      start_date,
      end_date,
      created_at: Date.now(),
      created_by: req.user.id,
    });

    console.log("Trip created successfully:", trip);
    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error in POST /api/trips:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
});

// Get all trips for current user
export const GET = withAuth(async (req) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    console.log("Fetching trips for user:", req.user.id);
    const trips = await convex.query(api.trips.list, {
      user_id: req.user.id,
    });

    console.log("Found trips:", trips.length);
    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error in GET /api/trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
});
