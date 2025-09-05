// components/Map.tsx
"use client";

// Fetch floorplans and buildings from API
import React, { PropsWithChildren, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
// import ReactDOM from "react-dom";
import Image from "next/image";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
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

const Map = forwardRef(function Map(props: MapProps, ref) {
  const [zoom, setZoom] = useState(1);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Clamp pan so image always fills container
  const containerWidth = 896;
  const containerHeight = 683;
  const clampPan = (x: number, y: number, zoomLevel = zoom) => {
    if (zoomLevel <= 1) {
      return { x: 0, y: 0 };
    }
    const imgWz = containerWidth * zoomLevel;
    const imgHz = containerHeight * zoomLevel;
    const maxX = Math.max(0, (imgWz - containerWidth) / 2);
    const maxY = Math.max(0, (imgHz - containerHeight) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  // Expose zoomToArea, resetZoom, and pan methods to parent via ref
  useImperativeHandle(ref, () => {
    return {
      zoomToArea: (x1: number, y1: number, x2: number, y2: number) => {
        if (!transformRef.current) return;
        // Center between points
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        // Calculate zoom so both points are visible
        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
        // Add padding
        const pad = 0.08;
        const viewW = maxX - minX + pad;
        const viewH = maxY - minY + pad;
        // Clamp to [0,1]
        const zoomLevel = 1 / Math.max(viewW, viewH);
        transformRef.current.setTransform(centerX * 100, centerY * 100, Math.min(2.5, Math.max(zoomLevel, 1.2)), 200, 'easeOut');
      },
      resetZoom: () => {
        if (!transformRef.current) return;
        transformRef.current.resetTransform();
      },
      panBy: (deltaX: number, deltaY: number) => {
        if (!transformRef.current || !transformRef.current.setTransform) return;
        try {
          const state = transformRef.current.instance?.transformState || {};
          const { positionX = 0, positionY = 0, scale = 1 } = state;
          const next = clampPan(positionX + deltaX, positionY + deltaY, scale);
          transformRef.current.setTransform(next.x, next.y, scale);
        } catch (error) {
          console.warn('panBy error:', error);
        }
      },
      panToTopLeft: () => {
        if (!transformRef.current || !transformRef.current.setTransform) return;
        try {
          const state = transformRef.current.instance?.transformState || {};
          const { scale = 1 } = state;
          const next = clampPan(999, 999, scale);
          transformRef.current.setTransform(next.x, next.y, scale);
        } catch (error) {
          console.error('panToTopLeft error:', error);
        }
      },
      panToTopRight: () => {
        if (!transformRef.current || !transformRef.current.setTransform) return;
        try {
          const state = transformRef.current.instance?.transformState || {};
          const { scale = 1 } = state;
          const next = clampPan(-999, 999, scale);
          transformRef.current.setTransform(next.x, next.y, scale);
        } catch (error) {
          console.warn('panToTopRight error:', error);
        }
      },
      panToBottomLeft: () => {
        if (!transformRef.current || !transformRef.current.setTransform) return;
        try {
          const state = transformRef.current.instance?.transformState || {};
          const { scale = 1 } = state;
          const next = clampPan(999, -999, scale);
          transformRef.current.setTransform(next.x, next.y, scale);
        } catch (error) {
          console.warn('panToBottomLeft error:', error);
        }
      },
      panToBottomRight: () => {
        if (!transformRef.current || !transformRef.current.setTransform) return;
        try {
          const state = transformRef.current.instance?.transformState || {};
          const { scale = 1 } = state;
          const next = clampPan(-999, -999, scale);
          transformRef.current.setTransform(next.x, next.y, scale);
        } catch (error) {
          console.warn('panToBottomRight error:', error);
        }
      },
      setZoom: (newZoom: number) => {
        if (!transformRef.current || !transformRef.current.setTransform) return;
        try {
          const state = transformRef.current.instance?.transformState || {};
          const { positionX = 0, positionY = 0 } = state;
          const next = clampPan(positionX, positionY, newZoom);
          transformRef.current.setTransform(next.x, next.y, newZoom);
        } catch (error) {
          console.warn('setZoom error:', error);
        }
      },
      zoomIn: () => {
        if (!transformRef.current || !transformRef.current.zoomIn) return;
        transformRef.current.zoomIn();
      },
      zoomOut: () => {
        if (!transformRef.current || !transformRef.current.zoomOut) return;
        transformRef.current.zoomOut();
      },
      getPan: () => {
        if (!transformRef.current) return { x: 0, y: 0 };
        const state = transformRef.current.instance?.transformState || {};
        return { x: state.positionX || 0, y: state.positionY || 0 };
      },
      getZoom: () => {
        if (!transformRef.current) return 1;
        const state = transformRef.current.instance?.transformState || {};
        return state.scale || 1;
      }
    };
  }, [zoom]);

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
        background: "repeating-linear-gradient(to right, black 0 6px, transparent 6px 12px, #febe30 12px 18px, transparent 18px 24px)", // or just black
        borderTop: "none"
      };
    }
    return {};
  };

  return (
    <>
      <div className="w-full h-full bg-gray-50" style={{ position: "relative" }}>
        <TransformWrapper
          ref={transformRef}
          onZoom={(ref) => setZoom(ref.state.scale)}
        >
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

              {props.xCoor != null &&
                props.yCoor != null &&
                props.xRightCoor != null &&
                props.yRightCoor != null && <div style={lineStyle()}></div>}
              {props.xCoor != null && props.yCoor != null && (
                <div
                  style={{
                    top: `${(props.yCoor as number) * 100}%`,
                    left: `${(props.xCoor as number) * 100}%`,
                    position: "absolute",
                    pointerEvents: "none",
                    transform: "translate(-50%, -100%)", // marker tip at point
                    zIndex: 10,
                  }}
                >
                  <FaMapMarkerAlt
                    size={Math.max(10, 28 / zoom)}
                    color="red"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                </div>
              )}
              {props.xRightCoor != null && props.yRightCoor != null && (
                <div
                  style={{
                    top: `${(props.yRightCoor as number) * 100}%`,
                    left: `${(props.xRightCoor as number) * 100}%`,
                    position: "absolute",
                    pointerEvents: "none",
                    transform: "translate(-50%, -100%)", // marker tip at point
                    zIndex: 10,
                  }}
                >
                  <FaMapMarkerAlt
                    size={Math.max(10, 28 / zoom)}
                    color="limegreen"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                </div>
              )}
              {props.children}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </>
  );
});
export default Map;
