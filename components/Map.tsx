// components/Map.tsx
"use client";

// Fetch floorplans and buildings from API
import React, { PropsWithChildren } from "react"; // useRef, useState, useEffect are unused
// import ReactDOM from "react-dom";
import Image from "next/image";
import {
  TransformWrapper,
  TransformComponent,
  // ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

// interface Floorplan {
//   _id: string;
//   filename: string;
//   image_base64: string;
// }
// interface Building {
//   _id: string;
//   building: string;
//   x: number;
//   y: number;
// }

interface MapProps extends PropsWithChildren {
  xCoor: number | null;
  yCoor: number | null;
  setXCoor: (value: number) => void;
  setYCoor: (value: number) => void;
  xRightCoor: number | null;
  yRightCoor: number | null;
  disabled?: boolean;
  aspectRatio?: number; // width / height
}

export default function Map(props: MapProps) {
  // --- Future-use state and refs preserved as comments ---
  // const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  // const [buildings, setBuildings] = useState<Building[]>([]);
  // const mapImgRef = useRef<HTMLImageElement>(null);
  // const [modalImg, setModalImg] = useState<string | null>(null);
  // const zoomOffsetX = useRef(0);
  // const zoomOffsetY = useRef(0);
  // const zoomScale = useRef(1);
  // const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  // const hideDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  // Helper to parse floor type from filename
  // function getFloorLabel(filename: string) {
  //   // Match _B1FLR, _01FLR, _02FLR, _03FLR, _04FLR, _02FLR_MEZ, etc.
  //   const match = filename.match(/_((B\d|\d{2})FLR)(?:_MEZ)?/i);
  //   if (match) {
  //     const code = match[1].toUpperCase();
  //     if (filename.toUpperCase().includes('MEZ')) {
  //       return 'Mezzanine';
  //     }
  //     if (code.startsWith('B')) {
  //       // Basement
  //       return `Basement ${code[1]}`;
  //     } else {
  //       // Floor number
  //       const num = parseInt(code.slice(0,2), 10);
  //       if (num === 1) return '1st Floor';
  //       if (num === 2) return '2nd Floor';
  //       if (num === 3) return '3rd Floor';
  //       if (num === 4) return '4th Floor';
  //       return `${num}th Floor`;
  //     }
  //   }
  //   return 'Unknown';
  // }

  // Helper to get building code from filename
  // function getBuildingCode(filename: string) {
  //   // Match: 001DWE_01FLR.pdf, 002E2_01FLR.pdf, 005ML_01FLR.pdf, etc.
  //   // Building code is after digits and before _
  //   const match = filename.match(/^\d+([A-Z0-9]+)_/i);
  //   return match ? match[1] : 'UNKNOWN';
  // }
  // Helper to clean floorplan filename to 'BUILDING Floor XX'
  // function getCleanFloorplanName(filename: string) {
  //   // Example: 019SLC_02FLR_page1.png
  //   // Extract building code (letters after first digits, before _)
  //   // Extract floor number (digits after _ and before FLR)
  //   const match = filename.match(/\d+([A-Z]+)_([0-9]+)FLR/i);
  //   if (match) {
  //     const building = match[1];
  //     const floor = match[2];
  //     return `${building} Floor ${floor}`;
  //   }
  //   return filename;
  // }
  // Helper to get building code prefix from filename
  // function entryCode(building: string) {
  //   return building + "_";
  // }
  // const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  // const [buildings, setBuildings] = useState<Building[]>([]);
  // const mapImgRef = useRef<HTMLImageElement>(null);
  // const [modalImg, setModalImg] = useState<string | null>(null);
  // const zoomOffsetX = useRef(0);
  // const zoomOffsetY = useRef(0);
  // const zoomScale = useRef(1);
  // const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  // const hideDropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   fetch("/api/floorplans")
  //     .then(res => res.json())
  //     .then(data => {
  //       setFloorplans(data.floorplans || []);
  //       setBuildings(data.buildings || []);
  //     });
  // }, []);

  // function getDotSize() {
  //   const img = mapImgRef.current;
  //   if (!img) return 12; // fallback
  //   if (props.aspectRatio) {
  //     const base = 14;
  //     const scale = Math.sqrt(props.aspectRatio);
  //     return Math.max(8, Math.min(20, base * scale));
  //   }
  //   const minDim = Math.min(img.clientWidth, img.clientHeight);
  //   return Math.max(8, Math.min(20, minDim * 0.025));
  // }

  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    if (props.disabled) return;
    const img = event.currentTarget as HTMLImageElement;
    const x = event.nativeEvent.offsetX / img.clientWidth;
    const y = event.nativeEvent.offsetY / img.clientHeight;
    props.setXCoor(x);
    props.setYCoor(y);
  }

  const lineStyle = () => {
    if (
      props.xCoor != null &&
      props.yCoor != null &&
      props.xRightCoor != null &&
      props.yRightCoor != null
    ) {
      const parent = document.querySelector(".MapPicture");
      if (!parent) return {};
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      const x1 = props.xCoor * parentWidth;
      const y1 = props.yCoor * parentHeight;
      const x2 = props.xRightCoor * parentWidth;
      const y2 = props.yRightCoor * parentHeight;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      return {
        position: "absolute" as const,
        top: `${y1}px`,
        left: `${x1}px`,
        width: `${length}px`,
        transform: `rotate(${angle}deg) translate(0, -50%)`,
        transformOrigin: "0 0",
        height: "1.5px",
        backgroundColor: "black",
      };
    }
    return {};
  };

  // function handleZoom(ref: ReactZoomPanPinchRef, _: any) {
  //   // ref and _ are unused
  //   // zoomOffsetX.current = -ref.state.positionX;
  //   // zoomOffsetY.current = -ref.state.positionY;
  //   // zoomScale.current = ref.state.scale;
  // }

  // function handlePan(ref: ReactZoomPanPinchRef, _: any) {
  //   // ref and _ are unused
  //   // zoomOffsetX.current = -ref.state.positionX;
  //   // zoomOffsetY.current = -ref.state.positionY;
  //   // zoomScale.current = ref.state.scale;
  // }

  return (
    <>
      <div className="w-full h-full bg-gray-50" style={{position: "relative"}}>
        <TransformWrapper>
          <TransformComponent>
            <div onClick={handleClick} className="w-full h-full cursor-crosshair relative">
              <Image
                /* ref={mapImgRef} */
                className="MapPicture w-full h-full select-none"
                src="/uw campus map.png"
                alt="Campus Map"
                width={896}
                height={683}
                draggable={false}
                unoptimized
                priority
                style={{ width: "100%", height: "100%", display: "block", pointerEvents: "auto" }}
                onError={e => { console.error('Campus map image failed to load', e); }}
              />
              {/*
              Invisible interactive circles for each building from DB
              {buildings.map((entry) => {
                // Remove highlight/border for active building
                return (
                  <div
                    key={entry._id}
                    style={{
                      position: "absolute",
                      top: `${entry.y * 100}%`,
                      left: `${entry.x * 100}%`,
                      width: `${getDotSize()}px`,
                      height: `${getDotSize()}px`,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 0, 0.5)",
                      border: "none",
                      cursor: "pointer",
                      transform: "translate(-50%, -50%)",
                      zIndex: 20,
                    }}
                    title={entry.building}
                    onClick={e => {
                      e.stopPropagation();
                      setActiveBuilding(entry.building);
                    }}
                  />
                );
              })}
              */}
              {props.xCoor != null &&
                props.yCoor != null &&
                props.xRightCoor != null &&
                props.yRightCoor != null && (
                  <div style={lineStyle()}></div>
                )}
              {props.xCoor != null && props.yCoor != null && (
                <div
                  style={{
                    top: `${(props.yCoor as number) * 100}%`,
                    left: `${(props.xCoor as number) * 100}%`,
                    position: "absolute",
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    backgroundColor: "red",
                    pointerEvents: "none",
                    transform: "translate(-50%, -50%)",
                  }}
                  className="z-10"
                ></div>
              )}
              {props.xRightCoor != null && props.yRightCoor != null && (
                <div
                  style={{
                    top: `${(props.yRightCoor as number) * 100}%`,
                    left: `${(props.xRightCoor as number) * 100}%`,
                    position: "absolute",
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    backgroundColor: "limegreen",
                    pointerEvents: "none",
                    transform: "translate(-50%, -50%)",
                  }}
                  className="z-10"
                ></div>
              )}
              {props.children}
            </div>
          </TransformComponent>
        </TransformWrapper>
        {/*
        Dropdown for floorplans of active building (positioned beside yellow circle)
        {activeBuilding && (() => {
          // Find the active building's coordinates
          const building = buildings.find(b => b.building === activeBuilding);
          if (!building) return null;
          // Get parent map container size
          const parent = mapImgRef.current;
          let leftPx = 0, topPx = 0;
          if (parent) {
            leftPx = building.x * parent.clientWidth;
            topPx = building.y * parent.clientHeight;
          }
          // Offset to the right of the circle
          const offsetX = 24; // px
          return (
            <div
              style={{
                position: "absolute",
                left: leftPx + offsetX,
                top: topPx,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                padding: 12,
                zIndex: 1000,
                minWidth: 220,
                maxWidth: 320,
                maxHeight: 320,
                overflowY: "auto",
                transform: "translateY(-50%)"
              }}
            >
              <div style={{fontWeight: "bold", marginBottom: 8}}>{activeBuilding}</div>
              {(() => {
                // Get all floorplans for this building
                const plans = floorplans.filter(fp => getBuildingCode(fp.filename) === activeBuilding);
                if (plans.length === 0) return <div style={{color: "#888"}}>No floorplans found.</div>;
                // Get unique floor labels
                const uniqueFloors = Array.from(new Set(plans.map(fp => getFloorLabel(fp.filename))));
                // Sort: regular floors (descending), basements (ascending, last)
                uniqueFloors.sort((a, b) => {
                  const isBasementA = a.startsWith('Basement');
                  const isBasementB = b.startsWith('Basement');
                  if (!isBasementA && !isBasementB) {
                    // Descending regular floor order (3rd, 2nd, 1st)
                    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
                    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
                    return numB - numA;
                  }
                  if (isBasementA && isBasementB) {
                    // Ascending basement order (Basement 1, Basement 2)
                    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
                    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
                    return numA - numB;
                  }
                  // Basements always last
                  if (isBasementA) return 1;
                  if (isBasementB) return -1;
                  return 0;
                });
                return uniqueFloors.map(floorLabel => (
                  <div
                    key={floorLabel}
                    style={{
                      padding: "6px 0",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      // Find first matching plan for this floor
                      const plan = plans.find(fp => getFloorLabel(fp.filename) === floorLabel);
                      if (plan) setModalImg(`data:image/png;base64,${plan.image_base64}`);
                    }}
                  >
                    {floorLabel}
                  </div>
                ));
              })()}
              <button
                style={{marginTop: 8, background: "#eee", border: "none", borderRadius: 4, padding: "4px 12px", cursor: "pointer"}}
                onClick={() => setActiveBuilding(null)}
              >Close</button>
            </div>
          );
        })()}
        */}
      </div>
      {/* Modal for PNG floorplan (portal) */}
      {/* {modalImg && ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setModalImg(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
              padding: 16,
              maxWidth: "90vw",
              maxHeight: "90vh",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "#f44",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                fontWeight: "bold",
                cursor: "pointer",
                zIndex: 10001
              }}
              onClick={() => setModalImg(null)}
            >Close</button>
            <img
              src={modalImg}
              alt="Floorplan"
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                display: "block",
                borderRadius: 8
              }}
            />
          </div>
        </div>,
        document.body
      )} */}
    </>
  );
}
