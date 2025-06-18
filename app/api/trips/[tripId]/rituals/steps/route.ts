import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const POST = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    // Get ritualId from the URL
    const { searchParams } = new URL(req.url);
    const ritualId = searchParams.get("ritualId");
    if (!ritualId) {
      return NextResponse.json({ error: "Missing ritualId" }, { status: 400 });
    }

    const body = await req.json();
    const { title, type, order } = body;

    if (!title || !type || order === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const step = await convex.mutation(api.ritualSteps.create, {
      ritualId,
      title,
      type,
      order,
      userId: req.user.id,
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("[STEPS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create step" },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    const body = await req.json();
    const { stepId, completed } = body;

    if (!stepId || completed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const step = await convex.mutation(api.ritualSteps.updateCompletion, {
      stepId,
      completed,
      userId: req.user.id,
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("[STEPS_PUT]", error);
    return NextResponse.json(
      { error: "Failed to update step" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { tripId } = params;
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    let stepId;
    try {
      const body = await req.json();
      stepId = body.stepId;
    } catch (error) {
      // If JSON parsing fails, try getting stepId from URL params
      const { searchParams } = new URL(req.url);
      stepId = searchParams.get("stepId");
    }

    if (!stepId) {
      return NextResponse.json(
        { error: "Missing stepId in request body or URL parameters" },
        { status: 400 }
      );
    }

    await convex.mutation(api.ritualSteps.remove, {
      stepId,
      userId: req.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STEPS_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete step" },
      { status: 500 }
    );
  }
});
