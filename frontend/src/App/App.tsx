import { useEffect, useRef, useState } from "react";
import Map from "../Map/Map";
import "./App.css";
import { useControls } from "react-zoom-pan-pinch";

export default function App() {
  interface State {
    image?: string;
    id?: String;
  }

  const [totalPoints, setTotalPoints] = useState(0);

  const [imageID, setImageID] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  const [state, setState] = useState<State>({});
  const [setupDone, setSetupDone] = useState(false);

  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [xRightCoor, setXRightCoor] = useState<number | null>(null);
  const [yRightCoor, setYRightCoor] = useState<number | null>(null);

  const [imgOpacity, setImgOpacity] = useState(0.8);
  const hovering = useRef(false);

  const resetZoom = useRef<
    | ((
        animationTime?: number,
        animationType?:
          | "easeOut"
          | "linear"
          | "easeInQuad"
          | "easeOutQuad"
          | "easeInOutQuad"
          | "easeInCubic"
          | "easeOutCubic"
          | "easeInOutCubic"
          | "easeInQuart"
          | "easeOutQuart"
          | "easeInOutQuart"
          | "easeInQuint"
          | "easeOutQuint"
          | "easeInOutQuint"
      ) => void)
    | null
  >(null);

  function requestImage() {
    fetch("/api/getPhoto?previousCode=" + imageID)
      .then((res) => res.json())
      .then((json) => {
        setImageID(json.id);
        setState(json);
        setXCoor(null);
        setYCoor(null);
        setXRightCoor(null);
        setYRightCoor(null);
      });
  }

  function validateCoordinate() {
    fetch("/api/validateCoordinate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        xCoor: xCoor,
        yCoor: yCoor,
        id: state.id,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setXRightCoor(json.xCoor);
        setYRightCoor(json.yCoor);
        setTotalPoints(totalPoints + json.points);
        setQuestionCount(questionCount + 1);
      });
  }

  useEffect(() => {
    if (setupDone) return;
    setSetupDone(true);
    requestImage();
  }, []);

  const Controls = ({ children }: { children: React.ReactNode }) => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    resetZoom.current = resetTransform;

    return (
      <div className="AllControls">
        <div>{children}</div>
        <div className="ZoomControls">
          <button onClick={() => zoomIn()}>+</button>
          <button onClick={() => zoomOut()}>-</button>
          <button onClick={() => resetTransform()}>⟲</button>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <Map
        xCoor={xCoor}
        yCoor={yCoor}
        setXCoor={setXCoor}
        setYCoor={setYCoor}
        xRightCoor={xRightCoor}
        yRightCoor={yRightCoor}
      >
        <Controls>
          <button
            className="SubmitButton"
            onClick={() => {
              if (resetZoom.current) {
                resetZoom.current();
              }
              return xRightCoor == null || yRightCoor == null
                ? validateCoordinate()
                : requestImage();
            }}
          >
            {xRightCoor == null || yRightCoor == null ? "Submit" : "Next"}
          </button>
        </Controls>
        <img
          className="LocationImg"
          src={state.image}
          style={{ opacity: imgOpacity }}
          onMouseEnter={() => {
            hovering.current = true;
            setImgOpacity(1);
          }}
          onMouseLeave={() => {
            hovering.current = false;
            setTimeout(() => {
              if (!hovering.current) setImgOpacity(0.8);
            }, 5000);
          }}
        />
      </Map>
    </div>
  );
}
