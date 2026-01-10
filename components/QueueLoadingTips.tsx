"use client";

import { useState, useEffect } from "react";

const TIPS = [
    "Did you know? The Pink Tie is the official symbol of the Mathematics faculty.",
    "Pro Tip: Look for the unique window shapes of the Quantum Nano Center (QNC).",
    "Fun Fact: Engineering 5 has a 'live' wall of plants in the atrium.",
    "Hint: If you see a dinosaur skeleton, you're likely in the EIT building.",
    "History: The Dana Porter Library is lovingly nicknamed the 'Sugar Cube'.",
    "Pro Tip: Use the trees to gauge the season - it might help narrow down the location.",
    "Trivia: The University of Waterloo was established in 1957.",
    "Hint: Look for street signs or building names in the background.",
    "Myth: Touching the Porza statue is said to bring bad luck during exams!",
    "Pro Tip: Use the zoom feature to spot small details like room numbers.",
    "Pro Tip: Read the questions during your exam, it is a very useful skill used by many generations",
    "Hint: Looking at the sky doesn't help figure out where you are",
    "Hint: The sky is blue but sometimes it can be black too",
    "Hint: If you find yourself in the MC, you are likely surrounded by concrete",
    "Myth: If you apply for 500 jobs and get zero interviews, it is statistically possible that you have not yet been hired.",
    "Pro Tip: If you see a student crying near the Dana Porter Library, there is a high probability they are currently enrolled in a degree program.",


];

export default function QueueLoadingTips() {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        // Initial random tip
        setCurrentTipIndex(Math.floor(Math.random() * TIPS.length));

        const interval = setInterval(() => {
            setFade(false); // Fade out

            setTimeout(() => {
                setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
                setFade(true); // Fade in
            }, 500); // Wait for fade out to complete

        }, 4000); // Change tip every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-8 max-w-md mx-auto">
            <div className="text-blue-300 font-bold text-xs uppercase tracking-widest mb-2">
                Game Tip
            </div>
            <div
                className={`text-gray-300 text-sm md:text-base italic font-medium transition-opacity duration-500 min-h-[3rem] ${fade ? 'opacity-100' : 'opacity-0'}`}
            >
                "{TIPS[currentTipIndex]}"
            </div>
        </div>
    );
}
