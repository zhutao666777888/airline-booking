"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Airport {
  code: string;
  name: string;
  city: string;
}

interface Schedule {
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto py-10 px-4">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [origin, setOrigin] = useState(searchParams.get("orig") || "NZNE");
  const [destination, setDestination] = useState(searchParams.get("dest") || "");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [results, setResults] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch("/api/airports")
      .then((res) => res.json())
      .then(setAirports);
  }, []);

  useEffect(() => {
    // Set default dates: today to 4 weeks from now
    const today = new Date();
    const fourWeeks = new Date(today);
    fourWeeks.setDate(fourWeeks.getDate() + 28);
    setDate1(today.toISOString().split("T")[0]);
    setDate2(fourWeeks.toISOString().split("T")[0]);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (origin) params.set("orig", origin);
    if (destination) params.set("dest", destination);
    if (date1) params.set("date1", date1);
    if (date2) params.set("date2", date2);

    try {
      const res = await fetch(`/api/schedules?${params.toString()}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAirportCity = (code: string) => {
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

  const getSeatsAvailable = (schedule: Schedule) => {
    return schedule.capacity - (schedule.bookings?.length || 0);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Search Flights</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="card mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="input-field"
            >
              <option value="">Any origin</option>
              {airports.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-field"
            >
              <option value="">Any destination</option>
              {airports.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary mt-4" disabled={loading}>
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </form>

      {/* Results */}
      {searched && !loading && results.length === 0 && (
        <div className="card text-center text-gray-500 py-10">
          <p className="text-lg">No flights found for your search criteria.</p>
          <p className="text-sm mt-2">Try adjusting your dates or destination.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{results.length} flight(s) found</p>
          {results.map((flight) => {
            const seatsAvailable = getSeatsAvailable(flight);
            const isFull = seatsAvailable <= 0;

            return (
              <div key={flight._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {flight.flightNumber}
                      </span>
                      <span className="text-sm text-gray-500">{flight.aircraft}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <span>{getAirportCity(flight.origin)}</span>
                      <span className="text-primary-500">→</span>
                      <span>{getAirportCity(flight.destination)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Departs: {formatDateTime(flight.departureTime)}</p>
                      <p>Arrives: {formatDateTime(flight.arrivalTime)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-700">
                      ${flight.price}
                    </p>
                    <p className={`text-sm ${isFull ? "text-red-600 font-semibold" : "text-green-600"}`}>
                      {isFull ? "FULL" : `${seatsAvailable} seat(s) available`}
                    </p>
                    {!isFull && (
                      <Link
                        href={`/book/${flight._id}`}
                        className="btn-primary mt-2 inline-block text-sm"
                      >
                        Book Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
