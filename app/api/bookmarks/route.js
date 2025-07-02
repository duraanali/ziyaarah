import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

// Get user's bookmarked resources
export const GET = withAuth(async (req) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const bookmarkedResources = await convex.query(api.resources.getBookmarks, {
      userId: req.user.id,
    });

    return NextResponse.json(bookmarkedResources);
  } catch (error) {
    console.error("Error in GET /api/bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
});
