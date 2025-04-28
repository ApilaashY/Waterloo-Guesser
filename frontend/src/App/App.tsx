import { useEffect, useRef, useState } from "react";
import Map from "../Map/Map";
import "./App.css";
import { useControls } from "react-zoom-pan-pinch";
import { host } from "../main";

export default function App() {
  interface State {
    image?: string;
    id?: String;
  }

  const [totalPoints, setTotalPoints] = useState(0);

  const [imageIDs, setImageIDs] = useState<string[]>([]);
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
  const makeTransform = useRef<
    ((x: number, y: number, scale: number) => void) | null
  >(null);

  const requestingImage = useRef(false);
  function requestImage() {
    if (requestingImage.current) return;

    requestingImage.current = true;
    fetch(`${host}/getPhoto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        previousCodes: imageIDs,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (imageIDs.includes(json.id)) {
          setImageIDs([json.id]);
        } else {
          setImageIDs([...imageIDs, json.id]);
        }
        setState(json);
        setXCoor(null);
        setYCoor(null);
        setXRightCoor(null);
        setYRightCoor(null);
        requestingImage.current = false;
      });
  }

  const validatingCoordinate = useRef(false);
  function validateCoordinate() {
    if (validatingCoordinate.current) return;

    validatingCoordinate.current = true;
    fetch(`${host}/validateCoordinate`, {
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

        if (makeTransform.current) {
          const parent = document.querySelector(".MapPicture"); // Reference to the parent container
          if (!parent) {
            validatingCoordinate.current = false;
            return;
          }

          const parentWidth = parent.clientWidth;
          const parentHeight = parent.clientHeight;

          let topleftX =
            (Math.min(xCoor || 0, json.xCoor) - 0.05) * parentWidth;
          let topleftY =
            (Math.min(yCoor || 0, json.yCoor) - 0.05) * parentHeight;
          const bottomrightX =
            (Math.max(xCoor || 0, json.xCoor) + 0.05) * parentWidth;
          const bottomrightY =
            (Math.max(yCoor || 0, json.yCoor) + 0.05) * parentHeight;

          const scaleX = (bottomrightX - topleftX) / parentWidth;
          const scaleY = (bottomrightY - topleftY) / parentHeight;
          const scale = 1 / Math.max(scaleX, scaleY);

          if (scaleX > scaleY) {
            topleftY = (topleftY + bottomrightY) / 2 - parentHeight / scale / 2;
          } else {
            topleftX = (topleftX + bottomrightX) / 2 - parentWidth / scale / 2;
          }

          makeTransform.current(-topleftX * scale, -topleftY * scale, scale);
        }

        validatingCoordinate.current = false;
      });
  }

  useEffect(() => {
    if (setupDone) return;
    setSetupDone(true);
    requestImage();
  }, []);

  const Controls = ({ children }: { children: React.ReactNode }) => {
    const { zoomIn, zoomOut, resetTransform, setTransform } = useControls();

    resetZoom.current = resetTransform;
    makeTransform.current = setTransform;

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
        <h1 className="PointTitle">Points: {totalPoints}</h1>
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
