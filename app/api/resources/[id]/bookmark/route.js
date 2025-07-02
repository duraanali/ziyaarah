import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

// Bookmark a resource
export const POST = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { id } = params;

    const bookmark = await convex.mutation(api.resources.bookmark, {
      resourceId: id,
      userId: req.user.id,
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("Error in POST /api/resources/[id]/bookmark:", error);
    if (error.message === "Resource not found") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    if (error.message === "Resource already bookmarked") {
      return NextResponse.json(
        { error: "Resource already bookmarked" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to bookmark resource" },
      { status: 500 }
    );
  }
});

// Remove bookmark
export const DELETE = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { id } = params;

    const result = await convex.mutation(api.resources.removeBookmark, {
      resourceId: id,
      userId: req.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/resources/[id]/bookmark:", error);
    if (error.message === "Bookmark not found") {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
});
