import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type Dot = { x: number; y: number; building: string };
type PendingDot = { x: number; y: number } | null;
type BuildingFloors = Record<
  string,
  Array<{ filename: string; floor: string }>
>;

const campusMapUrl = "/uw campus map.png";

export default function ManualDotPlacer() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [pendingDot, setPendingDot] = useState<PendingDot>(null);
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingFloors, setBuildingFloors] = useState<BuildingFloors>({});

  useEffect(() => {
    fetch("/api/floorplans")
      .then((res) => res.json())
      .then(
        (data: {
          floorplans: { building: string; filename: string; floor: string }[];
        }) => {
          // Group floorplans by building
          const floors: BuildingFloors = {};
          if (data.floorplans) {
            data.floorplans.forEach((fp) => {
              if (!fp.building || fp.building === "UNKNOWN") return;
              if (!floors[fp.building]) floors[fp.building] = [];
              floors[fp.building].push({
                filename: fp.filename,
                floor: fp.floor,
              });
            });
          }
          setBuildingFloors(floors);
        }
      );
  }, []);

  // Use right-click (contextmenu) to place dot (attach to parent div)
  function handleMapContextMenu(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    const img = e.currentTarget.querySelector("img");
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      setPendingDot({ x, y });
      setBuildingCode("");
    }
  }

  // Save dot with code
  function handleSaveDot() {
    if (!buildingCode.trim() || !pendingDot) return;
    setDots([
      ...dots,
      { x: pendingDot.x, y: pendingDot.y, building: buildingCode.trim() },
    ]);
    setPendingDot(null);
    setBuildingCode("");
  }

  // Drag logic
  const dragDotIndex = useRef<number | null>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  function handleDotMouseDown(e: React.MouseEvent<HTMLDivElement>, i: number) {
    e.stopPropagation();
    dragDotIndex.current = i;
    const rect = (
      e.currentTarget.parentElement as HTMLDivElement
    ).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    dragOffset.current = { x: x - dots[i].x, y: y - dots[i].y };
    document.addEventListener("mousemove", handleDotMouseMove);
    document.addEventListener("mouseup", handleDotMouseUp);
  }

  function handleDotMouseMove(e: MouseEvent) {
    if (dragDotIndex.current === null || dragOffset.current === null) return;
    const container = document.getElementById("dot-map-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - dragOffset.current.x;
    const y = (e.clientY - rect.top) / rect.height - dragOffset.current.y;
    setDots((prev) =>
      prev.map((dot, idx) =>
        idx === dragDotIndex.current
          ? {
              ...dot,
              x: Math.max(0, Math.min(1, x)),
              y: Math.max(0, Math.min(1, y)),
            }
          : dot
      )
    );
  }

  function handleDotMouseUp() {
    dragDotIndex.current = null;
    dragOffset.current = null;
    document.removeEventListener("mousemove", handleDotMouseMove);
    document.removeEventListener("mouseup", handleDotMouseUp);
  }

  function handleDeleteDot(i: number) {
    setDots((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Export JSON
  function handleExport() {
    const json = JSON.stringify(dots, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manual_building_lookup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f8f8f8" }}>
      <div style={{ display: "flex", alignItems: "center", margin: 8 }}>
        <h2 style={{ margin: 0, marginRight: 16 }}>
          Manual Building Dot Placer
        </h2>
        <button
          onClick={handleExport}
          style={{ fontSize: 16, padding: "8px 16px" }}
        >
          Export JSON
        </button>
        <span style={{ marginLeft: 16, color: "#888" }}>
          Dots placed: {dots.length}
        </span>
      </div>
      <div
        id="dot-map-container"
        style={{
          position: "relative",
          width: "80vw",
          height: "80vh",
          margin: "auto",
        }}
      >
        <TransformWrapper>
          <TransformComponent>
            <div
              style={{ position: "relative", width: "100%", height: "100%" }}
              onContextMenu={handleMapContextMenu}
            >
              <Image
                src={campusMapUrl}
                alt="Campus Map"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              {/* Render placed dots */}
              {dots.map((dot, i) => {
                const [hovered, setHovered] = useState(false);
                // Use a wrapper to allow hover state per dot
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: `${dot.y * 100}%`,
                      left: `${dot.x * 100}%`,
                      width: 21,
                      height: 21,
                      borderRadius: "50%",
                      background: "yellow",
                      border: "2px solid #888",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                      fontWeight: "bold",
                      color: "#222",
                      fontSize: 12,
                      cursor: "grab",
                      userSelect: "none",
                    }}
                    title={dot.building}
                    onMouseDown={(e) => handleDotMouseDown(e, i)}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                  >
                    {dot.building}
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleDeleteDot(i);
                      }}
                      style={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#f44",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        cursor: "pointer",
                        zIndex: 20,
                      }}
                      title="Delete dot"
                    >
                      ×
                    </button>
                    {/* Dropdown with floor buttons on hover */}
                    {hovered && buildingFloors[dot.building] && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "110%",
                          transform: "translateY(-50%)",
                          background: "#fff",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          padding: "6px 12px",
                          minWidth: "60px",
                          zIndex: 30,
                          pointerEvents: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {buildingFloors[dot.building].map(
                          (floorObj: { filename: string; floor: string }) => (
                            <button
                              key={floorObj.filename}
                              style={{
                                display: "block",
                                width: "100%",
                                margin: "2px 0",
                                padding: "4px 8px",
                                fontSize: "12px",
                                background: "#eee",
                                border: "1px solid #bbb",
                                borderRadius: "4px",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              onClick={() =>
                                window.open(
                                  `/clean_floorplans/${floorObj.filename}`,
                                  "_blank"
                                )
                              }
                            >
                              {floorObj.floor.replace("FLR", "")}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Pending dot input */}
              {pendingDot && (
                <div
                  style={{
                    position: "absolute",
                    top: `${pendingDot.y * 100}%`,
                    left: `${pendingDot.x * 100}%`,
                    transform: "translate(-50%, -120%)",
                    zIndex: 20,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    minWidth: 120,
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <label>Building Code: </label>
                    <input
                      type="text"
                      value={buildingCode}
                      onChange={(e) => setBuildingCode(e.target.value)}
                      style={{ width: 60, fontWeight: "bold" }}
                      autoFocus
                    />
                  </div>
                  <button onClick={handleSaveDot} style={{ marginRight: 8 }}>
                    Save
                  </button>
                  <button onClick={() => setPendingDot(null)}>Cancel</button>
                </div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}
