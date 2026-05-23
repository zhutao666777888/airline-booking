import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingRef = searchParams.get("ref");

    if (!bookingRef) {
      return NextResponse.json(
        { error: "Missing booking reference" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("airline");
    const collection = db.collection("schedules");

    const result = await collection.updateOne(
      { "bookings.bookingRef": bookingRef },
      { $pull: { bookings: { bookingRef } } } as any
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
