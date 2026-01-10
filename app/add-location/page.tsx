"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import Map from "../../components/Map";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, MapPin, Search, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

// Building list for dropdown
const buildings = [
  "Outdoors", "AL", "AVR", "B1", "B2", "BMH", "BRH", "BSC", "C2", "CGR", "CIF", "CIM", "CLN", "CLV",
  "CMH", "COG", "COM", "CPH", "CSB", "DC", "DWE", "E2", "E3", "E5", "E6", "E7", "EC1", "EC2", "EC3",
  "EC4", "EC5", "ECH", "EIT", "ERC", "ESC", "EV1", "EV2", "EV3", "EXP", "FED", "GH", "GSC", "HH",
  "HS", "IOG", "LHI", "LIB", "M3", "MC", "MKV", "ML", "NH", "OPT", "PAC", "PAS", "PHY", "QNC", "RA2",
  "RAC", "RCH", "REN", "REV", "SCH", "SLC", "STC", "STJ", "TC", "TH", "TJB", "UC", "UTD", "UWP", "V1"
];

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
        : Math.min(7, zoom + zoomFactor);
    setZoom(newZoom);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(7, prevZoom + 0.2));
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
    <div className="min-h-screen w-full bg-root text-primary selection:bg-accent-primary/30 flex flex-col items-center justify-start overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-soft/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full p-6 max-w-7xl mx-auto h-screen">
        {/* Header & Back Link */}
        <div className="w-full flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Campus
          </Link>
        </div>

        {/* Passcode Popup */}
        {showPasscode && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full max-w-sm">
              <h2 className="text-xl font-heading font-bold mb-4 text-glow">Dev Access</h2>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 mb-6 text-lg text-primary focus:border-accent-primary outline-none text-center"
                placeholder="Enter passcode"
                autoFocus
              />
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-secondary rounded-lg transition-colors border border-white/5"
                  onClick={() => setShowPasscode(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 text-white rounded-lg transition-colors font-bold shadow-lg shadow-accent-primary/20"
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
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}

        <form
          className="flex flex-col lg:flex-row gap-6 w-full h-full overflow-hidden"
          onSubmit={handleSubmit}
        >
          {/* Left Panel: Form */}
          <div className="flex flex-col bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 w-full lg:w-1/3 overflow-y-auto">
            {toast && (
              <div
                className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-xl font-bold text-white border border-white/10 backdrop-blur-md ${toast === success ? "bg-emerald-500/90" : "bg-red-500/90"
                  }`}
              >
                {toast}
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Upload Location</h2>
                <p className="text-xs text-secondary font-data">Contribute to the campus map</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Image File</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Building</label>
                <Combobox
                  value={building}
                  onChange={(value: string | null) => setBuilding(value || "")}
                >
                  <div className="relative">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-black/20 text-left border border-white/10 focus-within:border-accent-primary transition-colors">
                      <div className="flex items-center pl-3">
                        <Search className="w-4 h-4 text-secondary mr-2" />
                        <Combobox.Input
                          className="w-full border-none py-2.5 pr-10 text-sm leading-5 text-primary bg-transparent focus:ring-0 outline-none placeholder-secondary/50 font-data"
                          displayValue={(building: string) => building}
                          onChange={(event) => setBuildingQuery(event.target.value)}
                          placeholder="Search buildings..."
                        />
                      </div>
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-secondary" aria-hidden="true" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface border border-white/10 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                      {filteredBuildings.length === 0 && buildingQuery !== "" ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-secondary font-data">
                          Nothing found.
                        </div>
                      ) : (
                        filteredBuildings.map((building) => (
                          <Combobox.Option
                            key={building}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 transition-colors font-data ${active ? "bg-accent-primary text-white" : "text-primary"
                              }`
                            }
                            value={building}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                  {building}
                                </span>
                                {selected ? (
                                  <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-accent-primary"}`}>
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
              </div>

              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/40">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 space-y-3">
              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-3 bg-accent-primary hover:bg-accent-primary/80 text-white rounded-xl shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Submit Location</span>
                  </>
                )}
              </button>

              {success && (
                <button
                  type="button"
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-secondary rounded-xl border border-white/10 transition-colors font-medium flex items-center justify-center gap-2"
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
                  <RotateCcw className="w-4 h-4" />
                  Add Another Location
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Map */}
          <div className="flex-1 bg-black/20 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative backdrop-blur-sm">
            <div
              className="w-full h-full relative bg-[#eaeaea]"
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
                  className="w-10 h-10 bg-surface/90 hover:bg-accent-primary hover:text-white border border-white/10 rounded-lg shadow-lg flex items-center justify-center text-primary transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-10 h-10 bg-surface/90 hover:bg-accent-primary hover:text-white border border-white/10 rounded-lg shadow-lg flex items-center justify-center text-primary transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="w-10 h-10 bg-surface/90 hover:bg-accent-primary hover:text-white border border-white/10 rounded-lg shadow-lg flex items-center justify-center text-primary transition-all"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Level Indicator */}
              <div className="absolute top-4 right-4 z-50 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-mono border border-white/10">
                {Math.round(zoom * 100)}%
              </div>

              <Map
                xCoor={xCoor}
                yCoor={yCoor}
                setXCoor={setXCoor}
                setYCoor={setYCoor}
                xRightCoor={null}
                yRightCoor={null}
                currentScore={0}
                zoom={zoom}
                pan={pan}
                imageRef={imageRef}
              />

              {/* Precision Controls Overlay */}
              {xCoor !== null && yCoor !== null && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-6 right-6 pointer-events-auto">
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 flex items-center justify-center bg-surface/80 backdrop-blur-md rounded-full shadow-2xl border border-white/10">
                        {/* Up Arrow */}
                        <button
                          type="button"
                          className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-accent-primary hover:bg-accent-primary/80 text-white rounded-full shadow-lg transition-colors"
                          onClick={() => setYCoor(Math.max(0, (yCoor || 0) - 0.002))}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        {/* Left Arrow */}
                        <button
                          type="button"
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-accent-primary hover:bg-accent-primary/80 text-white rounded-full shadow-lg transition-colors"
                          onClick={() => setXCoor(Math.max(0, (xCoor || 0) - 0.002))}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        {/* Right Arrow */}
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-accent-primary hover:bg-accent-primary/80 text-white rounded-full shadow-lg transition-colors"
                          onClick={() => setXCoor(Math.min(1, (xCoor || 0) + 0.002))}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        {/* Down Arrow */}
                        <button
                          type="button"
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-accent-primary hover:bg-accent-primary/80 text-white rounded-full shadow-lg transition-colors"
                          onClick={() => setYCoor(Math.min(1, (yCoor || 0) + 0.002))}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {/* Center Reset */}
                        <button
                          type="button"
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/10"
                          onClick={() => { setXCoor(null); setYCoor(null); }}
                          title="Clear selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {/* Coordinate Label */}
                        <div className="absolute left-1/2 bottom-[-24px] -translate-x-1/2 text-[10px] font-mono text-secondary bg-black/80 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap">
                          {(xCoor || 0).toFixed(3)}, {(yCoor || 0).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
