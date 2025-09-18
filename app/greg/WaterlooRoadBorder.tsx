"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

// Only register GSAP plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Function to fetch and parse Ring Road LineStrings from export.geojson
async function getRingRoadLineStrings(): Promise<[number, number][][]> {
  const res = await fetch("/export.geojson");
  const geojson = await res.json();
  // Filter for features with name "Ring Road" and geometry type "LineString"
  return geojson.features
    .filter(
      (f: any) =>
        f.properties?.name === "Ring Road" &&
        f.geometry?.type === "LineString" &&
        Array.isArray(f.geometry.coordinates)
    )
    .map((f: any) => f.geometry.coordinates);
}

// Mercator projection for SVG
function mercatorProject(
  [lng, lat]: [number, number],
  width: number,
  height: number,
  bounds: { minLng: number; minLat: number; maxLng: number; maxLat: number }
) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const minLatRad = (bounds.minLat * Math.PI) / 180;
  const maxLatRad = (bounds.maxLat * Math.PI) / 180;
  const mercMin = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
  const mercMax = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
  const y = (1 - (mercN - mercMin) / (mercMax - mercMin)) * height;
  return [x, y];
}

function lineStringToSvgPath(
  coords: [number, number][],
  width: number,
  height: number,
  bounds: { minLng: number; minLat: number; maxLng: number; maxLat: number }
) {
  if (coords.length === 0) return "";
  const projected = coords.map((pt) =>
    mercatorProject(pt, width, height, bounds)
  );
  return projected.reduce(
    (acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : `L${x},${y}`),
    ""
  );
}

// Function to connect multiple LineStrings into one continuous path
function connectLineStrings(
  lineStrings: [number, number][][]
): [number, number][] {
  if (lineStrings.length === 0) return [];
  if (lineStrings.length === 1) return lineStrings[0];

  let connected = [...lineStrings[0]];
  const remaining = lineStrings.slice(1);

  while (remaining.length > 0) {
    const lastPoint = connected[connected.length - 1];
    let bestIndex = -1;
    let bestDistance = Infinity;
    let shouldReverse = false;

    // Find the closest line segment to connect
    for (let i = 0; i < remaining.length; i++) {
      const line = remaining[i];
      const startPoint = line[0];
      const endPoint = line[line.length - 1];

      // Distance to start of line
      const distToStart = Math.sqrt(
        Math.pow(lastPoint[0] - startPoint[0], 2) +
          Math.pow(lastPoint[1] - startPoint[1], 2)
      );

      // Distance to end of line (would need to reverse)
      const distToEnd = Math.sqrt(
        Math.pow(lastPoint[0] - endPoint[0], 2) +
          Math.pow(lastPoint[1] - endPoint[1], 2)
      );

      if (distToStart < bestDistance) {
        bestDistance = distToStart;
        bestIndex = i;
        shouldReverse = false;
      }

      if (distToEnd < bestDistance) {
        bestDistance = distToEnd;
        bestIndex = i;
        shouldReverse = true;
      }
    }

    if (bestIndex >= 0) {
      const nextLine = remaining[bestIndex];
      const lineToAdd = shouldReverse ? [...nextLine].reverse() : nextLine;

      // Skip the first point to avoid duplication
      connected.push(...lineToAdd.slice(1));
      remaining.splice(bestIndex, 1);
    } else {
      // If no close connection found, just append remaining lines
      remaining.forEach((line) => {
        connected.push(...line.slice(1));
      });
      break;
    }
  }

  return connected;
}

const svgWidth = 800;
const svgHeight = 600;

