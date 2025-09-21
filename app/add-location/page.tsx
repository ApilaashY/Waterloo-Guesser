"use client";

import { useRouter } from "next/navigation";
// components/LocationUploader.tsx

import { useState, useEffect, useRef } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import Map from "../../components/Map";
import Image from "next/image";

// Building list for dropdown
const buildings = [
  "Outdoors",
  "AL",
  "AVR",
  "B1",
  "B2",
  "BMH",
  "BRH",
  "BSC",
  "C2",
  "CGR",
  "CIF",
  "CIM",
  "CLN",
  "CLV",
  "CMH",
  "COG",
  "COM",
  "CPH",
  "CSB",
  "DC",
  "DWE",
  "E2",
  "E3",
  "E5",
  "E6",
  "E7",
  "EC1",
  "EC2",
  "EC3",
  "EC4",
  "EC5",
  "ECH",
  "EIT",
  "ERC",
  "ESC",
  "EV1",
  "EV2",
  "EV3",
  "EXP",
  "FED",
  "GH",
  "GSC",
  "HH",
  "HS",
  "IOG",
  "LHI",
  "LIB",
  "M3",
  "MC",
  "MKV",
  "ML",
  "NH",
  "OPT",
  "PAC",
  "PAS",
  "PHY",
  "QNC",
  "RA2",
  "RAC",
  "RCH",
  "REN",
  "REV",
  "SCH",
  "SLC",
  "STC",
  "STJ",
  "TC",
  "TH",
  "TJB",
  "UC",
  "UTD",
  "UWP",
  "V1",
];

