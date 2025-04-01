import { useState } from "react";
import "./Map.css";

export default function Map() {
  const [xCoor, setXCoor] = useState(0);
  const [yCoor, setYCoor] = useState(0);
  function handleClick(event: React.MouseEvent<HTMLImageElement>) {
    const x =
      event.pageX - (event.currentTarget.parentElement?.offsetLeft ?? 0);
    const y = event.pageY - (event.currentTarget.parentElement?.offsetTop ?? 0);
    console.log(
      `Clicked at coordinates: (${x}, ${y}) (${event.clientX}, ${
        event.clientY
      }) (${event.currentTarget.parentElement?.offsetLeft ?? 0}, ${
        event.currentTarget.parentElement?.offsetTop ?? 0
      })`
    );
    setXCoor(x);
    setYCoor(y);
  }

  return (
    <div>
      <div className="Box">
        <img src="campus-map.png" alt="Campus Map" onClick={handleClick} />
        <div className="InnerBox" style={{ top: yCoor, left: xCoor }}>
          <h2>HI</h2>
        </div>
      </div>
    </div>
  );
}
