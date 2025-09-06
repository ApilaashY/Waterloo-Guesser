import { GameState } from "../types";

interface DebugInfoProps {
  sessionId: string | null;
  partnerId: string | null;
  state: GameState;
  totalPoints: number;
  partnerPoints: number;
  questionCount: number;
  hasSubmitted: boolean;
  opponentHasSubmitted: boolean;
  isRoundComplete: boolean;
  xCoor: number | null;
  yCoor: number | null;
  xRightCoor: number | null;
  yRightCoor: number | null;
}

export default function DebugInfo(props: DebugInfoProps) {
  const debugData = {
    sessionId: props.sessionId,
    partnerId: props.partnerId,
    ...props.state,
    totalPoints: props.totalPoints,
    partnerPoints: props.partnerPoints,
    questionCount: props.questionCount,
    hasSubmitted: props.hasSubmitted,
    opponentHasSubmitted: props.opponentHasSubmitted,
    isRoundComplete: props.isRoundComplete,
    xCoor: props.xCoor,
    yCoor: props.yCoor,
    xRightCoor: props.xRightCoor,
    yRightCoor: props.yRightCoor,
  };

  return (
    <details
      className="p-4 mb-4 text-sm bg-gray-100 rounded-lg"
      style={{ cursor: "pointer" }}
    >
      <summary className="font-semibold text-gray-800 select-none">
        Debug Info (click to expand)
      </summary>
      <pre className="whitespace-pre-wrap text-gray-700 mt-2">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </details>
  );
}
