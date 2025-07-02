import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (req) => {
  try {
    const token = req.headers.get("authorization").split(" ")[1];
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      auth: token,
    });

    console.log("Fetching trips with rituals for user:", req.user.id);

    // Get all trips for the user
    const trips = await convex.query(api.trips.list, {
      user_id: req.user.id,
    });

    console.log("Found trips:", trips.length);

    // For each trip, get its rituals with steps
    const tripsWithRituals = await Promise.all(
      trips.map(async (trip) => {
        try {
          const ritualsWithSteps = await convex.query(api.rituals.getByTrip, {
            tripId: trip._id,
          });

          return {
            ...trip,
            rituals: ritualsWithSteps,
          };
        } catch (error) {
          console.error(`Error fetching rituals for trip ${trip._id}:`, error);
          // Return trip without rituals if there's an error
          return {
            ...trip,
            rituals: [],
          };
        }
      })
    );

    console.log("Successfully fetched trips with rituals");
    return NextResponse.json(tripsWithRituals);
  } catch (error) {
    console.error("Error in GET /api/trips/with-rituals:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips with rituals" },
      { status: 500 }
    );
  }
});
