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

    const { tripId } = params;
    const userId = req.user.id;

    console.log("Getting members for trip:", {
      tripId,
      userId,
    });

    // Get trip details to verify it exists
    const trip = await convex.query(api.trips.getById, { tripId });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Get all members for the trip
    const members = await convex.query(api.trips.getMembers, { tripId });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error in GET /api/trips/[tripId]/members:", error);

    if (error.message === "Trip not found") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to get trip members" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { tripId } = params;
    const userId = req.user.id;

    const body = await req.json();
    const { memberId, role = "member" } = body;

    if (!memberId) {
      return NextResponse.json({ error: "Missing memberId" }, { status: 400 });
    }

    // Add the member to the trip
    const member = await convex.mutation(api.trips.addMember, {
      tripId,
      memberId,
      role,
      userId,
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error in POST /api/trips/[tripId]/members:", error);

    if (error.message === "Trip not found") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (error.message === "Not authorized") {
      return NextResponse.json(
        { error: "Not authorized to add members" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { tripId } = params;
    const userId = req.user.id;

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "Missing memberId" }, { status: 400 });
    }

    // Remove the member from the trip
    await convex.mutation(api.trips.removeMember, {
      tripId,
      memberId,
      userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/trips/[tripId]/members:", error);

    if (error.message === "Trip not found") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (error.message === "Not authorized") {
      return NextResponse.json(
        { error: "Not authorized to remove members" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
});
