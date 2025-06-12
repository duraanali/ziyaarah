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
    const { checked } = await req.json();
    const user_id = req.user.id;

    console.log("Toggling packing item check:", {
      id,
      checked,
      user_id,
    });

    if (typeof checked !== "boolean") {
      console.log("Invalid checked value:", checked);
      return NextResponse.json(
        { error: "Checked status is required and must be a boolean" },
        { status: 400 }
      );
    }

    // First get the item to verify it exists
    const item = await convex.query(api.packing.getById, { id });
    if (!item) {
      return NextResponse.json(
        { error: "Packing item not found" },
        { status: 404 }
      );
    }

    // Then toggle the check status
    const result = await convex.mutation(api.packing.toggleCheck, {
      id,
      checked,
      user_id,
    });

    console.log("Successfully toggled check status:", result);

    // Get the updated item
    const updatedItem = await convex.query(api.packing.getById, { id });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error in PUT /api/packing/[id]/check:", error);

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
      { error: "Failed to toggle check status" },
      { status: 500 }
    );
  }
});
