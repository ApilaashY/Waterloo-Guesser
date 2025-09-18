import { PosterObject } from "@/components/PosterObject";
import { ClubPosterBoardClient } from "./client";

interface PageProps {
  params: Promise<{
    club: string | undefined | null;
  }>;
}

export default async function ClubPosterBoardPage({ params }: PageProps) {
  // Await the params object
  const resolvedParams = await params;
  const clubName = resolvedParams.club
    ? decodeURIComponent(resolvedParams.club)
    : null;

  return <ClubPosterBoardClient clubName={clubName} />;
}
