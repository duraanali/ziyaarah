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
    const { name, quantity, essential } = body;

    if (!name && quantity === undefined && essential === undefined) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const item = await convex.mutation(api.packing.updateItem, {
      itemId,
      name,
      quantity,
      essential,
      userId: req.user.id,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[ITEM_PUT]", error);
    return NextResponse.json(
      { error: "Failed to update item" },
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

    const { itemId } = params;
    await convex.mutation(api.packing.removeItem, {
      itemId,
      userId: req.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ITEM_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
});
