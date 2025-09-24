"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import mockData from '@/mock-data/mock-site-data.json'

type Player = {
  id: string
  name: string
  avatar: string | null
  rank: number | null
}

type Faculty = {
  name: string
  imagePath: string
  color: string
  totalScore: number
  players: Array<{ player: Player; score: number; rank: number | null }>
}

export default function Page() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('Engineering')

  // Making array to dictionary for easier lookup
  const players: Record<string, Player> = (mockData as any).players.reduce((acc: any, p: any) => {
    acc[p.playerId] = p
    return acc
  }, {})

  const leaderboardData = (mockData as any).leaderboard

  // Faculty mapping (mock data doesn't have faculties, so we'll assign them)
  const facultyMapping: Record<string, string> = {
    'p_chris': 'Engineering',
    'p_ellen': 'Health',
    'p_ben': 'Math', 
    'p_anna': 'Environment',
    'p_diego': 'Arts',
    'p_fatima': 'Science'
  }

  const facultySymbols: Record<string, { imagePath: string; color: string }> = {
    'Engineering': { imagePath: '/Engineering-Symbol.png', color: 'text-green-400' },
    'Health': { imagePath: '/Health.png', color: 'text-red-400' },
    'Math': { imagePath: '/Math.png', color: 'text-blue-400' },
    'Environment': { imagePath: '/Environment-Symbol.png', color: 'text-yellow-400' },
    'Arts': { imagePath: '/Art-Symbol.png', color: 'text-purple-400' },
    'Science': { imagePath: '/Science-Symbol.png', color: 'text-cyan-400' }
  }

  // Selected background colors for certain faculties
  const selectedBgColors: Record<string, string> = {
    'Environment': '#34584a',
    'Arts': '#ff5945'
  }
  // Add more faculty selected colors
  selectedBgColors['Engineering'] = '#6e469c';
  selectedBgColors['Science'] = '#0049b4';
  selectedBgColors['Health'] = '#009c9e';
  selectedBgColors['Math'] = '#e357cd';

  // Group players by faculty and calculate totals
  const faculties: Faculty[] = Object.entries(facultySymbols).map(([name, { imagePath, color }]) => {
    const facultyPlayers = leaderboardData
      .filter((entry: any) => facultyMapping[entry.playerId] === name)
      .map((entry: any) => ({
        player: players[entry.playerId] || { name: 'Unknown', avatar: null, rank: null },
        score: entry.score,
        rank: entry.rank
      }))
      .sort((a: any, b: any) => b.score - a.score)

    const totalScore = facultyPlayers.reduce((sum: number, p: any) => sum + p.score, 0)

    return {
      name,
      imagePath,
      color,
      totalScore,
      players: facultyPlayers
    }
  }).sort((a, b) => b.totalScore - a.totalScore)

  const selectedFacultyData = faculties.find(f => f.name === selectedFaculty) || faculties[0]

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#fff7d9' }}>

      <div className="w-full max-w-6xl mx-auto p-6 relative z-20">
        {/* Main container with hero styling */}
        <div className="relative rounded-2xl bg-white/20 backdrop-blur-lg border border-[#090C9B]/30 p-6 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center mb-8 mt-6">
            <h2 className="text-3xl font-bold text-[#090C9B]">Faculty Leaderboard</h2>
          </div>

          {/* Faculty Symbols Horizontal Row */}
          <div className="flex items-center justify-center gap-16 mb-10 px-4 py-4 bg-white/10 rounded-xl border border-[#090C9B]/20">
            {faculties.map((faculty) => {
              const isSelected = selectedFaculty === faculty.name;
              const bgColor = isSelected && selectedBgColors[faculty.name] ? selectedBgColors[faculty.name] : undefined;
              return (
                <button
                  key={faculty.name}
                  onClick={() => setSelectedFaculty(faculty.name)}
                  className={`relative w-16 h-16 transition-all duration-300 hover:scale-110 ${
                    isSelected ? 'scale-125 drop-shadow-lg' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={bgColor ? { borderRadius: 8 } : undefined}
                >
                  {/* Circular blurred halo behind the icon when selected */}
                  {isSelected && selectedBgColors[faculty.name] && (
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120%',
                        height: '120%',
                        backgroundColor: selectedBgColors[faculty.name],
                        borderRadius: '50%',
                        filter: 'blur(10px)',
                        opacity: 0.65,
                        zIndex: 0,
                        pointerEvents: 'none'
                      }}
                    />
                  )}

                  {/* Icon on top of halo */}
                  <div className="relative z-10 w-full h-full">
                    <Image
                      src={faculty.imagePath}
                      alt={`${faculty.name} Symbol`}
                      fill
                      className="object-contain filter invert brightness-200 contrast-200"
                    />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Faculty Totals */}
            <div className="rounded-xl bg-white/10 border border-[#090C9B]/20 p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#090C9B]">Leaderboard</h3>
                <span className="text-sm text-[#090C9B]/70">Top faculties</span>
              </div>
              <ol className="space-y-4">
                {faculties.map((faculty, idx) => (
                  <li
                    key={faculty.name}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedFaculty === faculty.name ? 'bg-[#090C9B]/10' : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedFaculty(faculty.name)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-tr from-amber-400 to-orange-400 text-[#090C9B] font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[#090C9B]">{faculty.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-[#090C9B]">{faculty.totalScore.toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Middle: Spacer */}
            <div></div>

            {/* Right: Selected Faculty Players */}
            <div className="rounded-xl bg-white/10 border border-[#090C9B]/20 p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#090C9B]">Leaderboard</h3>
                <span className="text-sm text-[#090C9B]/70">Top players</span>
              </div>
              <ol className="space-y-3">
                {selectedFacultyData.players.slice(0, 6).map((playerData, idx) => (
                  <li key={playerData.player.id ?? `player-${idx}`} className="flex items-center gap-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-tr from-amber-400 to-orange-400 text-[#090C9B] font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#090C9B]">{playerData.player.name}</div>
                        <div className="text-sm text-[#090C9B]/70">Rank: {playerData.rank ?? '—'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-[#090C9B]">{playerData.score.toLocaleString()}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 text-sm text-[#090C9B]/70">Updated: mock data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
