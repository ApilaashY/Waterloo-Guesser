import { useCallback } from 'react';

export function useMapZoom(
  mapContainerRef: React.RefObject<HTMLDivElement | null>,
  xCoor: number | null,
  yCoor: number | null,
  xRightCoor: number | null,
  yRightCoor: number | null
) {
  const zoomToGuessAndAnswer = useCallback(() => {
    if (!mapContainerRef.current || xCoor === null || yCoor === null || xRightCoor === null || yRightCoor === null) {
      return;
    }
    
    const parent = mapContainerRef.current;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    
    // Calculate the bounding box that includes both points with some padding
    const padding = 0.05; // 5% padding
    const minX = Math.min(xCoor, xRightCoor) - padding;
    const minY = Math.min(yCoor, yRightCoor) - padding;
    const maxX = Math.max(xCoor, xRightCoor) + padding;
    const maxY = Math.max(yCoor, yRightCoor) + padding;
    
    // Calculate scale to fit both points
    const scaleX = (maxX - minX) / parentWidth;
    const scaleY = (maxY - minY) / parentHeight;
    const scale = Math.min(1, 1 / Math.max(scaleX, scaleY));
    
    // Calculate the center point
    const centerX = (minX + maxX) / 2 * parentWidth;
    const centerY = (minY + maxY) / 2 * parentHeight;
    
    // Calculate the target scroll position
    const targetLeft = Math.max(0, centerX - (parentWidth * scale) / 2);
    const targetTop = Math.max(0, centerY - (parentHeight * scale) / 2);
    
    // Apply the transform and scroll
    parent.scrollTo({
      left: targetLeft,
      top: targetTop,
      behavior: 'smooth'
    });
  }, [mapContainerRef, xCoor, yCoor, xRightCoor, yRightCoor]);

  return { zoomToGuessAndAnswer };
}
