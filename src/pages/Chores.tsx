import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Child, Chore } from '../types/types'
import { loadData, addChore, removeChore, getChildChores } from '../utils/storage'
import { currentWeekDates } from '../utils/dateUtils'
import NavBar from '../components/NavBar'
import HeroAvatar from '../components/HeroAvatar'
import ChildCard from '../components/ChildCard'

const SUGGESTED = ['Clean room', 'Brush teeth', 'Feed pet', 'Do homework', 'Make bed', 'Tidy up toys']

function ChoresChild() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const [child, setChild] = useState<Child | null>(null)
  const [chores, setChores] = useState<Chore[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    const data = loadData()
    const c = data.children.find(x => x.id === childId) ?? null
    setChild(c)
    setChores(getChildChores(childId ?? ''))
  }, [childId])

  function refresh() {
    setChores(getChildChores(childId ?? ''))
  }

  function handleAdd() {
    if (!childId || !title.trim()) return
    addChore(childId, title.trim())
    setTitle('')
    refresh()
  }

  function handleDelete(id: string) {
    removeChore(id)
    refresh()
  }

  function handleSuggest(s: string) {
    if (!childId || chores.some(c => c.title.toLowerCase() === s.toLowerCase())) return
    addChore(childId, s)
    refresh()
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Child not found.</p>
          <button onClick={() => navigate('/chores')} className="text-[#6C63FF] font-semibold">← Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar title={`${child.name}'s Chores`} backTo="/chores" />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Child header */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex items-center gap-4">
          <HeroAvatar hero={child.hero} size="xl" />
          <div>
            <p className="text-2xl font-black text-gray-800">{child.name}</p>
            <p className="text-gray-500 text-sm mt-1">Manage chores for this child</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Add a chore</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Clean room"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
            <button
              onClick={handleAdd}
              className="bg-[#6C63FF] hover:bg-purple-600 text-white font-bold px-5 py-3 rounded-xl"
            >
              +
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED
              .filter(s => !chores.some(c => c.title.toLowerCase() === s.toLowerCase()))
              .map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggest(s)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>

        {/* List */}
        {chores.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p>No chores yet for {child.name}.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-700">Chores ({chores.length})</h2>
            {chores.map(chore => (
              <div key={chore.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <p className="flex-1 font-medium text-gray-800">{chore.title}</p>
                <button
                  onClick={() => handleDelete(chore.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ChoresPicker() {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])

  useEffect(() => {
    setChildren(loadData().children)
  }, [])

  function starsForChild(id: string): number {
    const data = loadData()
    const childChores = getChildChores(id)
    if (childChores.length === 0) return 0
    return currentWeekDates().filter((date: string) => {
      const done = data.progress.filter(p => p.childId === id && p.date === date).length
      return done >= childChores.length
    }).length
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar title="Chores" backTo="/children" />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="text-center mb-2">
          <p className="text-gray-600">Select a child to manage their chores</p>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">👶</div>
            <p>No children yet — add one from the Children page.</p>
            <button onClick={() => navigate('/children')} className="mt-4 text-[#6C63FF] font-semibold">
              Go to Children →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map(child => (
              <div
                key={child.id}
                onClick={() => navigate(`/chores/${child.id}`)}
                className="cursor-pointer"
              >
                <ChildCard
                  child={child}
                  stars={starsForChild(child.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function Chores() {
  const { childId } = useParams<{ childId?: string }>()
  if (childId) return <ChoresChild />
  return <ChoresPicker />
}
