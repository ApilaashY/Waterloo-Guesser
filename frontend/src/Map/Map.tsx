import { PropsWithChildren } from "react";

interface MapProps extends PropsWithChildren {
  xCoor: number | null;
  yCoor: number | null;
  setXCoor: (value: number) => void;
  setYCoor: (value: number) => void;
  xRightCoor: Number | null;
  yRightCoor: Number | null;
}
import "./Map.css";

export default function Map(props: MapProps) {
  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    const x =
      event.pageX - (event.currentTarget.parentElement?.offsetLeft ?? 0);
    const y = event.pageY - (event.currentTarget.parentElement?.offsetTop ?? 0);
    console.log(
      `Clicked at coordinates: (${x}, ${y}) (${
        x / (event.currentTarget.parentElement?.clientWidth || 1)
      }, ${y / (event.currentTarget.parentElement?.clientHeight || 1)})`
    );
    props.setXCoor(x / (event.currentTarget.parentElement?.clientWidth || 1));
    props.setYCoor(y / (event.currentTarget.parentElement?.clientHeight || 1));
  }

  return (
    <div className="Map">
      <div className="Box">
        <img src="campus-map.png" alt="Campus Map" onClick={handleClick} />
        {props.xCoor != null && props.yCoor != null && (
          <div
            className="InnerBox"
            style={{
              top: `${props.yCoor * 100}%`,
              left: `${props.xCoor * 100}%`,
            }}
          ></div>
        )}
        {props.xRightCoor != null && props.yRightCoor != null && (
          <div
            className="InnerBox"
            style={{
              top: `${(props.yRightCoor as number) * 100}%`,
              left: `${(props.xRightCoor as number) * 100}%`,
              backgroundColor: "limegreen",
            }}
          ></div>
        )}
      </div>
    </div>
  );
}
