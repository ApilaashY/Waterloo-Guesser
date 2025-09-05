import { useRef, useCallback } from 'react';

export interface MapControls {
  zoomToArea: (x: number, y: number, targetX: number, targetY: number) => void;
  resetZoom: () => void;
}

export const useMapControls = () => {
  const mapRef = useRef<any>(null);

  const zoomToArea = useCallback((x: number, y: number, targetX: number, targetY: number) => {
    if (!mapRef.current) return;

    // Calculate the center point between user click and correct answer
    const centerX = (x + targetX) / 2;
    const centerY = (y + targetY) / 2;

    // Calculate zoom level to fit both points with some padding
    const distance = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
    const zoomLevel = Math.max(1.5, Math.min(3, 800 / distance));

    // Get map dimensions
    const mapElement = mapRef.current;
    const mapRect = mapElement?.instance?.wrapperComponent?.getBoundingClientRect();
    
    if (!mapRect) return;

    // Calculate position to center the area
    const positionX = (mapRect.width / 2) - (centerX * zoomLevel);
    const positionY = (mapRect.height / 2) - (centerY * zoomLevel);

    // Apply zoom and position
    mapRef.current?.setTransform(positionX, positionY, zoomLevel, 500);
  }, []);

  const resetZoom = useCallback(() => {
    if (!mapRef.current) return;
    // Try instance.resetTransform first
    if (mapRef.current.instance && typeof mapRef.current.instance.resetTransform === 'function') {
      mapRef.current.instance.resetTransform(300);
    } else if (typeof mapRef.current.resetTransform === 'function') {
      mapRef.current.resetTransform(300);
    }
  }, []);

  const controls: MapControls = {
    zoomToArea,
    resetZoom
  };

  return {
    mapRef,
    controls
  };
};
