import { useEffect, useState } from "react";

export default function App() {
  const [state, setState] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/getPhoto")
      .then((res) => res.json())
      .then((json) => setState(json["Photo"]));
  }, []);

  return (
    <>
      <h1>Hello</h1>
      <img content={state} />
    </>
  );
}
