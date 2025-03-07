import { useEffect, useState } from "react";

export default function App() {
  const [state, setState] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((res) => res.json())
      .then((json) => setState(json["Done"]));
  }, []);

  return <h1>Hello {state}</h1>;
}
