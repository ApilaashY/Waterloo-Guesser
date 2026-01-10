"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import gsap from "gsap";

// Speed thresholds for fun comparisons (in km/h)
const SPEED_COMPARISONS = [
    { speed: 0, label: "Standing Still", emoji: "🧍" },
    { speed: 5, label: "Walking", emoji: "🚶" },
    { speed: 15, label: "Running", emoji: "🏃" },
    { speed: 30, label: "Usain Bolt", emoji: "⚡" },
    { speed: 50, label: "City Bus", emoji: "🚌" },
    { speed: 100, label: "Highway Car", emoji: "🚗" },
    { speed: 200, label: "Bullet Train", emoji: "🚄" },
    { speed: 400, label: "Airplane", emoji: "✈️" },
    { speed: 800, label: "Commercial Jet", emoji: "🛫" },
    { speed: 1200, label: "Speed of Sound", emoji: "💥" },
    { speed: 3000, label: "SR-71 Blackbird", emoji: "🛩️" },
    { speed: 10000, label: "Space Shuttle", emoji: "🚀" },
    { speed: 40000, label: "Apollo Spacecraft", emoji: "🌙" },
    { speed: 100000, label: "LUDICROUS SPEED", emoji: "🌀" },
    { speed: 300000, label: "PLAID MODE", emoji: "🔥" },
];

const getSpeedComparison = (speed: number) => {
    for (let i = SPEED_COMPARISONS.length - 1; i >= 0; i--) {
        if (speed >= SPEED_COMPARISONS[i].speed) {
            return SPEED_COMPARISONS[i];
        }
    }
    return SPEED_COMPARISONS[0];
};

// Simplified Greg icon - cleaner, less visual noise
const GregIcon = ({ rotation }: { rotation: number }) => {
    return L.divIcon({
        html: `<div style="
            transform: rotate(${rotation}deg);
            transition: transform 0.1s ease-out;
        ">
            <img src="/greg for conc.png" style="
                width: 50px;
                height: 50px;
                pointer-events: none;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            " />
        </div>`,
        className: 'bg-transparent',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
    });
};

type Node = {
    id: string;
    lat: number;
    lon: number;
    connections: string[];
    pathNames: string[];
};

type RoadSegment = {
    positions: [number, number][];
    name: string;
};

