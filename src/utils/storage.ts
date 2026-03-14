import type { AppData, Child, Chore, Reward, Progress, LastReward, RewardClaimedForWeek } from '../types/types'
import { currentWeekDates, currentWeekStart, getDayOfWeek, getMondayOfWeek, today } from './dateUtils'

const KEY = 'kiddos'

const EMPTY: AppData = {
  children: [],
  chores:   [],
  rewards:  [],
  progress: [],
  lastReward: null,
  rewardClaimedForWeek: [],
  weekStartDay: 1,
}

// ---------------------------------------------------------------------------
// Validation — coerce raw parsed JSON into a valid AppData shape,
// dropping any records that are missing required fields.
// ---------------------------------------------------------------------------

const VALID_HEROES = ['cat', 'dog', 'sloth', 'lion', 'leopard', 'zebra', 'panda', 'monkey'] as const

function isChild(v: unknown): v is Child {
  if (!v || typeof v !== 'object') return false
  const c = v as Record<string, unknown>
  if (
    typeof c.id !== 'string' ||
    typeof c.name !== 'string' ||
    !VALID_HEROES.includes(c.hero as (typeof VALID_HEROES)[number])
  ) return false
  return true
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
  const children: Child[] = Array.isArray(r.children)
    ? r.children.filter(isChild).map((c: Child) => {
        const weekStartDay = typeof c.weekStartDay === 'number' && c.weekStartDay >= 0 && c.weekStartDay <= 6
          ? c.weekStartDay
          : 1
        const firstWeekKey = typeof c.firstWeekKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.firstWeekKey)
          ? c.firstWeekKey
          : undefined
        return { ...c, weekStartDay, firstWeekKey }
      })
    : []
  const firstChildId = children[0]?.id ?? null

  // Parse chores: support legacy { id, title } by assigning to first child
  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
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
        const x = c as { id: string; childId?: string; title: string; daysOfWeek?: number[] }
        const days = Array.isArray(x.daysOfWeek) && x.daysOfWeek.length > 0
          ? x.daysOfWeek.filter(d => d >= 0 && d <= 6)
          : ALL_DAYS
        return {
          id: x.id,
          childId: x.childId ?? firstChildId!,
          title: x.title,
          daysOfWeek: days,
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

  const weekStartDay = typeof r.weekStartDay === 'number' && r.weekStartDay >= 0 && r.weekStartDay <= 6
    ? r.weekStartDay
    : 1

  let rewardClaimedForWeek: RewardClaimedForWeek[] = []
  if (Array.isArray(r.rewardClaimedForWeek)) {
    rewardClaimedForWeek = r.rewardClaimedForWeek
      .filter((x): x is RewardClaimedForWeek => {
        if (!x || typeof x !== 'object') return false
        const rc = x as Record<string, unknown>
        return typeof rc.childId === 'string' && typeof rc.weekKey === 'string'
      })
      .map(x => ({ childId: (x as RewardClaimedForWeek).childId, weekKey: (x as RewardClaimedForWeek).weekKey }))
  }

  return {
    children,
    chores,
    rewards,
    progress: Array.isArray(r.progress) ? r.progress.filter(isProgress) : [],
    lastReward,
    rewardClaimedForWeek,
    weekStartDay,
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

/** Create the kiddos key if it does not exist yet. */
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
  const weekStartDay = child.weekStartDay ?? 1
  const firstWeekKey = getMondayOfWeek(today())
  const c = { ...child, weekStartDay, firstWeekKey }
  data.children.push(c)
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

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export function addChore(childId: string, title: string, daysOfWeek?: number[]): void {
  const data = loadData()
  const days = Array.isArray(daysOfWeek) && daysOfWeek.length > 0
    ? daysOfWeek.filter(d => d >= 0 && d <= 6)
    : ALL_DAYS
  data.chores.push({ id: crypto.randomUUID(), childId, title, daysOfWeek: days })
  saveData(data)
}

/** Chores due on a specific date. dateStr "YYYY-MM-DD", dayOfWeek 0=Sun..6=Sat */
export function getChildChoresForDate(childId: string, dateStr: string): Chore[] {
  const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay()
  return loadData().chores.filter(c => {
    if (c.childId !== childId) return false
    const days = c.daysOfWeek ?? ALL_DAYS
    return days.includes(dayOfWeek)
  })
}

/** Get week start day for a child. 0=Sun, 1=Mon, ..., 6=Sat. Default 1 (Monday). */
export function getWeekStartDayForChild(childId: string): number {
  const data = loadData()
  const child = data.children.find(c => c.id === childId)
  const d = child?.weekStartDay ?? data.weekStartDay ?? 1
  return d >= 0 && d <= 6 ? d : 1
}

/** Set week start day for a child. If firstWeekKey not set, sets it to current week (first week with reduced days). */
export function setWeekStartDayForChild(childId: string, day: number): void {
  const data = loadData()
  const d = day >= 0 && day <= 6 ? day : 1
  const child = data.children.find(c => c.id === childId)
  if (child) {
    child.weekStartDay = d
    if (child.firstWeekKey == null) {
      child.firstWeekKey = getMondayOfWeek(today())
    }
    saveData(data)
  }
}

/** Days from weekStartDay to Sunday (first week only). Mon=7, Tue=6, Wed=5, Thu=4, Fri=3, Sat=2, Sun=1 */
function getFirstWeekDayCount(weekStartDay: number): number {
  return weekStartDay === 0 ? 1 : 8 - weekStartDay
}

/** Filter week dates to only include days from weekStartDay through Sunday (for first week) */
function filterFirstWeekDates(weekDates: string[], weekStartDay: number): string[] {
  if (weekStartDay === 0) return weekDates.filter(date => getDayOfWeek(date) === 0)
  return weekDates.filter(date => {
    const dow = getDayOfWeek(date)
    return dow >= weekStartDay || dow === 0
  })
}

/** True if today is in the same calendar week (Mon-Sun) as child's firstWeekKey */
function isChildInFirstWeek(child: Child | undefined): boolean {
  if (!child?.firstWeekKey) return false
  return getMondayOfWeek(today()) === getMondayOfWeek(child.firstWeekKey)
}

/** Stars = count of days in week where child completed all chores due on that date */
export function getStarsForChild(childId: string): number {
  const data = loadData()
  const weekStart = getWeekStartDayForChild(childId)
  const child = data.children.find(c => c.id === childId)
  const isFirstWeek = isChildInFirstWeek(child)
  // First week: use calendar week (Mon-Sun), filter to weekStartDay..Sunday
  const weekDates = isFirstWeek ? currentWeekDates(1) : currentWeekDates(weekStart)
  const datesToCount = isFirstWeek ? filterFirstWeekDates(weekDates, weekStart) : weekDates

  let stars = 0
  for (const date of datesToCount) {
    const choresDue = getChildChoresForDate(childId, date)
    if (choresDue.length === 0) continue
    const done = data.progress.filter(p => p.childId === childId && p.date === date).length
    if (done >= choresDue.length) stars++
  }
  return stars
}

/** Total days in week that have at least one chore for this child. First week: days from start day to Sunday. */
export function getTotalDaysForChild(childId: string): number {
  const weekStart = getWeekStartDayForChild(childId)
  const weekDates = currentWeekDates(weekStart)
  const data = loadData()
  const child = data.children.find(c => c.id === childId)
  const isFirstWeek = isChildInFirstWeek(child)

  if (isFirstWeek) {
    return getFirstWeekDayCount(weekStart)
  }
  return weekDates.filter(date => getChildChoresForDate(childId, date).length > 0).length
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

/** Mark that child claimed their reward for the current week. Call when user clicks "Reward received". */
export function setRewardClaimedForWeek(childId: string): void {
  const data = loadData()
  const weekKey = currentWeekStart(getWeekStartDayForChild(childId))
  const list = data.rewardClaimedForWeek ?? []
  const filtered = list.filter(rc => rc.childId !== childId || rc.weekKey !== weekKey)
  filtered.push({ childId, weekKey })
  data.rewardClaimedForWeek = filtered
  saveData(data)
}

/** True if child already claimed their reward for the current week. */
export function wasRewardClaimedThisWeek(childId: string): boolean {
  const data = loadData()
  const weekKey = currentWeekStart(getWeekStartDayForChild(childId))
  const list = data.rewardClaimedForWeek ?? []
  return list.some(rc => rc.childId === childId && rc.weekKey === weekKey)
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

/** Fill all 7 days of the current week with progress for testing the reward wheel. */
export function fillWeekForTesting(childId: string, weekDates: string[]): void {
  const data = loadData()
  for (const date of weekDates) {
    const choresDue = getChildChoresForDate(childId, date)
    for (const chore of choresDue) {
      const exists = data.progress.some(
        p => p.childId === childId && p.choreId === chore.id && p.date === date
      )
      if (!exists) {
        data.progress.push({ childId, choreId: chore.id, date })
      }
    }
  }
  saveData(data)
}

// ---------------------------------------------------------------------------
// Export / Import
// ---------------------------------------------------------------------------

export function exportData(): void {
  const blob = new Blob([JSON.stringify(loadData(), null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'kiddos-backup.json' })
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
