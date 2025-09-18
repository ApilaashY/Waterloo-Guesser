"use client";

import { ClubPosterBoardClient } from "./[club]/client";

export interface PosterObject {
  name: string;
  posterUrl: string;
  description: string;
  eventDateTime: Date | null;
  posterType: "Club" | "Event";
}

export default function PosterBoardPage() {
  return <ClubPosterBoardClient clubName={null} />;
}
