import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadData, getChildChores, getChildRewards, setLastReward } from '../utils/storage'
import { currentWeekDates } from '../utils/dateUtils'
import type { Child } from '../types/types'
import HeroAvatar from '../components/HeroAvatar'
import RewardWheel from '../components/RewardWheel'
import NavBar from '../components/NavBar'

export default function Wheel() {
  const { childId } = useParams<{ childId: string }>()
  const navigate    = useNavigate()

  const [child,   setChild]   = useState<Child | null>(null)
  const [rewards, setRewards] = useState<string[]>([])
  const [stars,   setStars]   = useState(0)

  useEffect(() => {
    const data      = loadData()
    const c         = data.children.find(c => c.id === childId) ?? null
    const weekDates = currentWeekDates()
    const childChores = getChildChores(childId ?? '')
    const childRewards = getChildRewards(childId ?? '')

    setChild(c)
    setRewards(childRewards.map(r => r.title))
    setStars(
      childChores.length === 0 ? 0 :
      weekDates.filter(date => {
        const done = data.progress.filter(p => p.childId === childId && p.date === date).length
        return done >= childChores.length
      }).length
    )
  }, [childId])

  if (!child) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    )
  }

  if (stars < 7) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
        <NavBar title="Reward Wheel" backTo={`/dashboard/${childId}`} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-black text-gray-700">Not yet!</h1>
          <p className="text-gray-500">{child.name} needs 7 stars to unlock the wheel.</p>
          <p className="text-lg font-bold text-[#6C63FF]">{stars} / 7 days</p>
          <button
            onClick={() => navigate(`/dashboard/${childId}`)}
            className="mt-4 bg-[#6C63FF] text-white font-bold px-8 py-3 rounded-xl"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (rewards.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
        <NavBar title="Reward Wheel" backTo={`/dashboard/${childId}`} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="text-6xl">🎁</div>
          <h1 className="text-2xl font-black text-gray-700">No rewards set up!</h1>
          <p className="text-gray-500">Ask a parent to add some rewards first.</p>
          <button onClick={() => navigate(`/rewards/${childId}`)} className="mt-4 bg-[#FF8A00] text-white font-bold px-8 py-3 rounded-xl">
            Add Rewards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar title="Reward Wheel" backTo={`/dashboard/${childId}`} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 flex flex-col items-center gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <HeroAvatar hero={child.hero} size="lg" />
          <div className="text-center">
            <p className="text-2xl font-black text-gray-800">🎉 {child.name} earned a spin!</p>
            <p className="text-gray-500 text-sm mt-1">7/7 days completed this week!</p>
          </div>
        </div>

        {/* Wheel */}
        <div className="bg-white rounded-3xl shadow-md border border-purple-100 p-6 w-full max-w-sm">
          <RewardWheel
            rewards={rewards}
            onRewardSelected={(reward) => {
              if (childId) setLastReward(childId, reward)
            }}
          />
        </div>

        <button onClick={() => navigate(`/dashboard/${childId}`)} className="text-[#6C63FF] font-semibold text-sm">
          ← Back to dashboard
        </button>
      </main>
    </div>
  )
}
