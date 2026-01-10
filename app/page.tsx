import Link from "next/link";
import ExpandableCarousel from "../components/ExpandableCarousel";
import Hero from "../components/Hero";
import Leaderboard from "../components/Leaderboard";
import HallOfFame from "../components/HallOfFame";
import CommunityCTA from "../components/CommunityCTA";
import FacultyShowcase from "../components/FacultyShowcase";
import PolaroidFooter from "../components/PolaroidFooter";
import LivePlayerCount from "../components/LivePlayerCount";
import { getDb } from "@/lib/mongodb";

// Sample data using local public images (Fallback)
const FALLBACK_BUILDINGS = [
  {
    id: "01",
    name: "Engineering 7",
    imageUrl: "/E7 backdrop.png",
    description: "The home of RoboHub and the center of engineering innovation."
  },
  {
    id: "02",
    name: "Quantum Nano",
    imageUrl: "/QNC Backdrop.png",
    description: "A world-class facility for quantum information and nanotechnology research."
  },
  {
    id: "03",
    name: "Mathematics 3",
    imageUrl: "/MC backdrop.png",
    description: "The heart of the Faculty of Mathematics, featuring the famous 'Pink Tie'."
  },
  {
    id: "04",
    name: "Environment 3",
    imageUrl: "/EV3 backdrop.png",
    description: "A LEED Platinum certified building showcasing sustainable design."
  },
  {
    id: "05",
    name: "St. Jerome's",
    imageUrl: "/STJ Backdrop.png",
    description: "A vibrant academic community with a rich history."
  }
];

// Ensure dynamic rendering for random selection
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getFeaturedBuildings() {
  try {
    const db = await getDb();
    const collection = db.collection("base_locations");

    const buildings = await collection.aggregate([
      { $match: { status: "approved", image: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$building",
          name: { $first: "$building" },
          imageUrl: { $first: "$image" },
        }
      },
      { $sample: { size: 6 } }
    ]).toArray();

    if (!buildings || buildings.length < 3) {
      return FALLBACK_BUILDINGS;
    }

    return buildings.map((b, index) => ({
      id: String(index + 1).padStart(2, '0'),
      name: b.name || "Unknown Building",
      imageUrl: b.imageUrl,
      description: `Explore the ${b.name} building on campus.`
    }));

  } catch (error) {
    console.error("Failed to fetch featured buildings:", error);
    return FALLBACK_BUILDINGS;
  }
}

async function getHallOfFameStats() {
  try {
    const db = await getDb();
    const collection = db.collection("base_locations");

    const hardest = await collection.aggregate([
      { $match: { totalPlays: { $gt: 0 }, status: "approved" } },
      { $addFields: { avgDistance: { $divide: ["$totalDistance", "$totalPlays"] } } },
      { $sort: { avgDistance: -1 } },
      { $limit: 2 }
    ]).toArray();

    const popular = await collection.aggregate([
      { $match: { totalPlays: { $gt: 0 }, status: "approved" } },
      { $sort: { totalPlays: -1 } },
      { $limit: 2 }
    ]).toArray();

    return {
      hardest: hardest.map(h => ({
        id: h._id.toString(),
        name: h.name || "Unknown Location",
        imageUrl: h.image,
        avgDistance: `${Math.round(h.avgDistance)} m`,
        difficultyScore: Math.min(10, (h.avgDistance / 200)),
        totalPlays: h.totalPlays
      })),
      popular: popular.map(p => ({
        id: p._id.toString(),
        name: p.name || "Unknown Location",
        imageUrl: p.image,
        totalPlays: p.totalPlays,
        bestGuess: p.bestGuessDistance ? `${Math.round(p.bestGuessDistance)} m` : "N/A",
        bestGuesser: "Community"
      }))
    };

  } catch (error) {
    console.error("Failed to fetch Hall of Fame stats:", error);
    return { hardest: [], popular: [] };
  }
}



export default async function Page() {
  const featuredBuildings = await getFeaturedBuildings();
  const hofStats = await getHallOfFameStats();


  return (
    <main className="min-h-screen bg-transparent text-primary selection:bg-accent-primary selection:text-root">
      <Hero />

      {/* Live Player Count */}
      <section className="relative py-8" aria-label="Live Stats">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <LivePlayerCount />
        </div>
      </section>

      {/* Faculty Showcase Section */}
      <FacultyShowcase />

      {/* Featured Locations Section */}
      <section className="relative py-24 overflow-hidden" aria-label="Featured Locations">
        {/* Subtle local glow to accent the global spotlight - Peach/Blue mix */}
        <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-gradient-to-r from-accent-primary/5 to-transparent rounded-full blur-[180px] -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 mb-4 text-xs font-data font-bold tracking-[0.2em] uppercase text-accent-primary bg-accent-primary/5 border border-accent-primary/20 backdrop-blur-sm shadow-[0_0_15px_-3px_var(--accent-primary)]">
                Explore Campus
              </span>
              <h2 className="text-4xl md:text-5xl font-heading text-primary mb-4 tracking-tight text-glow">
                Featured Locations
              </h2>
              <p className="text-primary/70 text-lg max-w-md font-data leading-relaxed">
                Discover iconic buildings across campus.
              </p>
            </div>
            <Link
              href="/poster-board"
              className="bloom inline-flex items-center gap-3 px-8 py-3 text-primary bg-root/40 border border-accent-primary/30 hover:bg-accent-primary/10 transition-all duration-300 group font-data font-medium tracking-wider"
            >
              <span>VIEW ALL LOCATIONS</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </header>

          {/* Carousel with Ethereal Border */}
          <div className="ethereal-border bg-root/30 backdrop-blur-md p-4 rounded-xl shadow-2xl">
            <ExpandableCarousel items={featuredBuildings} height="h-[500px]" />
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <CommunityCTA />

      {/* Leaderboard Section */}
      <section className="relative py-24 overflow-hidden" aria-label="Leaderboard">
        {/* Local glows for depth - Deep Space & Peach */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-surface/50 via-transparent to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent-primary/5 to-transparent rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10">
          <Leaderboard />
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="relative py-24 overflow-hidden" aria-label="Hall of Fame">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-surface/40 via-accent-primary/5 to-surface/40 rounded-full blur-[180px] pointer-events-none" />

        <div className="relative z-10">
          <HallOfFame initialData={hofStats} />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-root/80 backdrop-blur-xl">
        <PolaroidFooter />
      </footer>
    </main>
  );
}
