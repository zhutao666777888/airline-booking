/**
 * Database Seed Script
 * Generates scheduled flights for 4 weeks from the current date.
 *
 * Run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed.ts
 * Or: npm run seed
 *
 * Make sure MONGODB_URI is set in your .env.local file.
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

interface ScheduleDoc {
  flightNumber: string;
  origin: string;
  destination: string;
  aircraft: string;
  capacity: number;
  departureTime: string;
  arrivalTime: string;
  price: number;
  bookings: never[];
}

// Helper: set time on a date (in NZ timezone context - we store as UTC-adjusted)
function setNZTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setUTCHours(hours - 12, minutes, 0, 0); // NZ is UTC+12
  return d;
}

// Helper: set time for Chatham Islands (UTC+12:45)
function setChathamTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setUTCHours(hours - 12, minutes - 45, 0, 0);
  return d;
}

// Helper: set time for Sydney (UTC+10)
function setSydneyTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setUTCHours(hours - 10, minutes, 0, 0);
  return d;
}

function getDayOfWeek(date: Date): number {
  return date.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
}

async function seed() {
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  console.log("Connected to MongoDB");

  const db = client.db("airline");

  // Drop existing collections
  try {
    await db.collection("schedules").drop();
  } catch {
    // Collection might not exist
  }

  const schedules: ScheduleDoc[] = [];

  // Generate 4 weeks of flights starting from today
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  const numDays = 28;

  for (let day = 0; day < numDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setUTCDate(currentDate.getUTCDate() + day);
    const dow = getDayOfWeek(currentDate);

    // === SYDNEY ROUTE (SyberJet SJ30i, 6 pax) ===
    // Outbound: Friday (dow=5), departs Dairy Flat 10:30 NZ, arrives Sydney ~14:00 Sydney time
    // Flight time: ~3.5 hours (eastbound is faster... but Sydney is west, so westbound ~4h)
    if (dow === 5) {
      const dep = setNZTime(currentDate, 10, 30);
      const arr = setSydneyTime(currentDate, 14, 30); // ~4h flight
      schedules.push({
        flightNumber: "DF100",
        origin: "NZNE",
        destination: "YSSY",
        aircraft: "SyberJet SJ30i",
        capacity: 6,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 1850,
        bookings: [],
      });
    }
    // Return: Sunday (dow=0), departs Sydney 15:00 Sydney time, arrives Dairy Flat ~20:00 NZ
    if (dow === 0) {
      const dep = setSydneyTime(currentDate, 15, 0);
      const arr = setNZTime(currentDate, 20, 30); // ~3.5h eastbound
      schedules.push({
        flightNumber: "DF101",
        origin: "YSSY",
        destination: "NZNE",
        aircraft: "SyberJet SJ30i",
        capacity: 6,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 1850,
        bookings: [],
      });
    }

    // === ROTORUA SHUTTLE (Cirrus SF50, 4 pax) ===
    // Mon-Fri (dow 1-5), twice daily
    if (dow >= 1 && dow <= 5) {
      // Morning: Dairy Flat 07:00 -> Rotorua 07:45 (45 min flight)
      const dep1 = setNZTime(currentDate, 7, 0);
      const arr1 = setNZTime(currentDate, 7, 45);
      schedules.push({
        flightNumber: "DF200",
        origin: "NZNE",
        destination: "NZRO",
        aircraft: "Cirrus SF50",
        capacity: 4,
        departureTime: dep1.toISOString(),
        arrivalTime: arr1.toISOString(),
        price: 320,
        bookings: [],
      });

      // Return morning: Rotorua 08:30 -> Dairy Flat 09:15
      const dep2 = setNZTime(currentDate, 8, 30);
      const arr2 = setNZTime(currentDate, 9, 15);
      schedules.push({
        flightNumber: "DF201",
        origin: "NZRO",
        destination: "NZNE",
        aircraft: "Cirrus SF50",
        capacity: 4,
        departureTime: dep2.toISOString(),
        arrivalTime: arr2.toISOString(),
        price: 320,
        bookings: [],
      });

      // Afternoon: Dairy Flat 16:30 -> Rotorua 17:15
      const dep3 = setNZTime(currentDate, 16, 30);
      const arr3 = setNZTime(currentDate, 17, 15);
      schedules.push({
        flightNumber: "DF202",
        origin: "NZNE",
        destination: "NZRO",
        aircraft: "Cirrus SF50",
        capacity: 4,
        departureTime: dep3.toISOString(),
        arrivalTime: arr3.toISOString(),
        price: 320,
        bookings: [],
      });

      // Return evening: Rotorua 18:00 -> Dairy Flat 18:45
      const dep4 = setNZTime(currentDate, 18, 0);
      const arr4 = setNZTime(currentDate, 18, 45);
      schedules.push({
        flightNumber: "DF203",
        origin: "NZRO",
        destination: "NZNE",
        aircraft: "Cirrus SF50",
        capacity: 4,
        departureTime: dep4.toISOString(),
        arrivalTime: arr4.toISOString(),
        price: 320,
        bookings: [],
      });
    }

    // === GREAT BARRIER ISLAND (Cirrus SF50, 4 pax) ===
    // Outbound: Mon(1), Wed(3), Fri(5) morning
    if (dow === 1 || dow === 3 || dow === 5) {
      const dep = setNZTime(currentDate, 9, 0);
      const arr = setNZTime(currentDate, 9, 35); // ~35 min flight
      schedules.push({
        flightNumber: "DF300",
        origin: "NZNE",
        destination: "NZGB",
        aircraft: "Cirrus SF50",
        capacity: 4,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 280,
        bookings: [],
      });
    }
    // Return: Tue(2), Thu(4), Sat(6) morning
    if (dow === 2 || dow === 4 || dow === 6) {
      const dep = setNZTime(currentDate, 9, 0);
      const arr = setNZTime(currentDate, 9, 35);
      schedules.push({
        flightNumber: "DF301",
        origin: "NZGB",
        destination: "NZNE",
        aircraft: "Cirrus SF50",
        capacity: 4,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 280,
        bookings: [],
      });
    }

    // === CHATHAM ISLANDS (HondaJet Elite, 5 pax) ===
    // Outbound: Tue(2), Fri(5), departs Dairy Flat 08:00 NZ, arrives ~10:15 Chatham time
    // Flight time ~2h, Chatham is UTC+12:45 (45 min ahead of NZ)
    if (dow === 2 || dow === 5) {
      const dep = setNZTime(currentDate, 8, 0);
      const arr = setChathamTime(currentDate, 10, 45); // 2h flight + 45min timezone
      schedules.push({
        flightNumber: "DF400",
        origin: "NZNE",
        destination: "NZCI",
        aircraft: "HondaJet Elite",
        capacity: 5,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 980,
        bookings: [],
      });
    }
    // Return: Wed(3), Sat(6), departs Tuuta 08:00 Chatham, arrives ~09:15 NZ
    if (dow === 3 || dow === 6) {
      const dep = setChathamTime(currentDate, 8, 0);
      const arr = setNZTime(currentDate, 9, 15); // 2h flight - 45min timezone
      schedules.push({
        flightNumber: "DF401",
        origin: "NZCI",
        destination: "NZNE",
        aircraft: "HondaJet Elite",
        capacity: 5,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 980,
        bookings: [],
      });
    }

    // === LAKE TEKAPO (HondaJet Elite, 5 pax) ===
    // Outbound: Monday (dow=1), departs Dairy Flat 10:00, arrives ~12:00 (2h flight)
    if (dow === 1) {
      const dep = setNZTime(currentDate, 10, 0);
      const arr = setNZTime(currentDate, 12, 0);
      schedules.push({
        flightNumber: "DF500",
        origin: "NZNE",
        destination: "NZTL",
        aircraft: "HondaJet Elite",
        capacity: 5,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 650,
        bookings: [],
      });
    }
    // Return: Tuesday (dow=2), departs Tekapo 10:00, arrives ~11:45 (slightly shorter eastbound)
    if (dow === 2) {
      const dep = setNZTime(currentDate, 10, 0);
      const arr = setNZTime(currentDate, 11, 45);
      schedules.push({
        flightNumber: "DF501",
        origin: "NZTL",
        destination: "NZNE",
        aircraft: "HondaJet Elite",
        capacity: 5,
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        price: 650,
        bookings: [],
      });
    }
  }

  // Insert all schedules
  if (schedules.length > 0) {
    const result = await db.collection("schedules").insertMany(schedules);
    console.log(`Inserted ${result.insertedCount} scheduled flights`);
  }

  // Create indexes
  await db.collection("schedules").createIndex({ origin: 1, destination: 1 });
  await db.collection("schedules").createIndex({ departureTime: 1 });
  await db.collection("schedules").createIndex({ "bookings.bookingRef": 1 });
  await db.collection("schedules").createIndex({ "bookings.passengerEmail": 1 });

  console.log("Indexes created");
  console.log("Seed complete!");

  await client.close();
}

seed().catch(console.error);
