import { useEffect, useState } from "react";
import Map from "../Map/Map";
import "./App.css";

export default function App() {
  interface State {
    image?: string;
  }

  const [state, setState] = useState<State>({});
  const [setupDone, setSetupDone] = useState(false);

  const [xCoor, setXCoor] = useState(0);
  const [yCoor, setYCoor] = useState(0);

  function requestImage() {
    fetch("http://localhost:8080/getPhoto")
      .then((res) => res.json())
      .then((json) => {
        setState(json);
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
          <button onClick={requestImage}>Click for Picture</button>
        </div>
        <img className="LocationImg" src={state["image"]} />
      </div>
      <div>
        <button>Submit</button>
        <Map
          xCoor={xCoor}
          yCoor={yCoor}
          setXCoor={setXCoor}
          setYCoor={setYCoor}
        />
      </div>
    </div>
  );
}
