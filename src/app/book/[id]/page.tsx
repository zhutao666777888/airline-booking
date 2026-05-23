"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface FlightDetails {
  _id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  aircraft: string;
  capacity: number;
  departureTime: string;
  arrivalTime: string;
  price: number;
  bookings: { bookingRef: string }[];
}

interface BookingConfirmation {
  bookingRef: string;
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    aircraft: string;
    price: number;
  };
  passenger: {
    passengerName: string;
    passengerEmail: string;
  };
}

interface Airport {
  code: string;
  city: string;
}

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const [flight, setFlight] = useState<FlightDetails | null>(null);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    fetch("/api/airports")
      .then((res) => res.json())
      .then(setAirports);

    // Fetch flight details
    fetch(`/api/schedules?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFlight(data[0]);
        }
      });
  }, [params.id]);

  const getCity = (code: string) => {
    const airport = airports.find((a) => a.code === code);
    return airport ? airport.city : code;
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-NZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + " at " + d.toLocaleTimeString("en-NZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: params.id,
          passengerName: name,
          passengerEmail: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Booking failed");
        return;
      }

      setConfirmation(data);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show confirmation/invoice page
  if (confirmation) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="card">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-2xl font-bold text-green-700">Booking Confirmed!</h1>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Booking Invoice</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-600">Booking Reference:</div>
              <div className="font-bold text-lg text-primary-700">{confirmation.bookingRef}</div>

              <div className="text-gray-600">Passenger:</div>
              <div className="font-semibold">{confirmation.passenger.passengerName}</div>

              <div className="text-gray-600">Email:</div>
              <div>{confirmation.passenger.passengerEmail}</div>

              <div className="col-span-2 border-t my-2"></div>

              <div className="text-gray-600">Flight:</div>
              <div className="font-mono">{confirmation.flight.flightNumber}</div>

              <div className="text-gray-600">Route:</div>
              <div>{getCity(confirmation.flight.origin)} → {getCity(confirmation.flight.destination)}</div>

              <div className="text-gray-600">Aircraft:</div>
              <div>{confirmation.flight.aircraft}</div>

              <div className="text-gray-600">Departure:</div>
              <div>{formatDateTime(confirmation.flight.departureTime)}</div>

              <div className="text-gray-600">Arrival:</div>
              <div>{formatDateTime(confirmation.flight.arrivalTime)}</div>

              <div className="col-span-2 border-t my-2"></div>

              <div className="text-gray-600 font-semibold">Total Price:</div>
              <div className="text-2xl font-bold text-primary-700">${confirmation.flight.price} NZD</div>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mb-4">
            Please save your booking reference: <strong>{confirmation.bookingRef}</strong>
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/search" className="btn-secondary">
              Search More Flights
            </Link>
            <Link href="/my-bookings" className="btn-primary">
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="card text-center py-10">
          <p className="text-gray-500">Loading flight details...</p>
        </div>
      </div>
    );
  }

  const seatsAvailable = flight.capacity - (flight.bookings?.length || 0);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Book Flight</h1>

      {/* Flight Summary */}
      <div className="card mb-6">
        <h2 className="font-bold text-lg mb-4">Flight Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-600">Flight:</div>
          <div className="font-mono font-semibold">{flight.flightNumber}</div>

          <div className="text-gray-600">Route:</div>
          <div className="font-semibold">
            {getCity(flight.origin)} → {getCity(flight.destination)}
          </div>

          <div className="text-gray-600">Aircraft:</div>
          <div>{flight.aircraft}</div>

          <div className="text-gray-600">Departure:</div>
          <div>{formatDateTime(flight.departureTime)}</div>

          <div className="text-gray-600">Arrival:</div>
          <div>{formatDateTime(flight.arrivalTime)}</div>

          <div className="text-gray-600">Price:</div>
          <div className="text-xl font-bold text-primary-700">${flight.price} NZD</div>

          <div className="text-gray-600">Seats Available:</div>
          <div className={seatsAvailable <= 2 ? "text-orange-600 font-semibold" : "text-green-600"}>
            {seatsAvailable} of {flight.capacity}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="font-bold text-lg mb-4">Passenger Details</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Back
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Processing..." : `Confirm Booking - $${flight.price} NZD`}
          </button>
        </div>
      </form>
    </div>
  );
}
