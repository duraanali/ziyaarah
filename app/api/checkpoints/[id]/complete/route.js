import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const PUT = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { id } = params;
    const { completed } = await req.json();
    const user_id = req.user.id;

    console.log("Toggling checkpoint completion:", {
      id,
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
    const checkpoint = await convex.query(api.checkpoints.getById, { id });
    if (!checkpoint) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // Then toggle the completion status
    const result = await convex.mutation(api.checkpoints.toggleComplete, {
      id,
      completed,
      user_id,
    });

    console.log("Successfully toggled completion status:", result);

    // Get the updated checkpoint
    const updatedCheckpoint = await convex.query(api.checkpoints.getById, {
      id,
    });

    return NextResponse.json(updatedCheckpoint);
  } catch (error) {
    console.error("Error in PUT /api/checkpoints/[id]/complete:", error);

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
