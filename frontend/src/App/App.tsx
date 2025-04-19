import { useEffect, useState } from "react";
import Map from "../Map/Map";
import "./App.css";

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

  function requestImage() {
    fetch(`http://localhost:8080/getPhoto?previousCode=${imageID}`)
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
    fetch("http://localhost:8080/validateCoordinate", {
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

  return (
    <div className="App">
      <div>
        <div className="flex">
          <h1>Hello</h1>
          <h2>Points: {totalPoints}</h2>
          <h2>Questions Done: {questionCount}</h2>
          {questionCount != 0 && (
            <h2>
              Average Question Points: {Math.round(totalPoints / questionCount)}
            </h2>
          )}
        </div>
        <img className="LocationImg" src={state.image} />
      </div>
      <div>
        <button
          onClick={() =>
            xRightCoor == null || yRightCoor == null
              ? validateCoordinate()
              : requestImage()
          }
        >
          {xRightCoor == null || yRightCoor == null ? "Submit" : "Next"}
        </button>
        <Map
          xCoor={xCoor}
          yCoor={yCoor}
          setXCoor={setXCoor}
          setYCoor={setYCoor}
          xRightCoor={xRightCoor}
          yRightCoor={yRightCoor}
        />
      </div>
    </div>
  );
}
