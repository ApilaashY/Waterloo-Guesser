"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface CloudTransitionProps {
    onComplete: () => void;
}

export default function CloudTransition({ onComplete }: CloudTransitionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<HTMLDivElement>(null);

    // Store onComplete in a ref
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Simple Gradient Fade In
            gsap.to(gradientRef.current, {
                duration: 0.8,
                opacity: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    onCompleteRef.current();
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
        >
            {/* Simple Gradient Overlay */}
            <div
                ref={gradientRef}
                className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 opacity-0"
            />
        </div>
    );
}
