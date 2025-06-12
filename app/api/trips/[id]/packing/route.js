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
    const { name, note } = body;
    const user_id = req.user.id;

    console.log("Received request to add packing item:", {
      id,
      body,
      user_id,
    });

    if (!name) {
      console.log("Missing required field: name");
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    if (!id) {
      console.log("Missing required field: id");
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    console.log("Adding packing item to Convex:", {
      trip_id: id,
      name,
      note,
      user_id,
    });

    const itemId = await convex.mutation(api.packing.add, {
      trip_id: id,
      name,
      note,
      user_id,
    });

    console.log(
      "Successfully added packing item, fetching details for ID:",
      itemId
    );

    // Get the created item
    const item = await convex.query(api.packing.getById, { id: itemId });

    console.log("Successfully retrieved item details:", item);
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error in POST /api/trips/[id]/packing:", error);

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
      { error: "Failed to add packing item" },
      { status: 500 }
    );
  }
});
