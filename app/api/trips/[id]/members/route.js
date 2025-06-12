import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { id } = params;
    const user_id = req.user.id;

    console.log("Getting members for trip:", {
      trip_id: id,
      user_id,
    });

    // Get trip details to verify it exists
    const trip = await convex.query(api.trips.getById, { id });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Return the members array from the trip details
    return NextResponse.json(trip.members);
  } catch (error) {
    console.error("Error in GET /api/trips/[id]/members:", error);

    if (error.message === "Trip not found") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to get trip members" },
      { status: 500 }
    );
  }
});
