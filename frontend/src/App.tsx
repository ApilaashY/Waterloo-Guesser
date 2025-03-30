import { useEffect, useState } from "react";

export default function App() {
  interface State {
    image?: string;
  }

  const [state, setState] = useState<State>({});

  useEffect(() => {
    fetch("http://localhost:8080/getPhoto")
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        setState(json);
      });
  }, []);

  console.log(state);
  return (
    <>
      <h1>Hello</h1>
      <img src={state["image"]} />
      <button>Click for Picture</button>
    </>
  );
}
