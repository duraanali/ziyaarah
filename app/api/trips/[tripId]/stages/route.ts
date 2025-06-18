import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const GET = withAuth(
  async (req: Request, { params }: { params: { tripId: string } }) => {
    try {
      const stages = await convex.query(api.tripStages.getByTrip, {
        tripId: params.tripId,
      });
      return NextResponse.json(stages);
    } catch (error) {
      console.error("Error fetching stages:", error);
      return NextResponse.json(
        { error: "Failed to fetch stages" },
        { status: 500 }
      );
    }
  }
);

export const POST = withAuth(
  async (req: Request, { params }: { params: { tripId: string } }) => {
    try {
      const body = await req.json();
      const { title, description, order } = body;

      if (!title || !order) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const stage = await convex.mutation(api.tripStages.create, {
        tripId: params.tripId,
        title,
        description,
        order,
      });

      return NextResponse.json(stage);
    } catch (error) {
      console.error("Error creating stage:", error);
      return NextResponse.json(
        { error: "Failed to create stage" },
        { status: 500 }
      );
    }
  }
);

export const PUT = withAuth(
  async (req: Request, { params }: { params: { tripId: string } }) => {
    try {
      const body = await req.json();
      const { stageId, title, description, order } = body;

      if (!stageId) {
        return NextResponse.json(
          { error: "Missing stage ID" },
          { status: 400 }
        );
      }

      if (!title && !description && order === undefined) {
        return NextResponse.json(
          { error: "No fields to update" },
          { status: 400 }
        );
      }

      const stage = await convex.mutation(api.tripStages.update, {
        stageId,
        title,
        description,
        order,
      });

      return NextResponse.json(stage);
    } catch (error) {
      console.error("Error updating stage:", error);
      return NextResponse.json(
        { error: "Failed to update stage" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withAuth(
  async (req: Request, { params }: { params: { tripId: string } }) => {
    try {
      const { searchParams } = new URL(req.url);
      const stageId = searchParams.get("stageId");

      if (!stageId) {
        return NextResponse.json(
          { error: "Missing stage ID" },
          { status: 400 }
        );
      }

      await convex.mutation(api.tripStages.remove, { stageId });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting stage:", error);
      return NextResponse.json(
        { error: "Failed to delete stage" },
        { status: 500 }
      );
    }
  }
);
