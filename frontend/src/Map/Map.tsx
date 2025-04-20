import { PropsWithChildren } from "react";

interface MapProps extends PropsWithChildren {
  xCoor: number | null;
  yCoor: number | null;
  setXCoor: (value: number) => void;
  setYCoor: (value: number) => void;
  xRightCoor: number | null;
  yRightCoor: number | null;
}
import "./Map.css";

export default function Map(props: MapProps) {
  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    if (props.xRightCoor != null && props.yRightCoor != null) return;

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

  const lineStyle = () => {
    if (
      props.xCoor != null &&
      props.yCoor != null &&
      props.xRightCoor != null &&
      props.yRightCoor != null
    ) {
      const parent = document.querySelector(".MapPicture"); // Reference to the parent container
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

  return (
    <div className="Map">
      <div className="Box">
        <img
          className="MapPicture"
          src="campus-map.png"
          alt="Campus Map"
          onClick={handleClick}
        />
        {props.xCoor != null &&
          props.yCoor != null &&
          props.xRightCoor != null &&
          props.yRightCoor != null && <div style={lineStyle()}></div>}
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
