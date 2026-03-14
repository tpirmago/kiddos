import type { AppData, Child, Chore, Reward, Progress, LastReward } from '../types/types'

const KEY = 'kiddoquest'

const EMPTY: AppData = {
  children: [],
  chores:   [],
  rewards:  [],
  progress: [],
  lastReward: null,
}

// ---------------------------------------------------------------------------
// Validation — coerce raw parsed JSON into a valid AppData shape,
// dropping any records that are missing required fields.
// ---------------------------------------------------------------------------

function isChild(v: unknown): v is Child {
  if (!v || typeof v !== 'object') return false
  const c = v as Record<string, unknown>
  return (
    typeof c.id   === 'string' &&
    typeof c.name === 'string' &&
    ['fox', 'frog', 'cat', 'panda', 'tiger'].includes(c.hero as string)
  )
}

function isReward(v: unknown): v is Reward {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.childId === 'string' &&
    typeof r.title === 'string'
  )
}

function isProgress(v: unknown): v is Progress {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.childId === 'string' &&
    typeof p.choreId === 'string' &&
    typeof p.date    === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(p.date as string)
  )
}

function normalise(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') return { ...EMPTY }
  const r = raw as Record<string, unknown>
  const children = Array.isArray(r.children) ? r.children.filter(isChild) : []
  const firstChildId = children[0]?.id ?? null

  // Parse chores: support legacy { id, title } by assigning to first child
  let chores: Chore[] = []
  if (Array.isArray(r.chores)) {
    chores = r.chores
      .filter((x): x is Chore => {
        if (!x || typeof x !== 'object') return false
        const c = x as Record<string, unknown>
        if (typeof c.id === 'string' && typeof c.title === 'string') {
          if (typeof c.childId === 'string') return true
          if (firstChildId) return true // migrate legacy
          return false
        }
        return false
      })
      .map(c => {
        const x = c as { id: string; childId?: string; title: string }
        return {
          id: x.id,
          childId: x.childId ?? firstChildId!,
          title: x.title,
        } as Chore
      })
  }

  // Parse rewards: support legacy string[] by converting to objects for first child
  let rewards: Reward[] = []
  if (Array.isArray(r.rewards)) {
    rewards = r.rewards.flatMap((x, i) => {
      if (typeof x === 'string' && firstChildId) {
        return [{ id: `reward_${i}`, childId: firstChildId, title: x } as Reward]
      }
      if (isReward(x)) return [x]
      return []
    })
  }

  let lastReward: LastReward | null = null
  if (r.lastReward && typeof r.lastReward === 'object') {
    const lr = r.lastReward as Record<string, unknown>
    if (
      typeof lr.childId === 'string' &&
      typeof lr.title === 'string' &&
      typeof lr.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(lr.date as string)
    ) {
      lastReward = { childId: lr.childId as string, title: lr.title as string, date: lr.date as string }
    }
  }

  return {
    children,
    chores,
    rewards,
    progress: Array.isArray(r.progress) ? r.progress.filter(isProgress) : [],
    lastReward,
  }
}

// ---------------------------------------------------------------------------
// Core read / write
// ---------------------------------------------------------------------------

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    return normalise(JSON.parse(raw))
  } catch {
    return { ...EMPTY }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

/** Create the kiddoquest key if it does not exist yet. */
export function initFamily(): void {
  if (!localStorage.getItem(KEY)) saveData({ ...EMPTY })
}

/** Returns true once the family has been set up (key present). */
export function isFamilyReady(): boolean {
  return localStorage.getItem(KEY) !== null
}

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------

export function addChild(child: Child): void {
  const data = loadData()
  data.children.push(child)
  saveData(data)
}

export function removeChild(id: string): void {
  const data = loadData()
  data.children = data.children.filter(c => c.id !== id)
  data.chores = data.chores.filter(c => c.childId !== id)
  data.rewards = data.rewards.filter(r => r.childId !== id)
  data.progress = data.progress.filter(p => p.childId !== id)
  saveData(data)
}

// ---------------------------------------------------------------------------
// Chores
// ---------------------------------------------------------------------------

export function addChore(childId: string, title: string): void {
  const data = loadData()
  data.chores.push({ id: crypto.randomUUID(), childId, title })
  saveData(data)
}

export function removeChore(id: string): void {
  const data = loadData()
  data.chores = data.chores.filter(c => c.id !== id)
  data.progress = data.progress.filter(p => p.choreId !== id)
  saveData(data)
}

export function getChildChores(childId: string): Chore[] {
  return loadData().chores.filter(c => c.childId === childId)
}

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------

export function addReward(childId: string, title: string): void {
  const data = loadData()
  data.rewards.push({ id: crypto.randomUUID(), childId, title })
  saveData(data)
}

export function removeReward(id: string): void {
  const data = loadData()
  data.rewards = data.rewards.filter(r => r.id !== id)
  saveData(data)
}

export function getChildRewards(childId: string): Reward[] {
  return loadData().rewards.filter(r => r.childId === childId)
}

// ---------------------------------------------------------------------------
// Last reward (reward from last week)
// ---------------------------------------------------------------------------

export function getLastReward(childId: string): LastReward | null {
  const data = loadData()
  if (!data.lastReward || data.lastReward.childId !== childId) return null
  return data.lastReward
}

export function setLastReward(childId: string, title: string): void {
  const data = loadData()
  data.lastReward = { childId, title, date: new Date().toISOString().slice(0, 10) }
  saveData(data)
}

export function clearLastReward(): void {
  const data = loadData()
  data.lastReward = null
  saveData(data)
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

/**
 * Record a chore completion for today.
 * Returns false (and skips write) if the record already exists.
 */
export function addProgress(entry: Progress): boolean {
  const data = loadData()
  const dupe = data.progress.some(
    p => p.childId === entry.childId &&
         p.choreId === entry.choreId &&
         p.date    === entry.date
  )
  if (dupe) return false
  data.progress.push(entry)
  saveData(data)
  return true
}

// ---------------------------------------------------------------------------
// Export / Import
// ---------------------------------------------------------------------------

export function exportData(): void {
  const blob = new Blob([JSON.stringify(loadData(), null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'kiddoquest-backup.json' })
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = normalise(JSON.parse(e.target?.result as string))
        saveData(data)
        resolve()
      } catch {
        reject(new Error('Invalid backup file — could not parse JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}
