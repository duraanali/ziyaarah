import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { id } = params;
    const user_id = req.user.id;

    console.log("Deleting packing item:", {
      id,
      user_id,
    });

    const result = await convex.mutation(api.packing.remove, {
      id,
      user_id,
    });

    console.log("Successfully deleted packing item:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/packing/[id]:", error);

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
