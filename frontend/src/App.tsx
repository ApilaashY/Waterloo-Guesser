import { useEffect, useState } from "react";

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
    <>
      <h1>Hello</h1>
      <img src={state["image"]} />
      <button onClick={requestImage}>Click for Picture</button>
    </>
  );
}
