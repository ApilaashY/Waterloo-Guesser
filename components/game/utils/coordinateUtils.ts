// Calculate minimum zoom so image always fills the area
export function getMinZoom(
  naturalSize: { w: number; h: number } | null,
  containerW: number = 280,
  containerH: number = 200
): number {
  if (!naturalSize) return 1.0;
  const { w: imgW, h: imgH } = naturalSize;
  const zoomW = containerW / imgW;
  const zoomH = containerH / imgH;
  return Math.max(zoomW, zoomH);
}

// Check if mouse position is over a container element
export function isMouseOverContainer(
  clientX: number,
  clientY: number,
  containerRef: React.RefObject<HTMLDivElement>
): boolean {
  if (!containerRef.current) return false;
  const rect = containerRef.current.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

// Calculate pan constraints for image dragging
export function calculatePanConstraints(
  containerW: number,
  containerH: number,
  zoom: number
) {
  const imgW = containerW * zoom;
  const imgH = containerH * zoom;
  const maxX = Math.max(0, (imgW - containerW) / 2);
  const maxY = Math.max(0, (imgH - containerH) / 2);
  return { maxX, maxY };
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
