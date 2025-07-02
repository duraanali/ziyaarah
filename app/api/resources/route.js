import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

// List all public resources with optional filtering
export const GET = async (req) => {
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const resources = await convex.query(api.resources.list, {
      category: category || undefined,
      type: type || undefined,
      search: search || undefined,
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error in GET /api/resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
};

// Create a new resource (admin only)
export const POST = withAuth(async (req) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const body = await req.json();
    const {
      title,
      type,
      category,
      description,
      content_url,
      thumbnail,
      tags,
      is_public,
    } = body;

    if (!title || !type || !category || !description || !content_url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Add admin check here
    const resource = await convex.mutation(api.resources.create, {
      title,
      type,
      category,
      description,
      content_url,
      thumbnail,
      tags,
      is_public: is_public ?? true,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error in POST /api/resources:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
});
