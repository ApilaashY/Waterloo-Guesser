// Shared constants for map components
export const CONTAINER_WIDTH = 765;
export const CONTAINER_HEIGHT = 350;

// Map interaction constants
export const PAN_STEP = 4;
export const PAN_INTERVAL = 1; // ms (much more responsive, ~1000fps)
export const ZOOM_STEP = 0.3;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 12;
export const ZOOM_ANIMATION_STEP = 0.05;
export const ZOOM_ANIMATION_DELAY = 4; // ms
export const ZOOM_ANIMATION_DURATION = 800;
export const PINCH_SENSITIVITY_THRESHOLD = 0.02;

// Game constants
export const MAX_SCORE = 1000;

// Distance calculation constants
export const MAP_PIXEL_WIDTH = 896;
export const MAP_PIXEL_HEIGHT = 683;
export const CALIBRATION_DISTANCE_METERS = 79.5;
export const CALIBRATION_REF1 = {
  x: 0.7042735042735043,
  y: 0.5448430493273543,
};
export const CALIBRATION_REF2 = {
  x: 0.7384615384615385,
  y: 0.5448430493273543,
};
