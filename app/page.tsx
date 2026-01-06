import Hero from "../components/Hero";
import Leaderboard from "../components/Leaderboard";

export default function Page() {
  return (
    <div className="bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300">
      <Hero />
      <div
        className="mx-auto max-w-6xl px-6 py-12"
        style={{
          backgroundImage: `radial-gradient(
            1200px 600px at 10% 10%,
            rgba(144, 205, 244, 0.3),
            transparent 15%
          ),
          radial-gradient(
            900px 500px at 90% 80%,
            rgba(59, 130, 246, 0.2),
            transparent 18%
          ),
          linear-gradient(180deg, rgba(191, 219, 254, 0.4), rgba(147, 197, 253, 0.5))`,
        }}
      >
        <Leaderboard />
      </div>
    </div>
  );
}
