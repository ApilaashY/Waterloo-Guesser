export default function CountdownTimer({ seconds }: { seconds: number | null }) {
  if (seconds === null) return null;

  return (
    <div className="fixed bottom-8 right-8 z-1002">
      <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-4 border-red-700 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="text-4xl font-bold">{seconds}</div>
          <div className="text-sm font-semibold">
            <div>Room closing</div>
            <div>in {seconds}s</div>
          </div>
        </div>
      </div>
    </div>
  );
}