// This page can be placed in app/upload/page.tsx for Next.js routing
// and will be accessible at /upload
export default function LocationUploader() {
  const router = useRouter();
  // Secret passcode popup logic
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const secretSequence = "qwertyuiop";
  // Get passcode from env (client-side)
  let envPasscode = "";
  if (typeof window !== "undefined") {
    // @ts-expect-error This is a workaround for TypeScript to allow access to process.env in client-side code
    envPasscode = process.env.NEXT_PUBLIC_PASSCODE;
  }
  useEffect(() => {
    let sequence = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      sequence = (sequence + e.key).slice(-secretSequence.length);
      if (sequence === secretSequence) {
        setShowPasscode(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      setToast(success);
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
    if (error) {
      setToast(error);
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [buildingQuery, setBuildingQuery] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null); // Ref to the image element

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newZoom =
      e.deltaY > 0
        ? Math.max(0.5, zoom - zoomFactor)
        : Math.min(4, zoom + zoomFactor);
    setZoom(newZoom);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(3, prevZoom + 0.2));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(0.5, prevZoom - 0.2));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle panning with mouse drag
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPan(newPan);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Filter buildings based on query
  const filteredBuildings =
    buildingQuery === ""
      ? buildings
      : buildings.filter((building) =>
          building.toLowerCase().includes(buildingQuery.toLowerCase())
        );

  // Handles file selection and preview (local only)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setSuccess(null);
    setError(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Only for preview; actual upload is to CDN via backend
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || xCoor == null || yCoor == null || !building) {
      setError(
        "Please fill all fields, select an image, and location on the map."
      );
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile); // Backend will upload to Cloudinary and store CDN URL
      formData.append("xCoordinate", String(xCoor));
      formData.append("yCoordinate", String(yCoor));
      formData.append("name", name);
      formData.append("building", building);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      // Determine status based on passcode
      let status = "needs approval";
      let devToast = false;
      if (showPasscode && passcode === envPasscode) {
        status = "approved";
        devToast = true;
      }
      formData.append("status", status);
      const res = await fetch("api/uploadLocation", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSuccess("Location uploaded successfully!");
        if (devToast) {
          setToast("Welcome devs!");
          setTimeout(() => setToast(null), 2500);
        }
        setImageFile(null);
        setPreviewUrl(null);
        setXCoor(null);
        setYCoor(null);
        setName("");
        setBuilding("");
        setLatitude("");
        setLongitude("");
        setPasscode("");
        setShowPasscode(false);
      } else {
        setError("Upload failed.");
      }
    } catch {
      setError("Error uploading location.");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-start overflow-auto">
      <div className="relative flex flex-col items-center justify-center w-full">
        {/* <div className="flex flex-row justify-center w-full p-2 flex-wrap gap-2 top-0 left-0 absolute">
          <Link
            href="/game"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 cursor-pointer"
          >
            Back to Game
          </Link>
        </div> */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 w-full">
          {/* Passcode Popup */}
          {showPasscode && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Enter Passcode</h2>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="border rounded px-4 py-2 mb-4 text-lg"
                  autoFocus
                />
                <div className="flex gap-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                    onClick={() => setShowPasscode(false)}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
                    onClick={() => {
                      if (passcode === envPasscode) {
                        setToast("Welcome devs!");
                        setTimeout(() => setToast(null), 2500);
                        router.push("/manual-dot-placer");
                        setShowPasscode(false);
                      } else {
                        setToast("Incorrect passcode");
                        setTimeout(() => setToast(null), 2500);
                      }
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl w-full"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col items-start bg-white p-6 rounded-lg shadow w-full">
              {toast && (
                <div
                  className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow font-bold text-white ${
                    toast === success ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {toast}
                </div>
              )}
              {/* ...existing code... */}
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Upload Campus Location
              </h2>
              <label className="block font-medium text-gray-700">
                Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              <label className="block font-medium text-gray-700">
                Building
              </label>
              <Combobox
                value={building}
                onChange={(value: string | null) => setBuilding(value || "")}
              >
                <div className="relative">
                  <Combobox.Input
                    className="w-full border rounded px-3 py-2 pr-10"
                    displayValue={(building: string) => building}
                    onChange={(event) => setBuildingQuery(event.target.value)}
                    placeholder="Select or type building"
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredBuildings.length === 0 && buildingQuery !== "" ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredBuildings.map((building) => (
                        <Combobox.Option
                          key={building}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-yellow-600 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={building}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {building}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? "text-white" : "text-yellow-600"
                                  }`}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-xs rounded shadow mb-2 flex-1"
                  width={896}
                  height={683}
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                />
              )}

              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-yellow-600 text-white rounded shadow hover:bg-yellow-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Submit Location"}
              </button>
              {success && (
                <>
                  <div className="text-green-600 font-semibold">{success}</div>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded shadow hover:bg-yellow-700"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                      setXCoor(null);
                      setYCoor(null);
                      setName("");
                      setBuilding("");
                      setLatitude("");
                      setLongitude("");
                      setPasscode("");
                      setShowPasscode(false);
                      setSuccess(null);
                      setError(null);
                    }}
                  >
                    Add Another Location
                  </button>
                </>
              )}
              {error && (
                <div className="text-red-600 font-semibold">{error}</div>
              )}
            </div>
            <div
              className="flex items-center justify-center w-full"
              style={{ width: "100%", margin: 0, padding: 0 }}
            >
              <div
                style={{
                  width: "90vw",
                  maxWidth: 1200,
                  aspectRatio: "896/683",
                  position: "relative",
                  background: "#eaeaea",
                  borderRadius: 12,
                  overflow: "hidden",
                  margin: 0,
                  padding: 0,
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Zoom Controls */}
                <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-md flex items-center justify-center text-gray-700 font-bold text-lg transition-colors"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-md flex items-center justify-center text-gray-700 font-bold text-lg transition-colors"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="w-10 h-10 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-md flex items-center justify-center text-gray-700 font-bold text-xs transition-colors"
                    title="Reset Zoom"
                  >
                    ⌂
                  </button>
                </div>

                {/* Zoom Level Indicator */}
                <div className="absolute top-4 right-4 z-50 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {Math.round(zoom * 100)}%
                </div>

                <Map
                  xCoor={xCoor}
                  yCoor={yCoor}
                  setXCoor={setXCoor}
                  setYCoor={setYCoor}
                  xRightCoor={null}
                  yRightCoor={null}
                  aspectRatio={0.25}
                  currentScore={0}
                  zoom={zoom}
                  pan={pan}
                  imageRef={imageRef}
                />

                {/* Precision Controls Overlay - Only show if coordinates are selected */}
                {xCoor !== null && yCoor !== null && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Minimal Circular Fine Adjust UI */}
                    <div className="absolute bottom-6 right-6 pointer-events-auto">
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-md rounded-full shadow-2xl border border-gray-200">
                          {/* Up Arrow */}
                          <button
                            type="button"
                            className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow transition"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                            onClick={() => {
                              const newY = Math.max(0, (yCoor || 0) - 0.002);
                              setYCoor(newY);
                            }}
                            aria-label="Move up"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          </button>
                          {/* Left Arrow */}
                          <button
                            type="button"
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow transition"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                            onClick={() => {
                              const newX = Math.max(0, (xCoor || 0) - 0.002);
                              setXCoor(newX);
                            }}
                            aria-label="Move left"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                          </button>
                          {/* Right Arrow */}
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow transition"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                            onClick={() => {
                              const newX = Math.min(1, (xCoor || 0) + 0.002);
                              setXCoor(newX);
                            }}
                            aria-label="Move right"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                          {/* Down Arrow */}
                          <button
                            type="button"
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow transition"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                            onClick={() => {
                              const newY = Math.min(1, (yCoor || 0) + 0.002);
                              setYCoor(newY);
                            }}
                            aria-label="Move down"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                          {/* Center Reset Button */}
                          <button
                            type="button"
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white rounded-full shadow transition"
                            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                            onClick={() => {
                              setXCoor(null);
                              setYCoor(null);
                            }}
                            title="Clear selection"
                            aria-label="Clear selection"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                          {/* Coordinate display inside circle */}
                          <div
                            className="absolute left-1/2 bottom-3 -translate-x-1/2 text-xs text-gray-700 bg-white bg-opacity-70 rounded px-2 py-1 shadow"
                            style={{ fontWeight: 500 }}
                          >
                            ({(xCoor || 0).toFixed(3)},{" "}
                            {(yCoor || 0).toFixed(3)})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* {xCoor != null && yCoor != null && (
            <div className="mt-2 text-sm text-gray-700">Selected Coordinates: ({xCoor.toFixed(4)}, {yCoor.toFixed(4)})</div>
          )} */}
            </div>
          </form>
          {/* ManualDotPlacer is now only accessible via redirect, not rendered here */}
        </div>
      </div>
    </div>
  );
}
