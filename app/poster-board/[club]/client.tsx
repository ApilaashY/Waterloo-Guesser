"use client";

import { PosterObject } from "@/components/PosterObject";
import { type PosterObject as PosterObjectType } from "@/app/poster-board/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ClubPosterBoardClient({
  clubName,
}: {
  clubName: string | null;
}) {
  // Hooks and Variables
  const router = useRouter();
  const [posters, setPosters] = useState<PosterObjectType[]>([]);

  // function to fetch posters from the API
  async function fetchPosters() {
    try {
      const queryParam = clubName
        ? `?clubname=${encodeURIComponent(clubName)}`
        : "";
      const response = await fetch(`/api/posters/retrieve${queryParam}`);
      if (response.ok) {
        const data = await response.json();
        setPosters(data.posters);
      } else {
        console.error("Failed to fetch posters");
      }
    } catch (error) {
      console.error("Error fetching posters:", error);
    }
  }

  // Fetch posters from the API on startup
  useEffect(() => {
    console.log(clubName);

    fetchPosters();
  }, [clubName]);

  // Function that adds poster to the board
  function addImage() {
    router.push("/poster-board/add");
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center m-4">
        Poster Board {clubName && `- ${clubName}`}
      </h1>

      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 cursor-pointer text-center"
        onClick={addImage}
      >
        Add Poster
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {posters.map((poster, index) => (
          <PosterObject key={index} router={router} {...poster} />
        ))}
      </div>
    </div>
  );
}
