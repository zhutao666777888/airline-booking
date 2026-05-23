import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to DairyFlat Air</h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Premium light jet services from Dairy Flat Airport. Experience luxury travel
            to Sydney, Rotorua, Great Barrier Island, Chatham Islands, and Lake Tekapo.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/search" className="btn-primary text-lg px-8 py-3">
              Search Flights
            </Link>
            <Link href="/my-bookings" className="btn-secondary text-lg px-8 py-3">
              My Bookings
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Destinations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DestinationCard
            city="Sydney"
            code="YSSY"
            description="Weekly prestige service aboard our SyberJet SJ30i. Departs Fridays, returns Sundays."
            aircraft="SyberJet SJ30i (6 seats)"
            price="$1,850"
          />
          <DestinationCard
            city="Rotorua"
            code="NZRO"
            description="Daily shuttle service Mon–Fri. Two flights per day with morning and afternoon departures."
            aircraft="Cirrus SF50 (4 seats)"
            price="$320"
          />
          <DestinationCard
            city="Great Barrier Island"
            code="NZGB"
            description="Three times weekly to Claris Airport. Outbound Mon/Wed/Fri, return Tue/Thu/Sat."
            aircraft="Cirrus SF50 (4 seats)"
            price="$280"
          />
          <DestinationCard
            city="Chatham Islands"
            code="NZCI"
            description="Twice weekly to Tuuta Airport. Outbound Tue/Fri, return Wed/Sat."
            aircraft="HondaJet Elite (5 seats)"
            price="$980"
          />
          <DestinationCard
            city="Lake Tekapo"
            code="NZTL"
            description="Weekly service to the South Island. Departs Monday, returns Tuesday."
            aircraft="HondaJet Elite (5 seats)"
            price="$650"
          />
        </div>
      </section>

      {/* Fleet Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Fleet</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-3">🛩️</div>
              <h3 className="font-bold text-lg">SyberJet SJ30i</h3>
              <p className="text-gray-600 mt-2">6 passengers • Pride of the fleet</p>
              <p className="text-sm text-gray-500 mt-1">Sydney route</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">✈️</div>
              <h3 className="font-bold text-lg">Cirrus SF50</h3>
              <p className="text-gray-600 mt-2">4 passengers • 2 aircraft</p>
              <p className="text-sm text-gray-500 mt-1">Rotorua & Great Barrier routes</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">🛫</div>
              <h3 className="font-bold text-lg">HondaJet Elite</h3>
              <p className="text-gray-600 mt-2">5 passengers • 2 aircraft</p>
              <p className="text-sm text-gray-500 mt-1">Chatham Islands & Lake Tekapo routes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DestinationCard({
  city,
  code,
  description,
  aircraft,
  price,
}: {
  city: string;
  code: string;
  description: string;
  aircraft: string;
  price: string;
}) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold">{city}</h3>
        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded font-mono">
          {code}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{aircraft}</span>
        <span className="font-bold text-primary-700">from {price}</span>
      </div>
      <Link
        href={`/search?dest=${code}`}
        className="mt-4 block text-center btn-primary text-sm py-2"
      >
        Search Flights
      </Link>
    </div>
  );
}
