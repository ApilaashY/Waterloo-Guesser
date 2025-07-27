// components/GamePage.tsx

"use client"

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Map from "./Map";
import LocationUploader from "./LocationUploader";

export default function GamePage() {
  const [showUploader, setShowUploader] = useState(false);
  // const [transformReady, setTransformReady] = useState(false);
  interface State {
    image?: string;
    id?: string;
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

  const requestingImage = useRef(false);
  function requestImage() {
    if (requestingImage.current) return;
    requestingImage.current = true;
    fetch(`/api/getPhoto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        mode: "no-cors",
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
  const mapContainerRef = useRef<HTMLDivElement>(null);

  function zoomToGuessAndAnswer() {
    const parent = mapContainerRef.current;
    if (!parent || xCoor == null || yCoor == null || xRightCoor == null || yRightCoor == null) return;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    let topleftX = (Math.min(xCoor, xRightCoor) - 0.05) * parentWidth;
    let topleftY = (Math.min(yCoor, yRightCoor) - 0.05) * parentHeight;
    const bottomrightX = (Math.max(xCoor, xRightCoor) + 0.05) * parentWidth;
    const bottomrightY = (Math.max(yCoor, yRightCoor) + 0.05) * parentHeight;
    const scaleX = (bottomrightX - topleftX) / parentWidth;
    const scaleY = (bottomrightY - topleftY) / parentHeight;
    const scale = 1 / Math.max(scaleX, scaleY);
    // Center the viewport
    if (scaleX > scaleY) {
      topleftY = (topleftY + bottomrightY) / 2 - parentHeight / scale / 2;
    } else {
      topleftX = (topleftX + bottomrightX) / 2 - parentWidth / scale / 2;
    }
    // Scroll the parent div to the calculated position
    parent.scrollTo({
      left: Math.max(0, -topleftX * scale),
      top: Math.max(0, -topleftY * scale),
      behavior: "smooth"
    });
  }

  function validateCoordinate() {
    if (validatingCoordinate.current) return;
    validatingCoordinate.current = true;
    fetch(`/api/validateCoordinate`, {
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
        validatingCoordinate.current = false;
        // Zoom and pan to show both dots
        zoomToGuessAndAnswer();
      });
  }

  useEffect(() => {
    if (setupDone) return;
    setSetupDone(true);
    requestImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupDone]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 overflow-hidden">
      <button
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        onClick={() => setShowUploader((v) => !v)}
      >
        {showUploader ? "Back to Game" : "Add Location"}
      </button>
      {showUploader ? (
        <LocationUploader />
      ) : (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-4 left-4">
            <h1 className="text-xl font-bold text-gray-800 bg-white/80 rounded px-4 py-2 shadow">Points: {totalPoints}</h1>
          </div>
          <div className="absolute top-4 right-4 z-50">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              onClick={() => setShowUploader((v) => !v)}
            >
              {showUploader ? "Back to Game" : "Add Location"}
            </button>
          </div>
          <div className="flex items-center justify-center w-full h-full">
            <div ref={mapContainerRef} className="flex items-center justify-center w-full h-full max-w-4xl max-h-[80vh] mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative">
              <Map
                xCoor={xCoor}
                yCoor={yCoor}
                setXCoor={xRightCoor == null && yRightCoor == null ? setXCoor : () => {} }
                setYCoor={xRightCoor == null && yRightCoor == null ? setYCoor : () => {} }
                xRightCoor={xRightCoor}
                yRightCoor={yRightCoor}
                disabled={xRightCoor != null && yRightCoor != null}
                aspectRatio={0.7 * (896/683)}
              />
              <div className="absolute top-4 right-4 z-50">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
                  onClick={() => {
                    return xRightCoor == null || yRightCoor == null
                      ? validateCoordinate()
                      : requestImage();
                  }}
                >
                  {xRightCoor == null || yRightCoor == null ? "Submit" : "Next"}
                </button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex justify-end items-start w-full" style={{ pointerEvents: "none" }}>
            {state.image && (
              <Image
                className="rounded shadow"
                src={state.image}
                alt="Campus location"
                width={400}
                height={300}
                style={{ opacity: imgOpacity, marginRight: 20, pointerEvents: "none" }}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
