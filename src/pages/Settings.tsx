import { useRef, useState } from 'react'
import { exportData, importData } from '../utils/storage'
import NavBar from '../components/NavBar'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

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
      <NavBar title="Settings" backTo="/children" />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Backup */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-700">Data backup</h2>

          <button
            onClick={exportData}
            className="flex items-center gap-4 bg-[#6C63FF] hover:bg-purple-600 text-white font-semibold py-4 px-5 rounded-2xl transition-colors text-left"
          >
            <span className="text-3xl">💾</span>
            <div>
              <p className="font-bold leading-tight">Export family data</p>
              <p className="text-xs text-purple-200 mt-0.5">Download kiddoquest-backup.json</p>
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

        {/* About */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-2">About</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            KiddoQuest — Turn chores into daily quests.<br />
            No account required. Everything stays on your device.
          </p>
          <p className="text-xs text-gray-400 mt-3">Your progress is saved on this device.</p>
        </div>
      </main>
    </div>
  )
}
