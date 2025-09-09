"use client";

import { ClubPosterBoardClient } from "./[club]/client";

export interface PosterObject {
  clubName: string;
  posterUrl: string;
  description: string;
  eventDateTime: Date | null;
}

export default function PosterBoardPage() {
  return <ClubPosterBoardClient clubName={null} />;
}
