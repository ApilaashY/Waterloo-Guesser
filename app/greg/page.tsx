"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

/*
Overpass Turbo Query:
way["highway"](poly:"43.4768918 -80.5400017 43.4704821 -80.557769 43.4703459 -80.557549 43.4701862 -80.5573023 43.4697385 -80.5564332 43.4695633 -80.5560202 43.4694855 -80.5558163 43.4693998 -80.555591 43.4693064 -80.5552638 43.4692558 -80.555076 43.469174 -80.5548078 43.4691021 -80.5543858 43.469067 -80.5540907 43.4690476 -80.5536616 43.4690631 -80.5532217 43.4691215 -80.552873 43.4692578 -80.551961 43.4693201 -80.5514246 43.4693519 -80.5511144 43.469348 -80.5508516 43.4693403 -80.5505404 43.4692819 -80.5501596 43.4692274 -80.5498055 43.4690171 -80.549253 43.468912 -80.5489794 43.4685149 -80.5484108 43.4679401 -80.5478129 43.4668434 -80.5467272 43.4664073 -80.5461934 43.4659198 -80.5452263 43.4647734 -80.5427467 43.4643899 -80.5415612 43.4688658 -80.5391959 43.471025 -80.5380333 43.4710971 -80.5379662 43.4712586 -80.5378107 43.4714708 -80.5375451 43.4715701 -80.5374352 43.4717005 -80.5372528 43.4718192 -80.5370248 43.4719302 -80.53677 43.47208 -80.5363945 43.4735245 -80.5374858 43.4748948 -80.5385426 43.4768918 -80.5400017");
out geom;
*/

// Dynamically import the map component to avoid SSR issues with Leaflet
const RingRoadMap = dynamic(() => import("../../components/RingRoadMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-blue-50">
      <div className="text-2xl font-bold text-blue-900 animate-pulse">
        Loading Map...
      </div>
    </div>
  ),
});

export default function GregPage() {
  useEffect(() => {
    const toastId = toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">You found the Easter egg!</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Comment what you think Greg is doing on our LinkedIn post!</span>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ),
      {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          maxWidth: '400px',
        },
        duration: Infinity,
      }
    );

    return () => {
      toast.dismiss(toastId);
    };
  }, []);

  return (
    <div className="relative">
      {/* Fixed Map Container */}
      <div className="fixed inset-0 z-0">
        <RingRoadMap />
      </div>

      {/* Scrollable Overlay (Ghost Content) */}
      {/* This div provides the height to scroll through */}
      <div className="relative z-10 w-full" style={{ height: "2000vh" }}>
        {/* 
            We leave this empty or minimal. 
            The user scrolls this container, which triggers the map update in the background.
         */}
        <div className="absolute top-1/2 left-4 text-white/50 pointer-events-none mix-blend-difference transform -rotate-90 origin-left">
          SCROLL DOWN ▼
        </div>
      </div>
    </div>
  );
}