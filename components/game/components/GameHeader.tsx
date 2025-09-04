import Link from "next/link";
import { useRouter } from "next/navigation";

interface GameHeaderProps {
  totalPoints: number;
  currentRound: number;
  maxRounds: number;
}

export default function GameHeader({ totalPoints, currentRound, maxRounds }: GameHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-row justify-center sm:justify-between w-full p-2 flex-wrap gap-2">
      {/* <h1 className="text-2xl font-bold text-gray-800 bg-white/80 rounded px-8 py-2 shadow">
        Points: {totalPoints}
        <br />
        Round {currentRound} / {maxRounds}
      </h1> */}
    </div>
  );
}
