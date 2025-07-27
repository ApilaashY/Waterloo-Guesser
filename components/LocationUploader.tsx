"use client";

import { useRouter } from 'next/navigation';
// components/LocationUploader.tsx


import { useState, useEffect } from "react";
import Image from "next/image";
import Map from "./Map";
import ManualDotPlacer from "./ManualDotPlacer";

// This page can be placed in app/upload/page.tsx for Next.js routing
// and will be accessible at /upload
export default function LocationUploader() {
  const router = useRouter();
  // Secret passcode popup logic
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const secretSequence = "qwertyuiop";
  // Get passcode from env (client-side)
  let envPasscode = '';
  if (typeof window !== 'undefined') {
    // @ts-expect-error: NEXT_PUBLIC_PASSCODE is injected at runtime by Next.js
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
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setSuccess(null);
    setError(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || xCoor == null || yCoor == null || !building) {
      setError("Please fill all fields, select an image, and location on the map.");
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Passcode Popup */}
      {showPasscode && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Enter Passcode</h2>
            <input
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
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
      <form className="w-full max-w-lg bg-white rounded-lg shadow-md p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow font-bold text-white ${toast === success ? 'bg-green-600' : 'bg-red-600'}`}>{toast}</div>
        )}
        {/* ...existing code... */}
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Upload Campus Location</h2>
        <label className="block font-medium text-gray-700">Image File</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
        <label className="block font-medium text-gray-700">Building</label>
        <input type="text" value={building} onChange={e => setBuilding(e.target.value)} required className="border rounded px-3 py-2 mb-2" />
        {previewUrl && (
          <Image src={previewUrl} alt="Preview" width={300} height={200} className="max-w-xs rounded shadow mb-2" />
        )}
        <div className="flex items-center justify-center w-full" style={{ width: "100%", margin: 0, padding: 0 }}>
          <div style={{ width: "90vw", maxWidth: 1200, aspectRatio: "896/683", position: "relative", background: "#eaeaea", borderRadius: 12, overflow: "hidden", margin: 0, padding: 0 }}>
            <Map
              xCoor={xCoor}
              yCoor={yCoor}
              setXCoor={setXCoor}
              setYCoor={setYCoor}
              xRightCoor={null}
              yRightCoor={null}
              aspectRatio={0.25}
            />
          </div>
          {/* {xCoor != null && yCoor != null && (
            <div className="mt-2 text-sm text-gray-700">Selected Coordinates: ({xCoor.toFixed(4)}, {yCoor.toFixed(4)})</div>
          )} */}
        </div>
        <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50">
          {uploading ? "Uploading..." : "Submit Location"}
        </button>
        {success && <div className="text-green-600 font-semibold">{success}</div>}
        {error && <div className="text-red-600 font-semibold">{error}</div>}
      </form>
      {/* ManualDotPlacer is now only accessible via redirect, not rendered here */}
    </div>
  );
}
