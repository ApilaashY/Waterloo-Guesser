"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import Image from "next/image";

interface CloudTransitionProps {
    onComplete: () => void;
}

export default function CloudTransition({ onComplete }: CloudTransitionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const whiteOverlayRef = useRef<HTMLDivElement>(null);

    // Pre-calculate cloud positions to ensure coverage (Collage style)
    // We'll create a grid and add randomness
    const clouds = useMemo(() => {
        const assets = [
            "/clouds/Cloud large 1.png",
            "/clouds/Cloud medium 1.png",
            "/clouds/Cloud wispy 1.png",
            "/clouds/Cloud wispy 2.png",
        ];

        const generatedClouds = [];
        const rows = 3; // Reduced from 4
        const cols = 4; // Reduced from 5

        // We want to cover slightly more than 100% to avoid gaps
        const cellWidth = 100 / cols;
        const cellHeight = 100 / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Random asset
                const src = assets[Math.floor(Math.random() * assets.length)];

                // Base center of the cell
                const centerX = (c * cellWidth) + (cellWidth / 2);
                const centerY = (r * cellHeight) + (cellHeight / 2);

                // Random offset within the cell (overlap is good!)
                const offsetX = (Math.random() - 0.5) * 15; // +/- 7.5%
                const offsetY = (Math.random() - 0.5) * 15;

                // Calculate offsets relative to the element's final centered position
                let startXOffset = 0;
                let startYOffset = 0;

                const distTop = r;
                const distBottom = rows - 1 - r;
                const distLeft = c;
                const distRight = cols - 1 - c;

                // Determine nearest edge distance in grid coordinates
                const min = Math.min(distTop, distBottom, distLeft, distRight);

                // Move them well off-screen based on nearest edge
                if (min === distTop) { startYOffset = -150; } // -150vh
                else if (min === distBottom) { startYOffset = 150; } // 150vh
                else if (min === distLeft) { startXOffset = -150; } // -150vw
                else { startXOffset = 150; } // 150vw

                generatedClouds.push({
                    id: `cloud-${r}-${c}`,
                    src,
                    top: `${centerY + offsetY}%`,
                    left: `${centerX + offsetX}%`,
                    startX: startXOffset,
                    startY: startYOffset,
                    scale: 1.5 + Math.random(), // Large scale for overlap
                    rotation: Math.random() * 20 - 10,
                });
            }
        }
        return generatedClouds;
    }, []);

    // Store onComplete in a ref so we can call the latest version without restarting the effect
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        // Safety timeout
        const safetyTimer = setTimeout(() => {
            onCompleteRef.current();
        }, 4000);

        const ctx = gsap.context(() => {
            const cloudElements = gsap.utils.toArray<HTMLElement>(".cloud-item");

            // Initial State: Apply OFFSETS so they start off-screen
            // We use 'x' and 'y' for the movement. 
            // The 'top'/'left' CSS properties define their FINAL destination.
            cloudElements.forEach((el) => {
                const dx = parseFloat((el as any).dataset.startx);
                const dy = parseFloat((el as any).dataset.starty);
                gsap.set(el, {
                    x: `${dx}vw`,
                    y: `${dy}vh`,
                    opacity: 1 // Now we can show them (they are off-screen)
                });
            });

            const timeline = gsap.timeline({
                onComplete: () => {
                    clearTimeout(safetyTimer);
                    onCompleteRef.current();
                },
            });

            // PHASE 1: ASSEMBLE COLLAGE
            // Animate 'x' and 'y' to 0 (which brings them to their CSS top/left positions)
            timeline.to(cloudElements, {
                duration: 1.2,
                x: 0,
                y: 0,
                ease: "power2.out", // Smooth deceleration
                stagger: {
                    grid: [3, 4],
                    from: "edges", // Start from outside in (or random if preferred)
                    amount: 0.8
                }
            });

            // PHASE 2: ZOOM & FADE ("Fly Through")
            timeline.to(cloudElements, {
                duration: 1.5,
                scale: 8, // Massive scale to simulate flying into them
                opacity: 0, // Fade out as we get too close/pass them
                ease: "power2.in",
                stagger: {
                    amount: 0.2, // Slight stagger for depth feeling
                    from: "center"
                }
            }, "+=0.1");

            // PHASE 3: GRADIENT OVERLAY (The "Middle Waiting" State)
            if (whiteOverlayRef.current) {
                // Fade in the gradient AS we zoom
                timeline.to(whiteOverlayRef.current, {
                    duration: 1.0,
                    opacity: 1,
                    ease: "power2.inOut"
                }, "-=1.4"); // Overlap significantly with the zoom
            }

        }, containerRef);

        return () => {
            clearTimeout(safetyTimer);
            ctx.revert();
        };
    }, []); // Empty dependency array = run ONCE on mount

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
        >
            {clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="cloud-item absolute will-change-transform"
                    data-startx={cloud.startX}
                    data-starty={cloud.startY}
                    style={{
                        top: cloud.top,
                        left: cloud.left,
                        width: '35vw',
                        height: 'auto',
                        transform: `translate(-50%, -50%) scale(${cloud.scale}) rotate(${cloud.rotation}deg)`,
                        opacity: 0, // IMPORTANT: Start invisible until GSAP sets position
                    }}
                >
                    <Image
                        src={cloud.src}
                        alt="Cloud"
                        width={500}
                        height={300}
                        className="w-full h-auto object-contain drop-shadow-xl"
                        priority
                    />
                </div>
            ))}

            {/* Gradient Overlay for final transition */}
            <div
                ref={whiteOverlayRef}
                className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 opacity-0"
            />
        </div>
    );
}
