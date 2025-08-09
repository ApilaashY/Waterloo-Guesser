interface GameHeaderProps {
  sessionId: string | null;
  partnerId: string | null;
  totalPoints: number;
  partnerPoints: number;
  onRequestCurrentRound: () => void;
}

export default function GameHeader({ 
  sessionId, 
  partnerId, 
  totalPoints, 
  partnerPoints, 
  onRequestCurrentRound 
}: GameHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Versus Mode</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Session ID: {sessionId}</p>
          <p className="text-sm text-gray-500">Partner ID: {partnerId}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-semibold text-gray-700">Your Points: {totalPoints}</span>
            <span className="text-lg font-semibold text-gray-700 ml-4">Opponent Points: {partnerPoints}</span>
          </div>
          <div>
            <button
              onClick={onRequestCurrentRound}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Request Current Round
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