export default function RingRoadMap() {
    // Path and position state
    const [navPath, setNavPath] = useState<[number, number][]>([]);
    const [allRoads, setAllRoads] = useState<RoadSegment[]>([]);
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
    const [status, setStatus] = useState("Loading Campus Roads...");
    const [rotation, setRotation] = useState(0);

    // Stats state
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [maxSpeed, setMaxSpeed] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [lapsCompleted, setLapsCompleted] = useState(0);

    // Scroll tracking
    const lastScrollY = useRef(0);
    const lastScrollTime = useRef(Date.now());
    const lastPathIndex = useRef(0);
    const cumulativeProgress = useRef(0);

    // UI state
    const [showCheckpoint, setShowCheckpoint] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    // GSAP refs for animations
    const speedDisplayRef = useRef<HTMLDivElement>(null);
    const checkpointRef = useRef<HTMLDivElement>(null);
    const speedValueRef = useRef<HTMLSpanElement>(null);
    const displayedSpeed = useRef(0);

    // GSAP animation for speed number counting
    useEffect(() => {
        if (speedValueRef.current) {
            gsap.to(displayedSpeed, {
                current: currentSpeed,
                duration: 0.3,
                ease: "power2.out",
                onUpdate: () => {
                    if (speedValueRef.current) {
                        speedValueRef.current.textContent = Math.round(displayedSpeed.current).toLocaleString();
                    }
                }
            });
        }
    }, [currentSpeed]);

    // GSAP animation for checkpoint popup
    useEffect(() => {
        if (checkpointRef.current) {
            if (showCheckpoint && !isScrolling) {
                gsap.fromTo(checkpointRef.current,
                    { scale: 0.8, opacity: 0, y: 20 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
                );
            } else {
                gsap.to(checkpointRef.current, {
                    scale: 0.9, opacity: 0, y: 10, duration: 0.2, ease: "power2.in"
                });
            }
        }
    }, [showCheckpoint, isScrolling]);

    // GSAP animation for speed HUD pulse on high speed
    useEffect(() => {
        if (speedDisplayRef.current && currentSpeed > 500) {
            gsap.to(speedDisplayRef.current, {
                scale: 1.02,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut"
            });
        }
    }, [Math.floor(currentSpeed / 100)]); // Trigger on speed threshold changes

    // Calculate distance between two lat/lon points in meters
    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Fetch & Build Graph from Local GeoJSON
    useEffect(() => {
        const buildGraph = async () => {
            try {
                const response = await fetch("/uw_roads.geojson");
                const data = await response.json();
                const newNodes: Record<string, Node> = {};
                const roads: RoadSegment[] = [];

                const getNode = (lat: number, lon: number): Node => {
                    const precision = 100000;
                    const snLat = Math.round(lat * precision) / precision;
                    const snLon = Math.round(lon * precision) / precision;
                    const key = `${snLat},${snLon}`;

                    if (!newNodes[key]) {
                        newNodes[key] = { id: key, lat: snLat, lon: snLon, connections: [], pathNames: [] };
                    }
                    return newNodes[key];
                };

                if (data.features) {
                    data.features.forEach((feature: any) => {
                        if (feature.geometry && feature.geometry.type === "LineString") {
                            const name = feature.properties?.name || "Campus Path";
                            const coords = feature.geometry.coordinates;

                            const positions: [number, number][] = coords.map((c: number[]) => [c[1], c[0]]);
                            roads.push({ positions, name });

                            for (let i = 0; i < coords.length - 1; i++) {
                                const p1 = coords[i];
                                const p2 = coords[i + 1];

                                const n1 = getNode(p1[1], p1[0]);
                                const n2 = getNode(p2[1], p2[0]);

                                if (!n1.connections.includes(n2.id)) n1.connections.push(n2.id);
                                if (!n2.connections.includes(n1.id)) n2.connections.push(n1.id);

                                if (!n1.pathNames.includes(name)) n1.pathNames.push(name);
                                if (!n2.pathNames.includes(name)) n2.pathNames.push(name);
                            }
                        }
                    });

                    setAllRoads(roads);

                    const nodeKeys = Object.keys(newNodes);
                    let startNodeId = nodeKeys.find(k => newNodes[k].pathNames.some(n => n && n.includes("Ring Road")));
                    if (!startNodeId) startNodeId = nodeKeys[Math.floor(Math.random() * nodeKeys.length)];

                    if (startNodeId) {
                        const walk: [number, number][] = [];
                        let current = newNodes[startNodeId];
                        walk.push([current.lat, current.lon]);

                        let prevId: string | null = null;

                        for (let i = 0; i < 50000; i++) {
                            const candidates = current.connections;
                            if (candidates.length === 0) break;

                            let nextId = candidates[0];

                            if (candidates.length > 1 && prevId) {
                                const forwardOptions = candidates.filter(id => id !== prevId);
                                if (forwardOptions.length > 0) {
                                    nextId = forwardOptions[Math.floor(Math.random() * forwardOptions.length)];
                                } else {
                                    nextId = candidates[Math.floor(Math.random() * candidates.length)];
                                }
                            } else if (candidates.length > 0) {
                                nextId = candidates[Math.floor(Math.random() * candidates.length)];
                            } else {
                                break;
                            }

                            prevId = current.id;
                            current = newNodes[nextId];
                            walk.push([current.lat, current.lon]);
                        }

                        setNavPath(walk);
                        setCurrentPosition([walk[0][0], walk[0][1]]);
                        setStatus("Scroll to move Greg!");
                    }
                }
            } catch (e) {
                console.error("Graph build error", e);
                setStatus("Error loading map");
            }
        };
        buildGraph();
    }, []);

    // Handle Scroll
    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;
        let speedDecayInterval: NodeJS.Timeout;

        const handleScroll = () => {
            const now = Date.now();
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const timeDelta = (now - lastScrollTime.current) / 1000;

            setIsScrolling(true);
            setShowCheckpoint(false);

            if (scrollHeight > 0 && navPath.length > 1) {
                const rawProgress = scrolled / scrollHeight;
                // Reduced from 10 to 3 to make Greg move slower/more controllable
                const extendedProgress = rawProgress * 3;

                const currentLap = Math.floor(extendedProgress);
                const lapProgress = extendedProgress - currentLap;

                const targetIdx = Math.floor(lapProgress * (navPath.length - 1)) % (navPath.length - 1);
                const segmentProgress = (lapProgress * (navPath.length - 1)) % 1;

                if (currentLap > lapsCompleted) {
                    setLapsCompleted(currentLap);
                }

                cumulativeProgress.current = extendedProgress * 100;

                let distanceMoved = 0;
                const lastIdx = lastPathIndex.current;

                if (targetIdx !== lastIdx && targetIdx >= 0) {
                    if (lastIdx > navPath.length * 0.8 && targetIdx < navPath.length * 0.2) {
                        for (let i = lastIdx; i < navPath.length - 1; i++) {
                            distanceMoved += haversineDistance(
                                navPath[i][0], navPath[i][1],
                                navPath[i + 1][0], navPath[i + 1][1]
                            );
                        }
                        for (let i = 0; i < targetIdx; i++) {
                            distanceMoved += haversineDistance(
                                navPath[i][0], navPath[i][1],
                                navPath[i + 1][0], navPath[i + 1][1]
                            );
                        }
                    } else {
                        const startIdx = Math.min(lastIdx, targetIdx);
                        const endIdx = Math.max(lastIdx, targetIdx);
                        for (let i = startIdx; i < endIdx && i < navPath.length - 1; i++) {
                            distanceMoved += haversineDistance(
                                navPath[i][0], navPath[i][1],
                                navPath[i + 1][0], navPath[i + 1][1]
                            );
                        }
                    }
                }

                const speedMps = timeDelta > 0 ? distanceMoved / timeDelta : 0;
                const rawSpeedKmh = speedMps * 3.6;
                const smoothedSpeed = (rawSpeedKmh * 0.2) + (currentSpeed * 0.8);

                setCurrentSpeed(smoothedSpeed);
                if (smoothedSpeed > maxSpeed) setMaxSpeed(smoothedSpeed);
                setTotalDistance(prev => prev + distanceMoved);

                if (targetIdx >= 0 && targetIdx < navPath.length - 1) {
                    const p1 = navPath[targetIdx];
                    const p2 = navPath[targetIdx + 1];
                    const angle = Math.atan2(p2[0] - p1[0], p2[1] - p1[1]) * 180 / Math.PI;
                    setRotation(angle);
                }

                if (targetIdx >= 0) {
                    const p1 = navPath[targetIdx];
                    const p2 = navPath[targetIdx + 1];
                    const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
                    const lon = p1[1] + (p2[1] - p1[1]) * segmentProgress;
                    setCurrentPosition([lat, lon]);
                }

                lastPathIndex.current = targetIdx;
            }

            lastScrollY.current = scrolled;
            lastScrollTime.current = now;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
                setShowCheckpoint(true);

                speedDecayInterval = setInterval(() => {
                    setCurrentSpeed(prev => {
                        if (prev < 1) {
                            clearInterval(speedDecayInterval);
                            return 0;
                        }
                        return prev * 0.85;
                    });
                }, 50);
            }, 150);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
            clearInterval(speedDecayInterval);
        };
    }, [navPath, maxSpeed, lapsCompleted]);

    const speedInfo = getSpeedComparison(currentSpeed);
    const progressPercent = cumulativeProgress.current;
    const currentLapProgress = navPath.length > 0 ? (lastPathIndex.current / (navPath.length - 1)) * 100 : 0;

    // Dynamic border color based on speed (subtle)
    const getBorderColor = () => {
        if (currentSpeed > 1000) return 'border-amber-500/60';
        if (currentSpeed > 100) return 'border-amber-500/30';
        return 'border-white/10';
    };

    return (
        <div className="relative w-full h-[100vh]">
            {/* Speed HUD - Top Center */}
            <div
                ref={speedDisplayRef}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]"
            >
                <div className={`bg-surface/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border ${getBorderColor()} transition-colors duration-300`}>
                    <div className="text-center">
                        <div className="text-4xl font-black text-primary font-mono tracking-tight">
                            <span ref={speedValueRef}>0</span>
                            <span className="text-lg text-secondary ml-1">km/h</span>
                        </div>
                        <div className="text-lg text-secondary mt-0.5">
                            {speedInfo.emoji} {speedInfo.label}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Panel - Left Side */}
            <div className="absolute top-24 left-4 z-[1000] bg-surface/80 backdrop-blur-sm rounded-xl p-4 text-primary border border-white/10 min-w-[180px]">
                <h2 className="font-bold text-sm border-b border-white/10 pb-2 mb-2 text-secondary uppercase tracking-wider">Stats</h2>
                <div className="text-sm space-y-1.5">
                    <div className="flex justify-between">
                        <span className="text-secondary">Distance</span>
                        <span className="font-mono font-semibold">{(totalDistance / 1000).toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-secondary">Max Speed</span>
                        <span className="font-mono font-semibold text-amber-400">{Math.round(maxSpeed).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-secondary">Laps</span>
                        <span className="font-mono font-semibold text-accent-primary">{lapsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-secondary">Progress</span>
                        <span className="font-mono font-semibold">{progressPercent.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Instructions - Right Side */}
            <div className="absolute top-24 right-4 z-[1000] bg-surface/80 backdrop-blur-sm rounded-xl p-4 text-primary border border-white/10 max-w-[220px]">
                <h2 className="font-bold text-sm mb-1">{status}</h2>
                <p className="text-xs text-secondary">
                    Scroll faster for more speed
                </p>
                {navPath.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-xs text-secondary">
                            Lap: <span className="font-mono text-primary">{currentLapProgress.toFixed(1)}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkpoint Popup - Bottom Right (themed) */}
            <div
                ref={checkpointRef}
                className={`absolute bottom-8 right-4 z-[2000] ${!showCheckpoint || isScrolling ? 'pointer-events-none' : ''}`}
                style={{ opacity: 0 }}
            >
                <div className="bg-surface/95 backdrop-blur-md p-5 rounded-xl shadow-xl border border-white/10 text-center max-w-[260px]">
                    <div className="w-10 h-10 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-accent-primary/20">
                        <span className="text-xl">🏁</span>
                    </div>
                    <h2 className="text-lg font-bold text-primary mb-3">Checkpoint</h2>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                            <p className="text-secondary text-[10px] uppercase tracking-wider">Distance</p>
                            <p className="text-lg font-bold text-primary font-mono">
                                {(totalDistance / 1000).toFixed(2)}
                                <span className="text-xs text-secondary ml-0.5">km</span>
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                            <p className="text-secondary text-[10px] uppercase tracking-wider">Top Speed</p>
                            <p className="text-lg font-bold text-amber-400 font-mono">
                                {Math.round(maxSpeed).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {lapsCompleted > 0 && (
                        <div className="bg-accent-primary/10 rounded-lg p-2 mb-3 border border-accent-primary/20">
                            <p className="text-accent-primary text-sm font-semibold">
                                {lapsCompleted} Lap{lapsCompleted !== 1 ? 's' : ''} Completed
                            </p>
                        </div>
                    )}

                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-secondary text-[10px] uppercase tracking-wider mb-0.5">Speed Tier</p>
                        <p className="text-base text-primary">{getSpeedComparison(maxSpeed).emoji} {getSpeedComparison(maxSpeed).label}</p>
                    </div>

                    <p className="text-secondary text-xs mt-3">Scroll to continue</p>
                </div>
            </div>

            <MapContainer
                center={[43.4723, -80.5449]}
                zoom={17}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                touchZoom={false}
                className="w-full h-full"
                style={{ background: '#1a1a2e' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* All roads as background */}
                {allRoads.length > 0 && (
                    <Polyline
                        positions={allRoads.map(r => r.positions)}
                        color="#3b82f6"
                        weight={2}
                        opacity={0.3}
                    />
                )}

                {/* Greg's traveled path */}
                {navPath.length > 0 && lastPathIndex.current > 0 && (
                    <Polyline
                        positions={navPath.slice(0, lastPathIndex.current + 1)}
                        color="#22c55e"
                        weight={3}
                        opacity={0.6}
                    />
                )}

                {/* Greg Marker */}
                {currentPosition && (
                    <Marker position={currentPosition} icon={GregIcon({ rotation })}>
                        <RecenterMap position={currentPosition} />
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}

// Helper to keep map centered on marker
function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(position, 17, { animate: false });
    }, [position, map]);

    return null;
}
