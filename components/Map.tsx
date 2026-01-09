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
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import {
  CONTAINER_WIDTH,
  CONTAINER_HEIGHT,
  ZOOM_ANIMATION_DURATION,
  ZOOM_ANIMATION_DELAY,
  MAP_PIXEL_WIDTH,
  MAP_PIXEL_HEIGHT,
  CALIBRATION_DISTANCE_METERS,
  CALIBRATION_REF1,
  CALIBRATION_REF2,
} from "./constants/mapConstants";

/**
 * Props for the Map component
 * @property xCoor - User's guess X (normalized 0-1)
 * @property yCoor - User's guess Y (normalized 0-1)
 * @property setXCoor - Setter for guess X
 * @property setYCoor - Setter for guess Y
 * @property xRightCoor - Correct answer X (normalized 0-1)
 * @property yRightCoor - Correct answer Y (normalized 0-1)
 * @property disabled - If true, disables interaction
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
  showScoreDisplay?: boolean; // New prop to control score display
  currentScore?: number; // Current round score
  maxScore?: number; // Maximum possible score
  zoom: number; // Additional styles for the score display
  pan: { x: number; y: number }; // Additional styles for the score display
  imageRef: React.RefObject<HTMLImageElement | null>; // Ref to the image element for dimension calculations
  triangleData?: any;
  userVertices?: (Array<{ x: number, y: number } | null>);
  onMapClick?: (x: number, y: number) => void;
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
   * Gets the actual displayed image dimensions and offset when using objectFit: contain
   * Accounts for letterboxing when container aspect ratio differs from image aspect ratio
   */
  const getActualImageDimensionsAndOffset = () => {
    if (props.imageRef.current) {
      const containerWidth = props.imageRef.current.clientWidth;
      const containerHeight = props.imageRef.current.clientHeight;

      // Image's intrinsic aspect ratio (896x683 from the constants)
      const imageAspectRatio = MAP_PIXEL_WIDTH / MAP_PIXEL_HEIGHT;
      const containerAspectRatio = containerWidth / containerHeight;

      let actualWidth, actualHeight, offsetX, offsetY;

      if (containerAspectRatio > imageAspectRatio) {
        // Container is wider than image - image will be letterboxed horizontally
        actualHeight = containerHeight;
        actualWidth = containerHeight * imageAspectRatio;
        offsetX = (containerWidth - actualWidth) / 2;
        offsetY = 0;
      } else {
        // Container is taller than image - image will be letterboxed vertically
        actualWidth = containerWidth;
        actualHeight = containerWidth / imageAspectRatio;
        offsetX = 0;
        offsetY = (containerHeight - actualHeight) / 2;
      }

      return {
        width: actualWidth,
        height: actualHeight,
        offsetX,
        offsetY,
        containerWidth,
        containerHeight,
      };
    }

    // Fallback
    return {
      width: CONTAINER_WIDTH,
      height: CONTAINER_HEIGHT,
      offsetX: 0,
      offsetY: 0,
      containerWidth: CONTAINER_WIDTH,
      containerHeight: CONTAINER_HEIGHT,
    };
  };

  /**
   * Gets the actual rendered dimensions of the image element
   */
  const getImageDimensions = () => {
    const dimensions = getActualImageDimensionsAndOffset();
    return {
      width: dimensions.width,
      height: dimensions.height,
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
    // Calculate pixel distance between reference points
    const refPx1 = CALIBRATION_REF1.x * MAP_PIXEL_WIDTH;
    const refPy1 = CALIBRATION_REF1.y * MAP_PIXEL_HEIGHT;
    const refPx2 = CALIBRATION_REF2.x * MAP_PIXEL_WIDTH;
    const refPy2 = CALIBRATION_REF2.y * MAP_PIXEL_HEIGHT;
    const refDeltaPx = refPx2 - refPx1;
    const refDeltaPy = refPy2 - refPy1;
    const refPixelDistance = Math.sqrt(
      refDeltaPx * refDeltaPx + refDeltaPy * refDeltaPy
    );
    // Calibrate meters-per-pixel so that refPixelDistance = CALIBRATION_DISTANCE_METERS
    const metersPerPixel = CALIBRATION_DISTANCE_METERS / refPixelDistance;
    // Calculate pixel distance for input points
    const px1 = x1 * MAP_PIXEL_WIDTH;
    const py1 = y1 * MAP_PIXEL_HEIGHT;
    const px2 = x2 * MAP_PIXEL_WIDTH;
    const py2 = y2 * MAP_PIXEL_HEIGHT;
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
          const imageInfo = getActualImageDimensionsAndOffset();

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
          // Convert normalized center to transform coordinates using actual container dimensions
          const mapX = centerX * imageInfo.containerWidth;
          const mapY = centerY * imageInfo.containerHeight;
          // Center the map so that the center point is in the middle of the viewport
          const offsetX = (imageInfo.containerWidth / 2 - mapX) * finalZoom;
          const offsetY = (imageInfo.containerHeight / 2 - mapY) * finalZoom;
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
    const imageInfo = getActualImageDimensionsAndOffset();
    const scaledWidth = imageInfo.containerWidth * zoomLevel;
    const scaledHeight = imageInfo.containerHeight * zoomLevel;

    // Calculate the actual transform bounds based on image edge alignment
    // When zoomed in, image can move from "right edge aligned" to "left edge aligned"
    const minX = Math.min(0, imageInfo.containerWidth - scaledWidth); // right edge aligned (negative when zoomed in)
    const maxX = 0; // left edge aligned (always 0)
    const minY = Math.min(0, imageInfo.containerHeight - scaledHeight); // bottom edge aligned (negative when zoomed in)
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
   * Accounts for both zoom and pan transformations, and image letterboxing.
   */
  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    if (props.disabled) return;

    const img = event.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();

    // Get click position relative to the image element
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Get the actual image dimensions and offset due to letterboxing
    const imageInfo = getActualImageDimensionsAndOffset();

    // Account for the image transform (zoom and pan)
    // The image is transformed with: scale(zoom) translate(pan.x, pan.y)
    // To get the original coordinates, we need to reverse this transform

    // First, adjust for the center-based scaling
    const centerX = imageInfo.containerWidth / 2;
    const centerY = imageInfo.containerHeight / 2;

    // Convert click position to be relative to the image center
    const centeredX = clickX - centerX;
    const centeredY = clickY - centerY;

    // Reverse the zoom scaling
    const unscaledX = centeredX / props.zoom;
    const unscaledY = centeredY / props.zoom;

    // Reverse the pan translation (pan is applied after scaling)
    const unpannedX = unscaledX - props.pan.x;
    const unpannedY = unscaledY - props.pan.y;

    // Convert back to absolute coordinates (relative to container)
    const finalX = unpannedX + centerX;
    const finalY = unpannedY + centerY;

    // Adjust for image offset due to letterboxing
    const imageRelativeX = finalX - imageInfo.offsetX;
    const imageRelativeY = finalY - imageInfo.offsetY;

    // Convert to normalized coordinates (0-1) relative to the actual image
    const normalizedX = imageRelativeX / imageInfo.width;
    const normalizedY = imageRelativeY / imageInfo.height;

    // Only set coordinates if they're within valid bounds (0-1)
    if (
      normalizedX >= 0 &&
      normalizedX <= 1 &&
      normalizedY >= 0 &&
      normalizedY <= 1
    ) {
      if (props.onMapClick) {
        props.onMapClick(normalizedX, normalizedY);
      } else {
        props.setXCoor(normalizedX);
        props.setYCoor(normalizedY);
      }
    } else {
      // Click was outside the actual image area
    }
  }

  /**
   * Calculates the position for a marker given normalized coordinates (0-1)
   * Accounts for image letterboxing, zoom, and pan transformations
   */
  const getMarkerPosition = (normalizedX: number, normalizedY: number) => {
    const imageInfo = getActualImageDimensionsAndOffset();

    // Convert normalized coordinates to pixel position within the actual image
    const imagePixelX = normalizedX * imageInfo.width;
    const imagePixelY = normalizedY * imageInfo.height;

    // Add the offset to account for letterboxing
    const containerPixelX = imagePixelX + imageInfo.offsetX;
    const containerPixelY = imagePixelY + imageInfo.offsetY;

    // Apply zoom and pan transformations
    // The transformation is: scale from center, then translate by pan
    const centerX = imageInfo.containerWidth / 2;
    const centerY = imageInfo.containerHeight / 2;

    // Transform the position: first translate to center-based coordinates,
    // then scale, then translate back, then apply pan
    const centeredX = containerPixelX - centerX;
    const centeredY = containerPixelY - centerY;

    const scaledX = centeredX * props.zoom;
    const scaledY = centeredY * props.zoom;

    const finalX = scaledX + centerX + props.pan.x * props.zoom;
    const finalY = scaledY + centerY + props.pan.y * props.zoom;

    return { x: finalX, y: finalY };
  };

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
      const pos1 = getMarkerPosition(props.xCoor, props.yCoor);
      const pos2 = getMarkerPosition(props.xRightCoor, props.yRightCoor);

      const length = Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
      );
      const angle =
        Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * (180 / Math.PI);

      return {
        position: "absolute" as const,
        top: `${pos1.y}px`,
        left: `${pos1.x}px`,
        width: `${length}px`,
        transform: `rotate(${angle}deg) translate(0, -50%)`,
        transformOrigin: "0 50%",
        height: `${3 * props.zoom}px`,
        background: `repeating-linear-gradient(to right, black 0 ${6 * props.zoom
          }px, transparent ${6 * props.zoom}px ${12 * props.zoom}px, #febe30 ${12 * props.zoom
          }px ${18 * props.zoom}px, transparent ${18 * props.zoom}px ${24 * props.zoom
          }px)`, // or just black
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
          className="relative md:rounded-2xl overflow-hidden bg-white md:border-4 md:border-black max-md:h-full"
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
              className={`w-full h-full relative ${props.zoom > 1 ? "cursor-grab" : "cursor-crosshair"
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
                  style={(() => {
                    const position = getMarkerPosition(
                      props.xCoor as number,
                      props.yCoor as number
                    );
                    return {
                      top: `${position.y}px`,
                      left: `${position.x}px`,
                      position: "absolute" as const,
                      pointerEvents: "none",
                      transform: `translate(-50%, -100%)`,
                      transformOrigin: "50% 100%",
                      zIndex: 10,
                    };
                  })()}
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
                  style={(() => {
                    const position = getMarkerPosition(
                      props.xRightCoor as number,
                      props.yRightCoor as number
                    );
                    return {
                      top: `${position.y}px`,
                      left: `${position.x}px`,
                      position: "absolute" as const,
                      pointerEvents: "none",
                      transform: `translate(-50%, -100%)`,
                      transformOrigin: "50% 100%",
                      zIndex: 10,
                    };
                  })()}
                >
                  <FaMapMarkerAlt
                    size={28}
                    color="limegreen"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                </div>
              )}

              {/* User Triangle Overlay - Guesses */}
              {props.userVertices && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    {/* Polygon connecting user vertices */}
                    {props.userVertices.filter(v => v !== null).length >= 2 && (
                      <polygon
                        points={props.userVertices
                          .filter(v => v !== null)
                          .map((v: any) => {
                            const p = getMarkerPosition(v.x, v.y);
                            return `${p.x},${p.y}`;
                          })
                          .join(' ')}
                        fill="rgba(0, 0, 0, 0.1)"
                        stroke="rgba(0, 0, 0, 0.5)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    )}

                    {/* User Vertex markers */}
                    {props.userVertices.map((vertex, index) => {
                      if (!vertex) return null;
                      const p = getMarkerPosition(vertex.x, vertex.y);
                      const colors = ["#EF4444", "#22C55E", "#3B82F6"]; // Red, Green, Blue
                      return (
                        <g key={`user-v-${index}`}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="8"
                            fill={colors[index]}
                            stroke="white"
                            strokeWidth="2"
                            style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}
                          />
                          <text x={p.x} y={p.y} dy="3" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                            {index + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Correct Answer Triangle Overlay - Only rendered if triangleData is passed */}
              {props.triangleData && props.triangleData.vertices && props.triangleData.vertices.length === 3 && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    <polygon
                      points={props.triangleData.vertices
                        .map((v: any) => {
                          const p = getMarkerPosition(v.x, v.y);
                          return `${p.x},${p.y}`;
                        })
                        .join(' ')}
                      fill="rgba(255, 255, 0, 0.2)"
                      stroke="rgba(255, 255, 0, 0.8)"
                      strokeWidth="2"
                    />

                    {/* Vertex markers */}
                    {props.triangleData.vertices.map((vertex: any, index: number) => {
                      const p = getMarkerPosition(vertex.x, vertex.y);
                      return (
                        <circle
                          key={index}
                          cx={p.x}
                          cy={p.y}
                          r="6"
                          fill="blue"
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    })}

                    {/* Centroid marker (only show if we have correct answer, i.e. current score/submission logic known by parent) */}
                    {/* Note: Map doesn't know 'hasSubmitted', but if xRightCoor is passed, it implies submission/result state? */}
                    {props.xRightCoor !== null && props.triangleData.centroid && (
                      <circle
                        cx={getMarkerPosition(props.triangleData.centroid.x, props.triangleData.centroid.y).x}
                        cy={getMarkerPosition(props.triangleData.centroid.x, props.triangleData.centroid.y).y}
                        r="4"
                        fill="red"
                        stroke="white"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
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
