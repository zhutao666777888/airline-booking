# DairyFlat Air - Online Booking System

An online booking system for a fictitious airline operating from Dairy Flat Airport (NZNE).
Built with **Next.js 14**, **MongoDB Atlas**, and **Tailwind CSS**. Deployed on **Vercel**.

## Features

- **Landing page** with airline information and destinations
- **Flight search** by origin, destination, and date range
- **Booking system** with unique booking references
- **Booking cancellation**
- **My Bookings** - look up bookings by email or reference

## Routes & Fleet

| Route | Aircraft | Capacity | Schedule |
|-------|----------|----------|----------|
| Dairy Flat ↔ Sydney | SyberJet SJ30i | 6 pax | Weekly (Fri out, Sun return) |
| Dairy Flat ↔ Rotorua | Cirrus SF50 | 4 pax | Mon–Fri, twice daily |
| Dairy Flat ↔ Great Barrier | Cirrus SF50 | 4 pax | 3x weekly |
| Dairy Flat ↔ Chatham Islands | HondaJet Elite | 5 pax | 2x weekly |
| Dairy Flat ↔ Lake Tekapo | HondaJet Elite | 5 pax | Weekly (Mon out, Tue return) |

## Setup

### 1. Install dependencies

```bash
cd airline-booking
npm install
```

### 2. Configure MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP (or use 0.0.0.0/0 for Vercel)
3. Copy the connection string

### 3. Set environment variables

Edit `.env.local`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/airline?retryWrites=true&w=majority
```

### 4. Seed the database

```bash
npm run seed
```

This generates 4 weeks of scheduled flights from today.

### 5. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `MONGODB_URI` as an environment variable in Vercel project settings
4. Deploy!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/airports` | List all airports |
| GET | `/api/schedules?orig=NZNE&dest=YSSY&date1=2026-06-01&date2=2026-06-30` | Search flights |
| GET | `/api/schedules?id=<objectId>` | Get flight by ID |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?email=user@example.com` | Get bookings by email |
| GET | `/api/bookings?ref=DF3K7NP` | Get booking by reference |
| DELETE | `/api/bookings/cancel?ref=DF3K7NP` | Cancel a booking |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Deployment**: Vercel
