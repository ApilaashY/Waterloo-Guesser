"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'

const OPTIONS = [
  { id: 'a', label: 'Option A' },
  { id: 'b', label: 'Option B' },
  { id: 'c', label: 'Option C' },
  { id: 'd', label: 'Option D' },
]

type LaunchProps = {
  routeId?: string | null
}

export default function LaunchPage({ routeId }: LaunchProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const pathname = routeId ? `/launch/${routeId}` : (typeof window !== 'undefined' ? window.location.pathname : '')

  // mapping numeric id -> backdrop file (filename in /public)
  const BACKDROP_MAP: Record<string, string> = {
    '3003024523084': '/E7 backdrop.png', // engineering
    '3067876545867': '/EV3 backdrop.png',
    '0987243023849': '/EXP backdrop.png',
    '3290490423948': '/MC backdrop.png',
    '6406921034941': '/QNC Backdrop.png',
    '6049624340209': '/STJ Backdrop.png',
  }

  // which ids are engineering backdrops (use the keys above that represent engineering)
  const ENGINEERING_IDS = new Set(['3003024523084'])

  // engineering building list (map)
  const EN_BUILDINGS = [
    'ECH','E5','E7','E6','E3','E2','CPH','RCH','DWE',
    // 'ML','AL','PAS','STJ','REN',
    // 'C2','QNC','B1','B2','STC','ESC','PHY',
    // 'MC','M3','DC',
    // 'OPT','EXP',
  ]
  const ENV_IDS = new Set(['3067876545867'])

  const ENV_BUILDINGS = [ 'EV1','EV2','EV3','UTD' ]

  // Arts
  const ARTS_IDS = new Set(['6049624340209'])
  const ARTS_BUILDINGS = [
    'ART1','ART2','ART3','ART4'
  ]

  // Science
  const SCIENCE_IDS = new Set(['6406921034941'])
  const SCIENCE_BUILDINGS = [
    'SCI1','SCI2','PHY','BIO'
  ]

  // Mathematics
  const MATH_IDS = new Set(['3290490423948'])
  const MATH_BUILDINGS = [
    'MATH','MATHLAB','STAT'
  ]

  // Health
  const HEALTH_IDS = new Set(['0987243023849'])
  const HEALTH_BUILDINGS = [
    'H1','H2','H3'
  ]

  

  // extract trailing number from pathname, e.g. /launch/123
  const pathParts = pathname.split('/').filter(Boolean)
  const trailing = pathParts.length ? pathParts[pathParts.length - 1] : null
  const backdropSrc = trailing && BACKDROP_MAP[trailing] ? BACKDROP_MAP[trailing] : '/egg mascot.png'

  function handleSelect(id: string) {
    setSelected(id)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // placeholder: process selection
    // replace with actual logic as needed
    console.log('Submitted selection:', selected)
    alert(`Submitted: ${selected}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6">
          <div className="w-64 h-40 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
            <img src={backdropSrc} alt="Centered backdrop" className="object-cover w-full h-full" />
          </div>

          <div className="w-full">
            <p className="text-center text-gray-700 mb-4">Choose an option below</p>
            <div className="grid grid-cols-2 gap-3">
              {ENGINEERING_IDS.has(trailing || '') ? EN_BUILDINGS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border-2 ${selected === b ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                  {b}
                </button>
              )) : ENV_IDS.has(trailing || '') ? ENV_BUILDINGS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border-2 ${selected === b ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                  {b}
                </button>
              )) : ARTS_IDS.has(trailing || '') ? ARTS_BUILDINGS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border-2 ${selected === b ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                  {b}
                </button>
              )) : SCIENCE_IDS.has(trailing || '') ? SCIENCE_BUILDINGS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border-2 ${selected === b ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                  {b}
                </button>
              )) : MATH_IDS.has(trailing || '') ? MATH_BUILDINGS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border-2 ${selected === b ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                  {b}
                </button>
              )) : HEALTH_IDS.has(trailing || '') ? HEALTH_BUILDINGS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border-2 ${selected === b ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                  {b}
                </button>
              )) : OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`py-3 rounded-lg text-sm font-medium transition-colors border-2 ${selected === opt.id ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full flex justify-center mt-4">
            <button type="submit" className="px-6 py-2 rounded-md bg-indigo-600 text-white font-semibold disabled:opacity-50" disabled={!selected}>
              Submit
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
