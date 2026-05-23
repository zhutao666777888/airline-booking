import { Airport } from "./types";

export const airports: Airport[] = [
  {
    code: "NZNE",
    name: "Dairy Flat Airport",
    city: "Dairy Flat",
    timezone: "Pacific/Auckland",
    utcOffset: 12,
  },
  {
    code: "YSSY",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    timezone: "Australia/Sydney",
    utcOffset: 10,
  },
  {
    code: "NZRO",
    name: "Rotorua Airport",
    city: "Rotorua",
    timezone: "Pacific/Auckland",
    utcOffset: 12,
  },
  {
    code: "NZGB",
    name: "Claris Airport",
    city: "Great Barrier Island",
    timezone: "Pacific/Auckland",
    utcOffset: 12,
  },
  {
    code: "NZCI",
    name: "Tuuta Airport",
    city: "Chatham Islands",
    timezone: "Pacific/Chatham",
    utcOffset: 12.75,
  },
  {
    code: "NZTL",
    name: "Lake Tekapo Airport",
    city: "Lake Tekapo",
    timezone: "Pacific/Auckland",
    utcOffset: 12,
  },
];

export function getAirport(code: string): Airport | undefined {
  return airports.find((a) => a.code === code);
}
