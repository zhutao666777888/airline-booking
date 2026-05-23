"use client";

import { useState, useEffect } from "react";

interface BookingResult {
  bookingRef: string;
  passengerName: string;
  passengerEmail: string;
  bookedAt: string;
  flight: {
    _id: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    aircraft: string;
    price: number;
  };
}

interface Airport {
  code: string;
  city: string;
}

export default function MyBookingsPage() {
  const [searchType, setSearchType] = useState<"email" | "ref">("email");
  const [searchValue, setSearchValue] = useState("");
  const [bookings, setBookings] = useState<BookingResult[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  useEffect(() => {
    fetch("/api/airports")
      .then((res) => res.json())
      .then(setAirports);
  }, []);

  const getCity = (code: string) => {
    const airport = airports.find((a) => a.code === code);
    return airport ? airport.city : code;
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-NZ", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " " + d.toLocaleTimeString("en-NZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setCancelMessage("");

    const param = searchType === "email" ? `email=${encodeURIComponent(searchValue)}` : `ref=${encodeURIComponent(searchValue)}`;

    try {
      const res = await fetch(`/api/bookings?${param}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search failed:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingRef: string) => {
    if (!confirm(`Are you sure you want to cancel booking ${bookingRef}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/cancel?ref=${bookingRef}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setCancelMessage(`Booking ${bookingRef} has been cancelled successfully.`);
        setBookings(bookings.filter((b) => b.bookingRef !== bookingRef));
      } else {
        setCancelMessage(data.error || "Failed to cancel booking.");
      }
    } catch {
      setCancelMessage("An error occurred while cancelling.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {/* Search Form */}
      <div className="card mb-8">
        <h2 className="font-bold text-lg mb-4">Find Your Bookings</h2>
        <form onSubmit={handleSearch}>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                checked={searchType === "email"}
                onChange={() => setSearchType("email")}
                className="text-primary-600"
              />
              <span className="text-sm">Search by Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                checked={searchType === "ref"}
                onChange={() => setSearchType("ref")}
                className="text-primary-600"
              />
              <span className="text-sm">Search by Booking Reference</span>
            </label>
          </div>
          <div className="flex gap-3">
            <input
              type={searchType === "email" ? "email" : "text"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="input-field flex-1"
              placeholder={searchType === "email" ? "Enter your email address" : "Enter booking reference (e.g. DF3K7NP)"}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      {/* Messages */}
      {cancelMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {cancelMessage}
        </div>
      )}

      {/* Results */}
      {searched && !loading && bookings.length === 0 && (
        <div className="card text-center text-gray-500 py-10">
          <p className="text-lg">No bookings found.</p>
          <p className="text-sm mt-2">Check your email or booking reference and try again.</p>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{bookings.length} booking(s) found</p>
          {bookings.map((booking) => (
            <div key={booking.bookingRef} className="card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded font-bold text-sm">
                      {booking.bookingRef}
                    </span>
                    <span className="font-mono text-sm text-gray-500">
                      {booking.flight.flightNumber}
                    </span>
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    {getCity(booking.flight.origin)} → {getCity(booking.flight.destination)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Passenger: {booking.passengerName}</p>
                    <p>Departure: {formatDateTime(booking.flight.departureTime)}</p>
                    <p>Arrival: {formatDateTime(booking.flight.arrivalTime)}</p>
                    <p>Aircraft: {booking.flight.aircraft}</p>
                    <p>Booked on: {new Date(booking.bookedAt).toLocaleDateString("en-NZ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-700 mb-3">
                    ${booking.flight.price} NZD
                  </p>
                  <button
                    onClick={() => handleCancel(booking.bookingRef)}
                    className="btn-danger text-sm"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
