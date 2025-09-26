"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import GamePage from '../../components/GamePage';

function GamePageWithParams() {
  const searchParams = useSearchParams();
  const modifier = searchParams.get('modifier') || undefined;
  
  return <GamePage modifier={modifier} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageWithParams />
    </Suspense>
  );
}
