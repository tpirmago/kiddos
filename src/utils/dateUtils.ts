/** Today as "YYYY-MM-DD" */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Monday of the current week as "YYYY-MM-DD" */
export function currentWeekMonday(): string {
  const now = new Date()
  const day = now.getDay()                   // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().slice(0, 10)
}

/** All 7 date strings (Mon → Sun) for the current week */
export function currentWeekDates(): string[] {
  const monday = new Date(currentWeekMonday())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

/** ISO week number (1–53) */
export function weekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const WEEK_EMOJIS = ['⭐', '🍦', '🌸', '🍔', '🍟', '🍭', '🚗']

/** Emoji that rotates each week */
export function weekEmoji(): string {
  return WEEK_EMOJIS[weekNumber() % WEEK_EMOJIS.length]
}
