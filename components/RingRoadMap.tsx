"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";



// Fix for default marker icon in Leaflet with Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const GregIcon = ({ rotation }: { rotation: number }) => {
    return L.divIcon({
        html: `<div style="transform: rotate(${rotation}deg); transition: transform 0.1s linear;">
             <img src="/greg for conc.png" style="width: 50px; height: 50px; pointer-events: none;" />
           </div>`,
        className: 'bg-transparent',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
    });
};

type Node = {
    id: string; // "lat,lon" key
    lat: number;
    lon: number;
    connections: string[]; // ids of connected nodes
    pathNames: string[]; // Names of paths this node belongs to
};

export default function RingRoadMap() {
    const [navPath, setNavPath] = useState<[number, number][]>([]); // The generated random walk
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
    const [status, setStatus] = useState("Loading Campus Graph...");
    const [rotation, setRotation] = useState(0);

    // Checkpoint State
    const [isScrolling, setIsScrolling] = useState(false);
    const [lastScrollTime, setLastScrollTime] = useState(0);
    const [showCheckpoint, setShowCheckpoint] = useState(false);
    const [checkpointData, setCheckpointData] = useState({ distance: 0, location: "Unknown" });

    // Graph Data
    const [nodes, setNodes] = useState<Record<string, Node>>({});

    // 1. Fetch & Build Graph from Local GeoJSON
    useEffect(() => {
        const buildGraph = async () => {
            try {
                const response = await fetch("/uw_roads.geojson");
                const data = await response.json();
                const newNodes: Record<string, Node> = {};

                // Helper to get/create node
                const getNode = (lat: number, lon: number): Node => {
                    // Snap to grid slightly to merge close points (approx 1-2m)
                    // 0.0001 deg ~ 11 meters. Let's go tighter: 0.00002 ~ 2m
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
                        // Only use LineStrings for the path graph
                        if (feature.geometry && feature.geometry.type === "LineString") {
                            const name = feature.properties?.name || "Campus Path";
                            const coords = feature.geometry.coordinates; // [lon, lat] for GeoJSON!

                            for (let i = 0; i < coords.length - 1; i++) {
                                // GeoJSON is [Lon, Lat]
                                const p1 = coords[i];
                                const p2 = coords[i + 1];

                                // Store as Lat, Lon for Leaflet
                                const n1 = getNode(p1[1], p1[0]);
                                const n2 = getNode(p2[1], p2[0]);

                                // Add connections (undirected)
                                if (!n1.connections.includes(n2.id)) n1.connections.push(n2.id);
                                if (!n2.connections.includes(n1.id)) n2.connections.push(n1.id);

                                if (!n1.pathNames.includes(name)) n1.pathNames.push(name);
                                if (!n2.pathNames.includes(name)) n2.pathNames.push(name);
                            }
                        }
                    });

                    setNodes(newNodes);

                    // Generate Initial Random Walk
                    const nodeKeys = Object.keys(newNodes);
                    // Try to find Ring Road, otherwise just pick a random node
                    let startNodeId = nodeKeys.find(k => newNodes[k].pathNames.some(n => n && n.includes("Ring Road")));
                    if (!startNodeId) startNodeId = nodeKeys[Math.floor(Math.random() * nodeKeys.length)];

                    if (startNodeId) {
                        const walk: [number, number][] = [];
                        let current = newNodes[startNodeId];
                        walk.push([current.lat, current.lon]);

                        let prevId: string | null = null;

                        // Generate path
                        for (let i = 0; i < 5000; i++) {
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
                        setStatus("Loaded Local Campus Map. Scroll to Explore!");
                    }
                }
            } catch (e) {
                console.error("Graph build error", e);
                setStatus("Error loading local map data.");
            }
        };
        buildGraph();
    }, []);

    // 2. Handle Scroll & Checkpoint Detection
    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            // 1. Update Progress
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;

            // Update rotation
            setRotation(r => r + 20); // Simple spin per event

            // Calculate position along the generated walk
            // Mapping: 1 entire scroll height (e.g. 500vh or 2000vh) = 1000 segments of our walk?
            // Or just map smoothly... 
            // Let's say 1px scroll = 1 meter? Or 1 segment?
            // Let's go with 1px = 0.5% of a segment? No that's slow.
            // Let's map Scroll % to Path Index directly.
            if (scrollHeight > 0 && navPath.length > 0) {
                const progress = scrolled / scrollHeight;
                // Total path length is navPath.length-1 segments.
                // If we want "infinite" feel, we might need to regenerate... 
                // For now, let's map the huge path to the huge scroll.
                const targetIdx = Math.min(Math.floor(progress * (navPath.length - 1)), navPath.length - 2);
                const segmentProgress = (progress * (navPath.length - 1)) % 1;

                if (targetIdx >= 0) {
                    const p1 = navPath[targetIdx];
                    const p2 = navPath[targetIdx + 1];
                    const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
                    const lon = p1[1] + (p2[1] - p1[1]) * segmentProgress;
                    setCurrentPosition([lat, lon]);
                }
            }

            // 2. Stop Detection
            setIsScrolling(true);
            setShowCheckpoint(false);
            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
                // User stopped! Calculate checkpoint data.
                if (scrollHeight > 0 && navPath.length > 0) {
                    const progress = scrolled / scrollHeight;
                    const targetIdx = Math.floor(progress * (navPath.length - 1));

                    // Distance roughly (sum of segments up to here)
                    // We can approximate or pre-calc.
                    const estMeters = targetIdx * 10; // Averaging 10m per segment? Simple proxy.

                    // Location Name
                    // Need to find the node we are at/near
                    // currentPosition is approx navPath[targetIdx]
                    // Find corresponding node
                    if (targetIdx < navPath.length) {
                        const pt = navPath[targetIdx];
                        // Reverse lookup in nodes? Expensive. 
                        // Wait, we didn't store node refs in navPath, just coords. 
                        // But we generated navPath FROM nodes.
                        // We can just rely on generic labels for now or find nearest node.
                        // Let's use a "Distance Travelled" metric.
                        setCheckpointData({
                            distance: Math.round(estMeters),
                            location: "Unknown Path" // Need efficient lookup or just "Campus Path"
                        });
                        setShowCheckpoint(true);
                    }
                }
            }, 300); // 300ms debounce
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [navPath]);

    return (
        <div className="relative w-full h-[100vh]">
            {/* Top Status */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-6 py-3 rounded-full shadow-xl text-center backdrop-blur-sm pointer-events-none transition-opacity duration-300"
                style={{ opacity: showCheckpoint ? 0 : 1 }}>
                <h1 className="font-bold text-lg text-blue-900">Ring Road Scroller</h1>
                <p className="text-xs text-gray-500">{status}</p>
            </div>

            {/* Checkpoint Pop-up */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] transition-all duration-500 ${showCheckpoint ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
                <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-blue-500 text-center transform rotate-1">
                    <div className="text-4xl mb-2">🛑</div>
                    <h2 className="text-3xl font-black text-blue-900 mb-2 uppercase tracking-wide">Checkpoint</h2>
                    <div className="bg-gray-100 rounded-xl p-4 mb-4">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Distance</p>
                        <p className="text-4xl font-black text-blue-600 font-mono">{checkpointData.distance}m</p>
                    </div>
                    <p className="text-gray-500 italic text-sm">Scroll to continue your journey...</p>
                </div>
            </div>

            <MapContainer
                center={[43.4723, -80.5449]}
                zoom={16}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                touchZoom={false}
                className="w-full h-full bg-[#f8f9fa]"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                />

                {/* Render Generated Walk Path */}
                {navPath.length > 0 && (
                    <Polyline positions={navPath} color="#3b82f6" weight={6} opacity={0.5} lineCap="round" lineJoin="round" />
                )}

                {/* Moving Greg Marker */}
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
        map.setView(position);
    }, [position, map]);
    return null;
}
