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

    const { tripId } = params;
    const categories = await convex.query(api.packing.getCategories, {
      tripId,
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return NextResponse.json(
      { error: "Failed to get categories" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { tripId } = params;
    const body = await req.json();
    const { title, order } = body;

    if (!title || order === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const category = await convex.mutation(api.packing.createCategory, {
      tripId,
      title,
      order,
      userId: req.user.id,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
});
