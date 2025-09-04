import { forwardRef } from 'react';
import Map from '../../Map';

interface GameMapProps {
  xCoor: number | null;
  yCoor: number | null;
  xRightCoor: number | null;
  yRightCoor: number | null;
  onCoordinateClick: (x: number | null, y: number | null) => void;
  disabled: boolean;
}

const GameMap = forwardRef<any, GameMapProps>(({
  xCoor,
  yCoor,
  xRightCoor,
  yRightCoor,
  onCoordinateClick,
  disabled
}, ref) => {
  return (
    <Map
      ref={ref}
      xCoor={xCoor}
      yCoor={yCoor}
  // Pass only the new value for the axis being set; the other axis is null so
  // the parent can update it independently. This avoids using stale props
  // captured in the closure which caused the Y axis to appear stuck.
  setXCoor={disabled ? () => {} : (val: number | null) => onCoordinateClick(val, null)}
  setYCoor={disabled ? () => {} : (val: number | null) => onCoordinateClick(null, val)}
      xRightCoor={xRightCoor}
      yRightCoor={yRightCoor}
      disabled={disabled}
      aspectRatio={0.7 * (896 / 683)}
    />
  );
});

GameMap.displayName = 'GameMap';

export default GameMap;
