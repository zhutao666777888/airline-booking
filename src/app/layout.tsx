import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DairyFlat Air - Online Booking",
  description: "Book flights with DairyFlat Air - Premium light jet services from Dairy Flat Airport",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-primary-800 text-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold tracking-tight">
              ✈️ DairyFlat Air
            </a>
            <div className="flex gap-6 text-sm font-medium">
              <a href="/" className="hover:text-primary-200 transition-colors">Home</a>
              <a href="/search" className="hover:text-primary-200 transition-colors">Search Flights</a>
              <a href="/my-bookings" className="hover:text-primary-200 transition-colors">My Bookings</a>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
          <p>© 2026 DairyFlat Air. Operating from Dairy Flat Airport (NZNE).</p>
        </footer>
      </body>
    </html>
  );
}
