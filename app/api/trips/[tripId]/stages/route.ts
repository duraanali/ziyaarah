import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stages = await convex.query(api.tripStages.getByTrip, {
      tripId: params.tripId,
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error("[STAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, order } = body;

    if (!title || !description || order === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const stage = await convex.mutation(api.tripStages.create, {
      tripId: params.tripId,
      title,
      description,
      order,
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("[STAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { stageId, title, description, order } = body;

    if (!stageId) {
      return new NextResponse("Missing stageId", { status: 400 });
    }

    const stage = await convex.mutation(api.tripStages.update, {
      stageId,
      title,
      description,
      order,
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("[STAGES_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get("stageId");

    if (!stageId) {
      return new NextResponse("Missing stageId", { status: 400 });
    }

    await convex.mutation(api.tripStages.remove, {
      stageId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STAGES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
