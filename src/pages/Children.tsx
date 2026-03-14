import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child, HeroType } from '../types/types'
import { loadData, addChild, removeChild, getChildChores } from '../utils/storage'
import { currentWeekDates } from '../utils/dateUtils'
import ChildCard from '../components/ChildCard'
import NavBar from '../components/NavBar'
import { HERO_IMAGES } from '../components/HeroAvatar' 

const HEROES: HeroType[] = ['cat', 'dog', 'sloth', 'lion', 'leopard', 'zebra', 'panda', 'monkey']

function starsForChild(childId: string): number {
  const { progress } = loadData()
  const childChores = getChildChores(childId)
  if (childChores.length === 0) return 0
  return currentWeekDates().filter(date => {
    const done = progress.filter(p => p.childId === childId && p.date === date).length
    return done >= childChores.length
  }).length
}

export default function Children() {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])
  const [name, setName]         = useState('')
  const [hero, setHero]         = useState<HeroType>('cat')
  const [error, setError]       = useState('')

  useEffect(() => { setChildren(loadData().children) }, [])

  function handleAdd() {
    if (!name.trim()) { setError('Please enter a name'); return }
    if (children.length >= 5) { setError('Maximum 5 children'); return }
    addChild({ id: crypto.randomUUID(), name: name.trim(), hero })
    setChildren(loadData().children)
    setName('')
    setError('')
  }

  function handleDelete(id: string) {
    removeChild(id)
    setChildren(loadData().children)
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar
        title="Your Family"
        right={
          <button
            onClick={() => navigate('/settings')}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Settings"
          >
            ⚙️
          </button>
        }
      />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Add child form */}
        {children.length < 5 && (
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Add a child</h2>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Child's name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6C63FF] mb-4"
            />

            <p className="text-sm font-semibold text-gray-500 mb-3">Pick a hero</p>
            <div className="flex gap-3 mb-4">
              {HEROES.map(h => (
                <button
                  key={h}
                  onClick={() => setHero(h)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    hero === h
                      ? 'bg-[#6C63FF] shadow-md scale-110'
                      : 'bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <img src={HERO_IMAGES[h]} alt={h} className="w-8 h-8" />
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <button
              onClick={handleAdd}
              className="w-full bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold py-3 rounded-xl transition-all"
            >
              + Add Child
            </button>
          </div>
        )}

        {/* List */}
        {children.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">👶</div>
            <p>No children yet — add one above!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-700">Children ({children.length}/5)</h2>
            {children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                stars={starsForChild(child.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Nav shortcuts */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/chores')}
            className="bg-white border border-purple-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-1">📋</div>
            <p className="font-semibold text-gray-700 text-sm">Manage Chores</p>
          </button>
          <button
            onClick={() => navigate('/rewards')}
            className="bg-white border border-purple-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-1">🎁</div>
            <p className="font-semibold text-gray-700 text-sm">Manage Rewards</p>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-2">
          Your progress is saved on this device.
        </p>
      </main>
    </div>
  )
}
