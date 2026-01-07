import React from 'react';

interface SingleGuessControlsProps {
    activeVertexIndex: number; // Used for photo switching
    onVertexSelect: (index: number) => void;
    currentImageIndex: number;
    hasSubmitted: boolean;
}

export default function SingleGuessControls({
    activeVertexIndex,
    onVertexSelect,
    currentImageIndex,
    hasSubmitted
}: SingleGuessControlsProps) {
    return (
        <div className="w-full max-w-sm self-center">
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 w-full mb-4">
                <div className="text-gray-500 text-sm font-medium text-center mb-4">
                    View the photos and place a single marker on the map where you think you are.
                </div>

                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide text-center">
                    Select Photo View
                </div>
                <div className="flex justify-center gap-3">
                    {[0, 1, 2].map((idx) => (
                        <button
                            key={idx}
                            onClick={() => onVertexSelect(idx)}
                            className={`w-12 h-12 rounded-full font-bold border-2 transition shadow-sm
                                ${activeVertexIndex === idx
                                    ? 'bg-gray-800 text-white border-gray-800 scale-110'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}
                             `}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