export default function WaterlooRoadBorder() {
  const [ringRoads, setRingRoads] = useState<[number, number][][]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Flatten all coordinates for bounds calculation
  const allCoords = ringRoads.flat();
  const bounds =
    allCoords.length > 0
      ? {
          minLng: Math.min(...allCoords.map(([lng]) => lng)),
          minLat: Math.min(...allCoords.map(([, lat]) => lat)),
          maxLng: Math.max(...allCoords.map(([lng]) => lng)),
          maxLat: Math.max(...allCoords.map(([, lat]) => lat)),
        }
      : { minLng: 0, minLat: 0, maxLng: 0, maxLat: 0 };

  // For GSAP animation, connect all Ring Road LineStrings into one continuous path
  const connectedRingRoad =
    ringRoads.length > 0 ? connectLineStrings(ringRoads) : [];
  const svgPathD =
    connectedRingRoad.length > 0
      ? lineStringToSvgPath(connectedRingRoad, svgWidth, svgHeight, bounds)
      : "";

  // Debug info
  if (connectedRingRoad.length > 0) {
    console.log(
      `Connected Ring Road: ${connectedRingRoad.length} total points`
    );
  }

  useEffect(() => {
    getRingRoadLineStrings().then((roads) => {
      console.log(`Found ${roads.length} Ring Road LineStrings`);
      roads.forEach((road, i) => {
        console.log(`LineString ${i}: ${road.length} points`);
      });
      setRingRoads(roads);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && svgPathD && isClient && typeof window !== "undefined") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const path = document.getElementById(
          "ring-road-path"
        ) as unknown as SVGPathElement;
        const dot = document.getElementById(
          "ring-road-dot"
        ) as unknown as SVGCircleElement;

        if (!path || !dot) {
          console.log("Path or dot element not found");
          return;
        }

        const pathLength = path.getTotalLength();
        console.log("Path length:", pathLength);

        // Set up stroke dash animation
        path.style.strokeDasharray = String(pathLength);
        path.style.strokeDashoffset = String(pathLength);

        // Initialize dot at start of path
        const startPoint = path.getPointAtLength(0);
        dot.setAttribute("cx", String(startPoint.x));
        dot.setAttribute("cy", String(startPoint.y));

        // Clear any existing ScrollTriggers
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

        // Create timeline for synchronized animations
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#scrollDist",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              const point = path.getPointAtLength(progress * pathLength);
              dot.setAttribute("cx", String(point.x));
              dot.setAttribute("cy", String(point.y));
            },
          },
        });

        // Add path drawing animation to timeline
        tl.to(
          path,
          {
            strokeDashoffset: 0,
            ease: "none",
          },
          0
        );

        // Extended scroll trigger for continuous movement after path is complete
        ScrollTrigger.create({
          trigger: "#scrollDist",
          start: "bottom bottom",
          end: "+=200vh", // Additional scroll distance for continuous movement
          scrub: 1,
          onUpdate: (self) => {
            // Continue moving the dot around the path based on additional scroll
            const extraProgress = self.progress;
            const totalProgress = (1 + extraProgress) % 1; // Loop back to start
            const point = path.getPointAtLength(totalProgress * pathLength);
            dot.setAttribute("cx", String(point.x));
            dot.setAttribute("cy", String(point.y));
          },
        });

        // Fade in container
        gsap.to("#container", {
          duration: 1,
          opacity: 1,
          ease: "power2.inOut",
          delay: 0.3,
        });

        // Center container
        const centerContainer = () => {
          gsap.set("#container", {
            left: window.innerWidth / 2 - svgWidth / 2,
            top: window.innerHeight / 2 - svgHeight / 2,
          });
        };
        centerContainer();
        window.addEventListener("resize", centerContainer);

        // Cleanup
        return () => {
          window.removeEventListener("resize", centerContainer);
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      }, 100);
    }
  }, [loading, svgPathD, isClient]);

  if (!isClient) {
    return <div style={{ padding: 32, fontSize: 18 }}>Loading...</div>;
  }

  if (loading) {
    return (
      <div style={{ padding: 32, fontSize: 18 }}>Loading Ring Road data...</div>
    );
  }

  return (
    <>
      <div
        id="scrollDist"
        style={{
          height: "400vh",
          background: "#eee",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 0,
        }}
      ></div>
      <div
        id="container"
        style={{
          position: "fixed",
          opacity: 0.3,
          background: "rgba(255,255,255,0.9)",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ border: "1px solid #ccc" }}
        >
          {svgPathD ? (
            <>
              <path
                id="ring-road-path"
                d={svgPathD}
                stroke="#f00"
                fill="none"
                strokeWidth={5}
              />
              <circle id="ring-road-dot" cx={0} cy={0} r={10} fill="#f00" />
            </>
          ) : (
            <text
              x={svgWidth / 2}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="#888"
            >
              No SVG Path Data
            </text>
          )}
        </svg>
      </div>
      <div style={{ marginTop: 16, position: "relative", zIndex: 1 }}>
        <h4>Ring Road Info</h4>
        <p>Separate LineStrings found: {ringRoads.length}</p>
        <p>Connected path points: {connectedRingRoad.length}</p>
        <p style={{ color: "#666", fontStyle: "italic" }}>
          💡 Keep scrolling after the path is drawn to see the dot continue
          around the Ring Road!
        </p>
        <h4>SVG Path Data</h4>
        <pre
          style={{
            fontSize: 12,
            background: "#f9f9f9",
            padding: 8,
            borderRadius: 4,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {svgPathD || "No SVG Path Data"}
        </pre>
      </div>
      <div
        style={{
          width: "800px",
          height: "600px",
          marginTop: 32,
          position: "relative",
          zIndex: 1,
        }}
      >
        <h3>OpenStreetMap Reference</h3>
        <MapContainer
          center={[43.4706, -80.5436]}
          zoom={16}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {ringRoads.map((coords, i) => (
            <Polyline
              key={i}
              positions={coords.map(([lng, lat]) => [lat, lng])}
              color="red"
              weight={6}
            />
          ))}
        </MapContainer>
      </div>
    </>
  );
}
