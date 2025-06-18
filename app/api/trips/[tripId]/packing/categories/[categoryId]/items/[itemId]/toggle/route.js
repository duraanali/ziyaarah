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

    const { itemId } = params;
    const body = await req.json();
    const { packed } = body;

    if (packed === undefined) {
      return NextResponse.json(
        { error: "Missing packed status" },
        { status: 400 }
      );
    }

    const item = await convex.mutation(api.packing.toggleItemPacked, {
      itemId,
      packed,
      userId: req.user.id,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[ITEM_TOGGLE]", error);
    return NextResponse.json(
      { error: "Failed to toggle item packed status" },
      { status: 500 }
    );
  }
});
