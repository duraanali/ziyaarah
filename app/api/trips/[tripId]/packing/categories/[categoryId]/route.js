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

    const { categoryId } = params;
    const body = await req.json();
    const { title, order } = body;

    if (!title && order === undefined) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const category = await convex.mutation(api.packing.updateCategory, {
      categoryId,
      title,
      order,
      userId: req.user.id,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PUT]", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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

    const { categoryId } = params;
    await convex.mutation(api.packing.removeCategory, {
      categoryId,
      userId: req.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
});
