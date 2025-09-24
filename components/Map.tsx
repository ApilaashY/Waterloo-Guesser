// components/Map.tsx
//
// Main interactive campus map component for Waterloo-Guesser.
// Features: pan/zoom, marker placement, WASD/arrow navigation, auto-zoom to results, score/distance overlay.
// Uses react-zoom-pan-pinch for smooth map interaction.
"use client";

import React, {
  PropsWithChildren,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

// Constants for map layout and behavior
const CONTAINER_WIDTH = 765;
const CONTAINER_HEIGHT = 350;
const ZOOM_ANIMATION_DURATION = 800;
const ZOOM_ANIMATION_DELAY = 100;

/**
 * Props for the Map component
 * @property xCoor - User's guess X (normalized 0-1)
 * @property yCoor - User's guess Y (normalized 0-1)
 * @property setXCoor - Setter for guess X
 * @property setYCoor - Setter for guess Y
 * @property xRightCoor - Correct answer X (normalized 0-1)
 * @property yRightCoor - Correct answer Y (normalized 0-1)
 * @property disabled - If true, disables interaction
 * @property aspectRatio - Optional aspect ratio for layout
 * @property showScoreDisplay - Show score/distance overlay
 * @property currentScore - Optional current round score
 * @property maxScore - Maximum possible score
 */
interface MapProps extends PropsWithChildren {
  xCoor: number | null;
  yCoor: number | null;
  setXCoor: (value: number) => void;
  setYCoor: (value: number) => void;
  xRightCoor: number | null;
  yRightCoor: number | null;
  disabled?: boolean;
  aspectRatio?: number; // width / height
  showScoreDisplay?: boolean; // New prop to control score display
  currentScore?: number; // Current round score
  maxScore?: number; // Maximum possible score
  zoom: number; // Additional styles for the score display
  pan: { x: number; y: number }; // Additional styles for the score display
  imageRef: React.RefObject<HTMLImageElement | null>; // Ref to the image element for dimension calculations
}

/**
 * Map component: interactive campus map with pan/zoom, marker placement, and result overlay.
 * - WASD/arrow keys for movement
 * - Zoom presets and corner keybinds
 * - Auto-zoom to show guess and answer
 * - Displays round results (distance, score)
 */
const Map = forwardRef(function Map(props: MapProps, ref) {
  // Ref to react-zoom-pan-pinch instance
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  /**
   * Gets the actual rendered dimensions of the image element
   */
  const getImageDimensions = () => {
    if (props.imageRef.current) {
      return {
        width: props.imageRef.current.clientWidth,
        height: props.imageRef.current.clientHeight,
      };
    }
    // Fallback to the container dimensions or hardcoded values
    return {
      width: CONTAINER_WIDTH,
      height: CONTAINER_HEIGHT,
    };
  };

  /**
   * Calculates the real-world distance (meters) between two normalized map points.
   * Uses user-provided reference points for calibration.
   */
  const calculateDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    // Map image pixel dimensions
    const mapPixelWidth = 896;
    const mapPixelHeight = 683;
    // Reference points (calibrated: 79.5 meters apart)
    const ref1 = { x: 0.7042735042735043, y: 0.5448430493273543 };
    const ref2 = { x: 0.7384615384615385, y: 0.5448430493273543 };
    // Calculate pixel distance between reference points
    const refPx1 = ref1.x * mapPixelWidth;
    const refPy1 = ref1.y * mapPixelHeight;
    const refPx2 = ref2.x * mapPixelWidth;
    const refPy2 = ref2.y * mapPixelHeight;
    const refDeltaPx = refPx2 - refPx1;
    const refDeltaPy = refPy2 - refPy1;
    const refPixelDistance = Math.sqrt(
      refDeltaPx * refDeltaPx + refDeltaPy * refDeltaPy
    );
    // Calibrate meters-per-pixel so that refPixelDistance = 79.5 meters
    const metersPerPixel = 79.5 / refPixelDistance;
    // Calculate pixel distance for input points
    const px1 = x1 * mapPixelWidth;
    const py1 = y1 * mapPixelHeight;
    const px2 = x2 * mapPixelWidth;
    const py2 = y2 * mapPixelHeight;
    const deltaPx = px2 - px1;
    const deltaPy = py2 - py1;
    const pixelDistance = Math.sqrt(deltaPx * deltaPx + deltaPy * deltaPy);
    return pixelDistance * metersPerPixel;
  };

  /**
   * Returns formatted distance string for overlay (meters or km).
   */
  const getDistanceDisplay = () => {
    if (
      props.xCoor != null &&
      props.yCoor != null &&
      props.xRightCoor != null &&
      props.yRightCoor != null
    ) {
      const distance = calculateDistance(
        props.xCoor,
        props.yCoor,
        props.xRightCoor,
        props.yRightCoor
      );

      if (distance < 1000) {
        return `${Math.round(distance)}m`;
      } else {
        return `${(distance / 1000).toFixed(2)}km`;
      }
    }
    return null;
  };

  /**
   * Auto-zooms and pans to show both guess and answer markers with padding.
   * Runs when both coordinates are present.
   */
  React.useEffect(() => {
    if (
      props.xCoor != null &&
      props.yCoor != null &&
      props.xRightCoor != null &&
      props.yRightCoor != null &&
      transformRef.current
    ) {
      setTimeout(() => {
        if (transformRef.current) {
          // Center between the two points (normalized coordinates)
          const centerX = (props.xCoor! + props.xRightCoor!) / 2;
          const centerY = (props.yCoor! + props.yRightCoor!) / 2;
          // Calculate distance between points
          const deltaX = Math.abs(props.xCoor! - props.xRightCoor!);
          const deltaY = Math.abs(props.yCoor! - props.yRightCoor!);
          // Add padding around the markers
          const padding = 0.15;
          const viewWidth = Math.max(deltaX + padding, 0.3); // Minimum view width
          const viewHeight = Math.max(deltaY + padding, 0.3); // Minimum view height
          // Calculate zoom level to fit both points with padding
          const zoomLevel = Math.min(1 / viewWidth, 1 / viewHeight);
          const finalZoom = Math.min(Math.max(zoomLevel, 1.2), 2.5);
          // Convert normalized center to transform coordinates
          // Instead of shifting by containerWidth/2, just use normalized center
          // and scale to map coordinates
          const mapX = centerX * CONTAINER_WIDTH;
          const mapY = centerY * CONTAINER_HEIGHT;
          // Center the map so that the center point is in the middle of the viewport
          const offsetX = (CONTAINER_WIDTH / 2 - mapX) * finalZoom;
          const offsetY = (CONTAINER_HEIGHT / 2 - mapY) * finalZoom;
          transformRef.current.setTransform(
            offsetX,
            offsetY,
            finalZoom,
            ZOOM_ANIMATION_DURATION,
            "easeOut"
          );
        }
      }, ZOOM_ANIMATION_DELAY);
    }
  }, [props.xCoor, props.yCoor, props.xRightCoor, props.yRightCoor]);

  /**
   * Clamps pan so the image always fills the container and doesn't move out of bounds.
   * Used for keyboard/mouse movement and zoom.
   */
  const clampPan = (x: number, y: number, zoomLevel = props.zoom) => {
    const scaledWidth = CONTAINER_WIDTH * zoomLevel;
    const scaledHeight = CONTAINER_HEIGHT * zoomLevel;

    // Calculate the actual transform bounds based on image edge alignment
    // When zoomed in, image can move from "right edge aligned" to "left edge aligned"
    const minX = Math.min(0, CONTAINER_WIDTH - scaledWidth); // right edge aligned (negative when zoomed in)
    const maxX = 0; // left edge aligned (always 0)
    const minY = Math.min(0, CONTAINER_HEIGHT - scaledHeight); // bottom edge aligned (negative when zoomed in)
    const maxY = 0; // top edge aligned (always 0)

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  /**
   * Exposes map control methods to parent via ref:
   * - zoomToArea: zooms to fit two points
   * - resetZoom: resets pan/zoom
   * - panBy: pans by delta
   * - panToTopLeft/Right/BottomLeft/BottomRight: pans to corners
   * - setZoom: sets zoom level
   * - zoomIn/zoomOut: zoom controls
   * - getPan/getZoom: returns current pan/zoom
   */
  useImperativeHandle(
    ref,
    () => {
      return {
        zoomToArea: (x1: number, y1: number, x2: number, y2: number) => {
          if (!transformRef.current) return;
          // Center between points
          const centerX = (x1 + x2) / 2;
          const centerY = (y1 + y2) / 2;
          // Calculate zoom so both points are visible
          const minX = Math.min(x1, x2),
            maxX = Math.max(x1, x2);
          const minY = Math.min(y1, y2),
            maxY = Math.max(y1, y2);
          // Add padding
          const pad = 0.08;
          const viewW = maxX - minX + pad;
          const viewH = maxY - minY + pad;
          // Clamp to [0,1]
          const zoomLevel = 1 / Math.max(viewW, viewH);
          transformRef.current.setTransform(
            centerX * 100,
            centerY * 100,
            Math.min(2.5, Math.max(zoomLevel, 1.2)),
            200,
            "easeOut"
          );
        },
        resetZoom: () => {
          if (!transformRef.current) return;
          transformRef.current.resetTransform();
        },
        panBy: (deltaX: number, deltaY: number) => {
          if (!transformRef.current || !transformRef.current.setTransform)
            return;
          try {
            const state = transformRef.current.instance?.transformState || {};
            const { positionX = 0, positionY = 0, scale = 1 } = state;
            const next = clampPan(
              positionX + deltaX,
              positionY + deltaY,
              scale
            );
            transformRef.current.setTransform(next.x, next.y, scale);
          } catch (error) {
            console.warn("panBy error:", error);
          }
        },
        panToTopLeft: () => {
          if (!transformRef.current || !transformRef.current.setTransform)
            return;
          try {
            const state = transformRef.current.instance?.transformState || {};
            const { scale = 1 } = state;
            // Top-left corner: show top-left of image (use max bounds)
            transformRef.current.setTransform(0, 0, scale);
          } catch (error) {
            console.error("panToTopLeft error:", error);
          }
        },
        panToTopRight: () => {
          if (!transformRef.current || !transformRef.current.setTransform)
            return;
          try {
            const state = transformRef.current.instance?.transformState || {};
            const { scale = 1 } = state;
            console.log(state);
            // Top-right corner: show top-right of image (min X, max Y)
            const scaledWidth = CONTAINER_WIDTH * scale;
            const minX = Math.min(0, CONTAINER_WIDTH - scaledWidth);

            transformRef.current.setTransform(minX, 0, scale);
          } catch (error) {
            console.warn("panToTopRight error:", error);
          }
        },
        panToBottomLeft: () => {
          if (!transformRef.current || !transformRef.current.setTransform)
            return;
          try {
            const state = transformRef.current.instance?.transformState || {};
            const { scale = 1 } = state;
            // Bottom-left corner: show bottom-left of image (max X, min Y)
            const scaledHeight = CONTAINER_HEIGHT * scale;
            const minY = Math.min(0, CONTAINER_HEIGHT - scaledHeight);

            transformRef.current.setTransform(0, minY, scale);
          } catch (error) {
            console.warn("panToBottomLeft error:", error);
          }
        },
        panToBottomRight: () => {
          if (!transformRef.current || !transformRef.current.setTransform)
            return;
          try {
            const state = transformRef.current.instance?.transformState || {};
            const { scale = 1 } = state;
            // Bottom-right corner: show bottom-right of image (use min bounds)
            const scaledWidth = CONTAINER_WIDTH * scale;
            const scaledHeight = CONTAINER_HEIGHT * scale;
            const minX = Math.min(0, CONTAINER_WIDTH - scaledWidth);
            const minY = Math.min(0, CONTAINER_HEIGHT - scaledHeight);

            transformRef.current.setTransform(minX, minY, scale);
          } catch (error) {
            console.warn("panToBottomRight error:", error);
          }
        },
        setZoom: (newZoom: number) => {
          if (!transformRef.current || !transformRef.current.setTransform)
            return;
          try {
            const state = transformRef.current.instance?.transformState || {};
            const { positionX = 0, positionY = 0 } = state;
            const next = clampPan(positionX, positionY, newZoom);
            transformRef.current.setTransform(next.x, next.y, newZoom);
          } catch (error) {
            console.warn("setZoom error:", error);
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
        },
      };
    },
    [props.zoom]
  );

  /**
   * Handles user click on the map image.
   * Converts click position to normalized coordinates and sets guess.
   * Accounts for both zoom and pan transformations.
   */
  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    if (props.disabled) return;

    console.log("Map click event:");

    const img = event.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();

    // Get click position relative to the image element
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Account for the image transform (zoom and pan)
    // The image is transformed with: scale(zoom) translate(pan.x, pan.y)
    // To get the original coordinates, we need to reverse this transform

    // First, adjust for the center-based scaling
    const centerX = img.clientWidth / 2;
    const centerY = img.clientHeight / 2;

    // Convert click position to be relative to the image center
    const centeredX = clickX - centerX;
    const centeredY = clickY - centerY;

    // Reverse the zoom scaling
    const unscaledX = centeredX / props.zoom;
    const unscaledY = centeredY / props.zoom;

    // Reverse the pan translation (pan is applied after scaling)
    const unpannedX = unscaledX - props.pan.x;
    const unpannedY = unscaledY - props.pan.y;

    // Convert back to absolute coordinates (relative to image center)
    const finalX = unpannedX + centerX;
    const finalY = unpannedY + centerY;

    // Convert to normalized coordinates (0-1)
    const normalizedX = finalX / img.clientWidth;
    const normalizedY = finalY / img.clientHeight;

    console.log("Map click:", {
      original: { x: clickX, y: clickY },
      centered: { x: centeredX, y: centeredY },
      unscaled: { x: unscaledX, y: unscaledY },
      unpanned: { x: unpannedX, y: unpannedY },
      final: { x: finalX, y: finalY },
      normalized: { x: normalizedX, y: normalizedY },
      zoom: props.zoom,
      pan: props.pan,
    });

    // Only set coordinates if they're within valid bounds (0-1)
    if (
      normalizedX >= 0 &&
      normalizedX <= 1 &&
      normalizedY >= 0 &&
      normalizedY <= 1
    ) {
      props.setXCoor(normalizedX);
      props.setYCoor(normalizedY);
    } else {
      console.log("Click outside map bounds, ignoring");
    }
  }

  /**
   * Returns CSS style for the line connecting guess and answer markers.
   * Used for visual feedback after a guess.
   */
  const lineStyle = () => {
    if (
      props.xCoor != null &&
      props.yCoor != null &&
      props.xRightCoor != null &&
      props.yRightCoor != null
    ) {
      const { width: imageWidth, height: imageHeight } = getImageDimensions();
      const x1 = props.xCoor * imageWidth;
      const y1 = props.yCoor * imageHeight;
      const x2 = props.xRightCoor * imageWidth;
      const y2 = props.yRightCoor * imageHeight;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      return {
        position: "absolute" as const,
        top: `${y1}px`,
        left: `${x1}px`,
        width: `${length}px`,
        transform: `rotate(${angle}deg) translate(0, -50%) scale(${props.zoom}) translate(${props.pan.x}px, ${props.pan.y}px)`,
        transformOrigin: "0 50%",
        height: "1.5px",
        background:
          "repeating-linear-gradient(to right, black 0 6px, transparent 6px 12px, #febe30 12px 18px, transparent 18px 24px)", // or just black
        borderTop: "none",
      };
    }
    return {};
  };

  // Main render: map image, markers, result overlay
  return (
    <>
      <div
        className="w-full h-full flex-1 pt-1.5"
        style={{ position: "relative" }}
      >
        <div
          className="relative md:rounded-2xl overflow-hidden bg-gray-200 md:border-4 md:border-black max-md:h-full"
          style={{}}
          tabIndex={0}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              height: "100%",
              width: "100%",
              border:
                props.zoom > 1.01
                  ? "2px solid #4ade80"
                  : "2px solid transparent",
            }}
          >
            <div
              onClick={handleClick}
              className={`w-full h-full relative ${
                props.zoom > 1 ? "cursor-grab" : "cursor-crosshair"
              }`}
              style={{
                cursor: props.zoom > 1 ? "grab" : "crosshair",
                transition: "cursor 0.2s ease",
              }}
            >
              <Image
                ref={props.imageRef}
                className="MapPicture w-full h-full select-none"
                src="/uw campus map.png"
                alt="Campus Map"
                width={896}
                height={683}
                draggable={false}
                unoptimized
                priority
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  pointerEvents: "auto",
                  objectFit: "contain",
                  transform: `scale(${props.zoom}) translate(${props.pan.x}px, ${props.pan.y}px)`,
                  // transition: "transform 0.3s ease", April 1st update
                }}
                onError={(e) => {
                  console.error("Campus map image failed to load", e);
                }}
              />

              {props.xCoor != null &&
                props.yCoor != null &&
                props.xRightCoor != null &&
                props.yRightCoor != null && <div style={lineStyle()}></div>}
              {props.xCoor != null && props.yCoor != null && (
                <div
                  style={{
                    top: `${
                      ((props.yCoor as number) * getImageDimensions().height -
                        getImageDimensions().height / 2) *
                        props.zoom +
                      getImageDimensions().height / 2
                    }px`,
                    left: `${
                      ((props.xCoor as number) * getImageDimensions().width -
                        getImageDimensions().width / 2) *
                        props.zoom +
                      getImageDimensions().width / 2
                    }px`,
                    position: "absolute",
                    pointerEvents: "none",
                    transform: `translate(-50%, -100%) scale(${props.zoom}) translate(${props.pan.x}px, ${props.pan.y}px)`,
                    transformOrigin: "50% 100%",
                    zIndex: 10,
                  }}
                >
                  <FaMapMarkerAlt
                    size={28}
                    color="red"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                </div>
              )}
              {props.xRightCoor != null && props.yRightCoor != null && (
                <div
                  style={{
                    top: `${
                      ((props.yRightCoor as number) *
                        getImageDimensions().height -
                        getImageDimensions().height / 2) *
                        props.zoom +
                      getImageDimensions().height / 2
                    }px`,
                    left: `${
                      ((props.xRightCoor as number) *
                        getImageDimensions().width -
                        getImageDimensions().width / 2) *
                        props.zoom +
                      getImageDimensions().width / 2
                    }px`,
                    position: "absolute",
                    pointerEvents: "none",
                    transform: `translate(-50%, -100%) scale(${props.zoom}) translate(${props.pan.x}px, ${props.pan.y}px)`,
                    transformOrigin: "50% 100%",
                    zIndex: 10,
                  }}
                >
                  <FaMapMarkerAlt
                    size={28}
                    color="limegreen"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                </div>
              )}
              {props.children}
            </div>
          </div>
        </div>

        {/* Score Display Overlay */}
        {props.showScoreDisplay &&
          props.xCoor != null &&
          props.yCoor != null &&
          props.xRightCoor != null &&
          props.yRightCoor != null && (
            <div
              className="absolute top-15 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg shadow-lg z-20"
              style={{ backdropFilter: "blur(5px)" }}
            >
              <div className="text-center">
                <div className="text-sm font-semibold mb-2">Round Results</div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-yellow-400">
                    Distance: {getDistanceDisplay()}
                  </div>
                  {props.currentScore != null && (
                    <div className="text-lg font-bold text-green-400">
                      Score: {props.currentScore}
                    </div>
                  )}
                  {props.maxScore != null && (
                    <div className="text-sm text-gray-300">
                      Max Possible: {props.maxScore}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </>
  );
});
export default Map;
