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
    const { name, note } = body;
    const user_id = req.user.id;

    console.log("Received request to add packing item:", {
      tripId,
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

    console.log("Adding packing item to Convex:", {
      trip_id: tripId,
      name,
      note,
      user_id,
    });

    const itemId = await convex.mutation(api.packing.add, {
      trip_id: tripId,
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
    console.error("Error in POST /api/trips/[tripId]/packing:", error);

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

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const user_id = req.user.id;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    console.log("Deleting packing item:", {
      itemId,
      user_id,
    });

    const result = await convex.mutation(api.packing.remove, {
      id: itemId,
      user_id,
    });

    console.log("Successfully deleted packing item:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/trips/[tripId]/packing:", error);

    if (error.message === "Item not found") {
      return NextResponse.json(
        { error: "Packing item not found" },
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
      { error: "Failed to delete packing item" },
      { status: 500 }
    );
  }
});
