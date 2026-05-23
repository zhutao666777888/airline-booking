import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "DF";
  for (let i = 0; i < 5; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// Create a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, passengerName, passengerEmail } = body;

    if (!scheduleId || !passengerName || !passengerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: scheduleId, passengerName, passengerEmail" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("airline");
    const collection = db.collection("schedules");

    const schedule = await collection.findOne({ _id: new ObjectId(scheduleId) });

    if (!schedule) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    const currentBookings = schedule.bookings || [];
    if (currentBookings.length >= schedule.capacity) {
      return NextResponse.json(
        { error: "This flight is fully booked" },
        { status: 409 }
      );
    }

    const bookingRef = generateBookingRef();
    const booking = {
      bookingRef,
      passengerName,
      passengerEmail,
      bookedAt: new Date().toISOString(),
    };

    await collection.updateOne(
      { _id: new ObjectId(scheduleId) },
      { $push: { bookings: booking } } as any
    );

    return NextResponse.json({
      success: true,
      bookingRef,
      flight: {
        flightNumber: schedule.flightNumber,
        origin: schedule.origin,
        destination: schedule.destination,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        aircraft: schedule.aircraft,
        price: schedule.price,
      },
      passenger: { passengerName, passengerEmail },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// Get bookings by email or booking reference
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const ref = searchParams.get("ref");

    if (!email && !ref) {
      return NextResponse.json(
        { error: "Provide email or ref parameter" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("airline");
    const collection = db.collection("schedules");

    let query: Record<string, unknown> = {};
    if (email) {
      query = { "bookings.passengerEmail": email };
    } else if (ref) {
      query = { "bookings.bookingRef": ref };
    }

    const schedules = await collection.find(query).toArray();

    const results = schedules.flatMap((schedule) => {
      const matchingBookings = schedule.bookings.filter(
        (b: { passengerEmail: string; bookingRef: string }) =>
          (email && b.passengerEmail === email) ||
          (ref && b.bookingRef === ref)
      );
      return matchingBookings.map((booking: { bookingRef: string; passengerName: string; passengerEmail: string; bookedAt: string }) => ({
        bookingRef: booking.bookingRef,
        passengerName: booking.passengerName,
        passengerEmail: booking.passengerEmail,
        bookedAt: booking.bookedAt,
        flight: {
          _id: schedule._id,
          flightNumber: schedule.flightNumber,
          origin: schedule.origin,
          destination: schedule.destination,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          aircraft: schedule.aircraft,
          price: schedule.price,
        },
      }));
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
