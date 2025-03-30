import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  interface State {
    image?: string;
  }

  const [state, setState] = useState<State>({});
  const [setupDone, setSetupDone] = useState(false);

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
        <img src={state["image"]} />
      </div>
      <h1>Hello</h1>
    </div>
  );
}
