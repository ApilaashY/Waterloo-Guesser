import { useState, useEffect } from "react";

interface TriangleGameControlsProps {
    // Navigation
    totalImages: number;
    currentImageIndex: number;
    onImageChange: (index: number) => void;

    // Vertex selection
    activeVertexIndex: number;
    onVertexSelect: (index: number) => void;
    userVertices: (Array<{ x: number, y: number } | null>);

    // Game Actions
    onSubmit: () => void;
    onNext: () => void;
    hasSubmitted: boolean;
    isLoading: boolean;
}

export default function TriangleGameControls({
    totalImages,
    currentImageIndex,
    onImageChange,
    activeVertexIndex,
    onVertexSelect,
    userVertices,
    onSubmit,
    onNext,
    hasSubmitted,
    isLoading,
}: TriangleGameControlsProps) {

    return (
        <div className="flex flex-col gap-6 w-full max-w-sm self-center">

            {/* Vertex Selection */}
            <div className="w-full">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide text-center">
                    Select Vertex
                </div>
                <div className="flex justify-between gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    {[0, 1, 2].map((idx) => {
                        const isPlaced = userVertices[idx] !== null;
                        const isActive = activeVertexIndex === idx;

                        // Styling
                        const activeRing = isActive ? "ring-2 ring-blue-500 ring-offset-1" : "";
                        const bgClass = isActive ? "bg-blue-50" : "bg-white";
                        const borderClass = isActive ? "border-blue-500" : "border-gray-200";
                        const textClass = isActive ? "text-blue-700" : "text-gray-700";

                        return (
                            <button
                                key={idx}
                                onClick={() => onVertexSelect(idx)}
                                className={`
                                    flex-1 py-3 px-1 rounded-lg font-semibold text-sm transition-all border
                                    flex flex-col items-center justify-center gap-1
                                    ${bgClass} ${borderClass} ${textClass} ${activeRing} hover:bg-gray-50
                                `}
                            >
                                <span>Vertex {idx + 1}</span>
                                <span className={`text-[10px] ${isPlaced ? "text-green-600 font-bold" : "text-gray-400"}`}>
                                    {isPlaced ? "Placed ✓" : "Empty"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Submit Action */}
            <button
                className={`
        w-full py-4 rounded-xl font-bold text-xl shadow-lg transition transform hover:-translate-y-0.5
        ${hasSubmitted
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
                onClick={hasSubmitted ? onNext : onSubmit}
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : hasSubmitted ? "Next Round ➔" : "Submit Triangulation"}
            </button>
        </div>
    );
}
