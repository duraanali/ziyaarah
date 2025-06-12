import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const trip = await convex.query(api.trips.getById, { id });
    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error in GET /api/trips/[id]:", error);
    return NextResponse.json({ error: "Failed to get trip" }, { status: 500 });
  }
});

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const body = await req.json();
    const { name, start_date, end_date, group_code } = body;

    const result = await convex.mutation(api.trips.update, {
      id,
      name,
      start_date,
      end_date,
      group_code,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PUT /api/trips/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const result = await convex.mutation(api.trips.remove, { id });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/trips/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
});
