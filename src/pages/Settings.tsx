import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadData, exportData, importData, setWeekStartDayForChild, getWeekStartDayForChild } from '../utils/storage'
import type { Child } from '../types/types'
import HeroAvatar from '../components/HeroAvatar'
import NavBar from '../components/NavBar'
import QuestSetupMenu from '../components/QuestSetupMenu'
import Footer from '../components/Footer'

const WEEK_DAYS = [
  { d: 1, label: 'Monday' },
  { d: 2, label: 'Tuesday' },
  { d: 3, label: 'Wednesday' },
  { d: 4, label: 'Thursday' },
  { d: 5, label: 'Friday' },
  { d: 6, label: 'Saturday' },
  { d: 0, label: 'Sunday' },
]

export default function Settings() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [children, setChildren] = useState<Child[]>([])
  useEffect(() => setChildren(loadData().children), [])

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importData(file)
      setMsg('✅ Data imported! Reloading…')
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      setMsg("❌ Couldn't import — make sure it's a valid backup file.")
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 pt-12 pb-6 flex flex-col gap-4">
        <h1 className="text-2xl font-black text-gray-800">Settings</h1>

        {/* About */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-2">About</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Kiddos — Turn chores into daily quests.<br />
            No account required. Everything stays on your device.
          </p>
          <p className="text-xs text-gray-400 mt-3">Your progress is saved on this device.</p>
        </div>

        {/* Week start per child */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-gray-700">Week starts on</h2>
          <p className="text-sm text-gray-500">Choose the day of the week when the child begins using the app. Default: Monday.</p>
          {children.length === 0 ? (
            <p className="text-sm text-gray-400">Add children first.</p>
          ) : (
            children.map(child => (
              <div key={child.id} className="flex flex-col gap-3 pt-2 border-t border-gray-100 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/${child.id}`)}
                    className="shrink-0 p-0 bg-transparent border-0 rounded-full hover:ring-2 hover:ring-[#6C63FF] transition-all cursor-pointer"
                    aria-label={`Go to ${child.name}'s dashboard`}
                  >
                    <HeroAvatar hero={child.hero} size="sm" />
                  </button>
                  <span className="font-semibold text-gray-800">{child.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map(({ d, label }) => {
                    const selected = getWeekStartDayForChild(child.id) === d
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setWeekStartDayForChild(child.id, d)
                          setChildren(loadData().children)
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selected
                            ? 'bg-[#6C63FF] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Data backup */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-700">Data backup</h2>

          <button
            onClick={exportData}
            className="flex items-center gap-4 bg-[#6C63FF] hover:bg-purple-600 text-white font-semibold py-4 px-5 rounded-2xl transition-colors text-left"
          >
            <span className="text-3xl">💾</span>
            <div>
              <p className="font-bold leading-tight">Export family data</p>
              <p className="text-xs text-purple-200 mt-0.5">Download kiddos-backup.json</p>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-5 rounded-2xl transition-colors text-left"
          >
            <span className="text-3xl">📂</span>
            <div>
              <p className="font-bold leading-tight">Import data</p>
              <p className="text-xs text-gray-500 mt-0.5">Replace with a backup file</p>
            </div>
          </button>

          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          {msg && (
            <p className="text-sm text-center font-medium text-gray-600 bg-gray-50 rounded-xl py-3 px-4">
              {msg}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
