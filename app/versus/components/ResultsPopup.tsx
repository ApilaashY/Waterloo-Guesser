import { useRouter } from "next/navigation";

export default function ResultsPopup({
  show,
  setShow,
  onRematch,
  rematchStatus,
  opponentLeft,
}: {
  show: string | null;
  setShow: (val: string | null) => void;
  onRematch?: () => void;
  rematchStatus?: { player1Requested: boolean; player2Requested: boolean } | null;
  opponentLeft?: boolean;
}) {
  const router = useRouter();

  if (!show) return null;

  const bothPlayersWantRematch = rematchStatus?.player1Requested && rematchStatus?.player2Requested;
  const currentPlayerRequestedRematch = rematchStatus?.player1Requested || rematchStatus?.player2Requested;
  const rematchDisabled = bothPlayersWantRematch || opponentLeft;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black opacity-40 z-1000"></div>
      <div className="fixed inset-0 flex items-center justify-center z-1001">
        <div className=" bg-white p-4 rounded shadow z-1001">
          <h2 className="text-lg font-bold text-black">Game Over</h2>
          <p className="mt-2 text-black text-xl font-semibold">{show}</p>
          <button
            onClick={() => {
              setShow(null);
              router.push("/queue-game");
            }}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Start New Game
          </button>

          {onRematch && (
            <button
              onClick={onRematch}
              disabled={rematchDisabled}
              className={`mt-4 ml-2 px-4 py-2 rounded text-white ${
                rematchDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {opponentLeft
                ? "Opponent Left"
                : bothPlayersWantRematch
                ? "Starting Rematch..."
                : currentPlayerRequestedRematch
                ? "Waiting for opponent..."
                : "Request Rematch"}
            </button>
          )}
        </div>{" "}
      </div>
    </>
  );
}
