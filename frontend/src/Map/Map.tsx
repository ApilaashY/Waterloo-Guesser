import { PropsWithChildren, useState } from "react";
import "./Map.css";

export default function Map(props: PropsWithChildren) {
  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    const x =
      event.pageX - (event.currentTarget.parentElement?.offsetLeft ?? 0);
    const y = event.pageY - (event.currentTarget.parentElement?.offsetTop ?? 0);
    console.log(`Clicked at coordinates: (${x}, ${y})`);
    props.setXCoor(x);
    props.setYCoor(y);
  }

  return (
    <div className="Map">
      <div className="Box">
        <img src="campus-map.png" alt="Campus Map" onClick={handleClick} />
        <div
          className="InnerBox"
          style={{ top: props.yCoor, left: props.xCoor }}
        ></div>
      </div>
    </div>
  );
}
