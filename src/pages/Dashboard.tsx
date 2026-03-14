import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Child, Chore } from '../types/types'
import { loadData, addProgress, getChildChores, getLastReward, clearLastReward } from '../utils/storage'
import { today, currentWeekDates } from '../utils/dateUtils'
import HeroAvatar from '../components/HeroAvatar'
import ChoreCard from '../components/ChoreCard'
import ProgressBar from '../components/ProgressBar'
import NavBar from '../components/NavBar'

export default function Dashboard() {
  const { childId } = useParams<{ childId: string }>()
  const navigate    = useNavigate()

  const [child, setChild]       = useState<Child | null>(null)
  const [chores, setChores]     = useState<Chore[]>([])
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [stars, setStars]       = useState(0)
  const [lastReward, setLastRewardState] = useState<{ title: string } | null>(null)

  const refresh = useCallback(() => {
    const data = loadData()
    const c    = data.children.find(c => c.id === childId) ?? null
    const todayStr   = today()
    const weekDates  = currentWeekDates()
    const childChores = getChildChores(childId ?? '')

    setChild(c)
    setChores(childChores)
    setCompletedToday(
      new Set(data.progress.filter(p => p.childId === childId && p.date === todayStr).map(p => p.choreId))
    )
    setStars(
      childChores.length === 0 ? 0 :
      weekDates.filter(date => {
        const done = data.progress.filter(p => p.childId === childId && p.date === date).length
        return done >= childChores.length
      }).length
    )
    const lr = getLastReward(childId ?? '')
    setLastRewardState(lr ? { title: lr.title } : null)
  }, [childId])

  useEffect(() => { refresh() }, [refresh])

  if (!child) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Child not found.</p>
          <button onClick={() => navigate('/children')} className="text-[#6C63FF] font-semibold">← Back</button>
        </div>
      </div>
    )
  }

  const allDoneToday = chores.length > 0 && chores.every(c => completedToday.has(c.id))

  function handleComplete(choreId: string) {
    addProgress({ childId: childId!, choreId, date: today() })
    refresh()
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar title="" backTo="/children" />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Hero card */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex items-center gap-4">
          <HeroAvatar hero={child.hero} size="xl" />
          <div>
            <p className="text-2xl font-black text-gray-800">{child.name}</p>
            <p className="text-gray-500 text-sm mt-1">
              {allDoneToday
                ? '🎉 All done for today!'
                : `${completedToday.size} / ${chores.length} chores today`}
            </p>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar stars={stars} />

        {/* Reward from last week */}
        {lastReward && (
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
            <p className="text-sm font-semibold text-gray-500 mb-1">Reward from last week</p>
            <p className="text-xl font-black text-[#3b1a5a]">{lastReward.title}</p>
            <button
              onClick={() => {
                clearLastReward()
                setLastRewardState(null)
              }}
              className="mt-4 w-full bg-[#6C63FF] hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Reward received
            </button>
          </div>
        )}

        {/* Manage chores & rewards */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/chores/${childId}`)}
            className="flex-1 bg-white border border-purple-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">📋</div>
            <p className="font-semibold text-gray-700 text-sm">Manage chores</p>
          </button>
          <button
            onClick={() => navigate(`/rewards/${childId}`)}
            className="flex-1 bg-white border border-purple-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">🎁</div>
            <p className="font-semibold text-gray-700 text-sm">Manage rewards</p>
          </button>
        </div>

        {/* Unlock spin */}
        {stars >= 7 && (
          <button
            onClick={() => navigate(`/wheel/${childId}`)}
            className="w-full bg-[#FF8A00] hover:bg-orange-500 active:scale-95 text-white font-bold text-lg py-4 rounded-2xl shadow-md transition-all"
          >
            Spin the Reward Wheel!
          </button>
        )}

        {/* Chores */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">📋 Today's quests</h2>

          {chores.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>No chores set up yet.</p>
              <button onClick={() => navigate(`/chores/${childId}`)} className="mt-3 text-[#6C63FF] font-semibold text-sm">
                Add chores →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {chores.map(chore => (
                <ChoreCard
                  key={chore.id}
                  title={chore.title}
                  completed={completedToday.has(chore.id)}
                  onComplete={() => handleComplete(chore.id)}
                />
              ))}
            </div>
          )}
        </div>

        {allDoneToday && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 text-white text-center shadow-lg">
            <div className="text-5xl mb-2">🌟</div>
            <p className="text-xl font-black">Amazing job, {child.name}!</p>
            <p className="text-purple-200 text-sm mt-1">You completed all your quests today!</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">Your progress is saved on this device.</p>
      </main>
    </div>
  )
}
