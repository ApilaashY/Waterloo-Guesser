import Hero from "../components/Hero";
import Leaderboard from "../components/Leaderboard";

export default function Page() {
  return (
    <div className="bg-black">
      <Hero />
      <div
        className="mx-auto max-w-6xl px-6 py-12"
        style={{
          backgroundImage: `radial-gradient(
            1200px 600px at 10% 10%,
            rgba(148, 75, 255, 0.1),
            transparent 15%
          ),
          radial-gradient(
            900px 500px at 90% 80%,
            rgba(88, 35, 198, 0.08),
            transparent 18%
          ),
          linear-gradient(180deg, rgba(12, 10, 15, 0.92), rgba(18, 12, 30, 0.96))`,
          backgroundColor: "var(--background)",
        }}
      >
        <Leaderboard />
      </div>
    </div>
  );
}
