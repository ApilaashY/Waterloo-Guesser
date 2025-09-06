import { useRouter } from "next/navigation";

export default function ResultsPopup({
  show,
  setShow,
}: {
  show: string | null;
  setShow: (val: string | null) => void;
}) {
  if (!show) return null;

  const router = useRouter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-1000">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold text-black">Game Over</h2>
        <p className="mt-2 text-black text-xl font-semibold">{show}</p>
        <button
          onClick={() => {
            setShow(null);
            router.push("/queue-game");
          }}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Start New Game
        </button>
      </div>
    </div>
  );
}
