import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const rituals = await convex.query(api.rituals.getByTrip, {
      tripId,
    });

    return NextResponse.json(rituals);
  } catch (error) {
    console.error("[RITUALS_GET]", error);
    return NextResponse.json(
      { error: "Failed to get rituals" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const body = await req.json();
    const { title, description, order } = body;

    if (!title || !description || order === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ritual = await convex.mutation(api.rituals.create, {
      tripId,
      title,
      description,
      order,
      userId: req.user.id,
    });

    return NextResponse.json(ritual);
  } catch (error) {
    console.error("[RITUALS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create ritual" },
      { status: 500 }
    );
  }
});
