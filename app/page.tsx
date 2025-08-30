import Hero from '../components/Hero'
import Leaderboard from '../components/Leaderboard'

export default function Page() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Leaderboard />
      </div>
    </>
  )
}
