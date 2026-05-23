import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const origin = searchParams.get("orig");
    const destination = searchParams.get("dest");
    const date1 = searchParams.get("date1");
    const date2 = searchParams.get("date2");

    const client = await clientPromise;
    const db = client.db("airline");
    const collection = db.collection("schedules");

    // If fetching by ID
    if (id) {
      const schedule = await collection.findOne({ _id: new ObjectId(id) });
      if (!schedule) {
        return NextResponse.json([], { status: 200 });
      }
      return NextResponse.json([schedule]);
    }

    const query: Record<string, unknown> = {};

    if (origin) query.origin = origin;
    if (destination) query.destination = destination;

    if (date1 && date2) {
      query.departureTime = {
        $gte: date1 + "T00:00:00.000Z",
        $lte: date2 + "T23:59:59.999Z",
      };
    } else if (date1) {
      query.departureTime = {
        $gte: date1 + "T00:00:00.000Z",
        $lte: date1 + "T23:59:59.999Z",
      };
    }

    const schedules = await collection
      .find(query)
      .sort({ departureTime: 1 })
      .toArray();

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
