import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

// Get a single resource by ID
export const GET = async (req, { params }) => {
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const { id } = params;

    const resource = await convex.query(api.resources.getById, { id });
    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error in GET /api/resources/[id]:", error);
    if (error.message === "Resource not found") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
};

// Update a resource (admin only)
export const PUT = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { id } = params;
    const body = await req.json();

    // TODO: Add admin check here
    const resource = await convex.mutation(api.resources.update, {
      id,
      ...body,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error in PUT /api/resources/[id]:", error);
    if (error.message === "Resource not found") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
});

// Delete a resource (admin only)
export const DELETE = withAuth(async (req, { params }) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const { id } = params;

    // TODO: Add admin check here
    const result = await convex.mutation(api.resources.remove, { id });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/resources/[id]:", error);
    if (error.message === "Resource not found") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
});
