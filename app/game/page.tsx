"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import GamePage from '../../components/GamePage';
import TriangleGamePage from '../../components/TriangleGamePage';

function GamePageWithParams() {
  const searchParams = useSearchParams();
  const modifier = searchParams.get('modifier') || undefined;
  const mode = searchParams.get('mode') || 'normal';
  
  if (mode === 'triangle') {
    return <TriangleGamePage />;
  }
  
  return <GamePage modifier={modifier} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageWithParams />
    </Suspense>
  );
}
