"use client";
import dynamic from "next/dynamic";

const ManualDotPlacer = dynamic(() => import("@/components/ManualDotPlacer"), {
  ssr: false,
});

export default function ManualDotPlacerPage() {
  return <ManualDotPlacer />;
}
