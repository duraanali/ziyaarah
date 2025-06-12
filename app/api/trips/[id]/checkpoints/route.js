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

    const { id } = params;
    const body = await req.json();
    const { title, type, description } = body;
    const user_id = req.user.id;

    console.log("Received request to add checkpoint:", {
      id,
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

    if (!id) {
      console.log("Missing required field: id");
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    console.log("Adding checkpoint to Convex:", {
      trip_id: id,
      title,
      type,
      description,
      user_id,
    });

    const checkpointId = await convex.mutation(api.checkpoints.add, {
      trip_id: id,
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
    console.error("Error in POST /api/trips/[id]/checkpoints:", error);

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
