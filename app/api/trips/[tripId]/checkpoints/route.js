import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const POST = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { tripId } = params;
    const body = await req.json();
    const { title, type, description } = body;
    const user_id = req.user.id;

    console.log("Received request to add checkpoint:", {
      tripId,
      body,
      user_id,
    });

    if (!title) {
      console.log("Missing required field: title");
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!type) {
      console.log("Missing required field: type");
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    console.log("Adding checkpoint to Convex:", {
      trip_id: tripId,
      title,
      type,
      description,
      user_id,
    });

    const checkpointId = await convex.mutation(api.checkpoints.add, {
      trip_id: tripId,
      title,
      type,
      description,
      user_id,
    });

    console.log(
      "Successfully added checkpoint, fetching details for ID:",
      checkpointId
    );

    // Get the created checkpoint
    const checkpoint = await convex.query(api.checkpoints.getById, {
      id: checkpointId,
    });

    console.log("Successfully retrieved checkpoint details:", checkpoint);
    return NextResponse.json(checkpoint);
  } catch (error) {
    console.error("Error in POST /api/trips/[tripId]/checkpoints:", error);

    // Log the full error details
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.message === "Not a member of this trip") {
      return NextResponse.json(
        { error: "Not a member of this trip" },
        { status: 403 }
      );
    }

    if (error.message === "Trip not found") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to add checkpoint" },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { searchParams } = new URL(req.url);
    const checkpointId = searchParams.get("checkpointId");
    const { completed } = await req.json();
    const user_id = req.user.id;

    if (!checkpointId) {
      return NextResponse.json(
        { error: "Checkpoint ID is required" },
        { status: 400 }
      );
    }

    console.log("Toggling checkpoint completion:", {
      checkpointId,
      completed,
      user_id,
    });

    if (typeof completed !== "boolean") {
      console.log("Invalid completed value:", completed);
      return NextResponse.json(
        { error: "Completed status is required and must be a boolean" },
        { status: 400 }
      );
    }

    // First get the checkpoint to verify it exists
    const checkpoint = await convex.query(api.checkpoints.getById, {
      id: checkpointId,
    });
    if (!checkpoint) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // Then toggle the completion status
    const result = await convex.mutation(api.checkpoints.toggleComplete, {
      id: checkpointId,
      completed,
      user_id,
    });

    console.log("Successfully toggled completion status:", result);

    // Get the updated checkpoint
    const updatedCheckpoint = await convex.query(api.checkpoints.getById, {
      id: checkpointId,
    });

    return NextResponse.json(updatedCheckpoint);
  } catch (error) {
    console.error("Error in PUT /api/trips/[tripId]/checkpoints:", error);

    if (error.message === "Checkpoint not found") {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    if (error.message === "Not a member of this trip") {
      return NextResponse.json(
        { error: "Not a member of this trip" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to toggle completion status" },
      { status: 500 }
    );
  }
});
