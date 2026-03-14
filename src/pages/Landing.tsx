import { useNavigate } from 'react-router-dom'
import { isFamilyReady } from '../utils/storage'
import RewardWheel from '../components/RewardWheel'

const DEMO_REWARDS = ['Ice cream', 'Movie night', 'Candy', 'Park visit', 'Game time', 'Screen time']

export default function Landing() {
  const navigate = useNavigate()

  function handleStart() {
    navigate(isFamilyReady() ? '/children' : '/create-family')
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center max-w-[900px] mx-auto">
        <span className="text-2xl font-black text-[#6C63FF]">KiddoQuest</span>
        <button
          onClick={handleStart}
          className="bg-[#6C63FF] hover:bg-purple-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
        >
          Start →
        </button>
      </header>

      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 flex flex-col items-center gap-10 py-10">
        {/* Hero */}
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-800 leading-tight mb-4">
            Turn chores into<br />
            <span className="text-[#6C63FF]">daily quests</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto mb-8">
            KiddoQuest motivates kids to complete household chores using gamification —
            earn stars, spin the reward wheel, celebrate!
          </p>
          <button
            onClick={handleStart}
            className="bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-lg transition-all"
          >
            Start
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          {['⭐ Earn stars', '🎰 Spin to win', '🦊 Pick a hero', '✅ Daily quests'].map(f => (
            <span key={f} className="bg-white border border-purple-100 rounded-full px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
              {f}
            </span>
          ))}
        </div>

        {/* How it works */}
        <div className="w-full max-w-lg">
          <h2 className="text-center text-xl font-bold text-gray-700 mb-4">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '👨‍👩‍👧', title: 'Create family',  desc: 'Add your kids and pick their hero avatars' },
              { icon: '📋', title: 'Set up chores',  desc: 'Define daily quests for your kids' },
              { icon: '🏆', title: 'Win rewards',    desc: 'Complete chores, earn stars, spin the wheel!' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-purple-50">
                <div className="text-4xl mb-2">{item.icon}</div>
                <p className="font-bold text-gray-800 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo wheel */}
        <div className="bg-white rounded-3xl shadow-md border border-purple-100 p-6 w-full max-w-sm text-center">
          <p className="text-sm font-semibold text-gray-400 mb-4">Demo reward wheel</p>
          <RewardWheel rewards={DEMO_REWARDS} demo />
          <p className="text-xs text-gray-400 mt-4">Complete a full week to spin for real!</p>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        Your progress is saved on this device.
      </footer>
    </div>
  )
}
