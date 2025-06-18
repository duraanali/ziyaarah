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
    const progress = await convex.query(api.packing.getProgress, { tripId });
    return NextResponse.json(progress);
  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    return NextResponse.json(
      { error: "Failed to get packing progress" },
      { status: 500 }
    );
  }
});
