import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const POST = withAuth(async (req) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { group_code } = await req.json();
    const user_id = req.user.id;

    if (!group_code) {
      console.log("Missing group code in request");
      return NextResponse.json(
        { error: "Group code is required" },
        { status: 400 }
      );
    }

    console.log("Attempting to join trip:", {
      group_code,
      user_id,
    });

    // First join the trip
    const result = await convex.mutation(api.trips.joinByCode, {
      group_code,
      user_id,
    });

    // If result is a message, return it directly
    if (result.message) {
      return NextResponse.json(result);
    }

    // Otherwise, get the complete trip details
    const trip = await convex.query(api.trips.getById, { id: result });

    console.log("Successfully retrieved trip details");
    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error joining trip:", error);

    // Handle specific error cases
    if (error.message === "Invalid group code") {
      return NextResponse.json(
        { error: "Invalid group code" },
        { status: 400 }
      );
    }

    // Log the full error for debugging
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json({ error: "Failed to join trip" }, { status: 500 });
  }
});
