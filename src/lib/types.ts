export interface Airport {
  code: string;       // ICAO code
  name: string;
  city: string;
  timezone: string;   // IANA timezone
  utcOffset: number;  // hours offset from UTC
}

export interface Booking {
  bookingRef: string;
  passengerName: string;
  passengerEmail: string;
  bookedAt: string;
}

export interface Schedule {
  _id?: string;
  flightNumber: string;
  origin: string;         // ICAO code
  destination: string;    // ICAO code
  aircraft: string;
  capacity: number;
  departureTime: string;  // ISO datetime string
  arrivalTime: string;    // ISO datetime string
  price: number;          // in NZD
  bookings: Booking[];
}

export interface SearchParams {
  origin?: string;
  destination?: string;
  date1?: string;
  date2?: string;
}
