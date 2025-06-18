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

    const { categoryId } = params;
    const items = await convex.query(api.packing.getItems, { categoryId });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[ITEMS_GET]", error);
    return NextResponse.json({ error: "Failed to get items" }, { status: 500 });
  }
});

export const POST = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { categoryId } = params;
    const body = await req.json();
    const { name, quantity, essential } = body;

    if (!name || essential === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const item = await convex.mutation(api.packing.createItem, {
      categoryId,
      name,
      quantity,
      essential,
      userId: req.user.id,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[ITEMS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
});
