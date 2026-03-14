export type HeroType = 'cat' | 'dog' | 'sloth' | 'lion' | 'leopard' | 'zebra' | 'panda' | 'monkey'

export interface Child {
  id: string
  name: string
  hero: HeroType
}

export interface Chore {
  id: string
  childId: string
  title: string
}

export interface Reward {
  id: string
  childId: string
  title: string
}

export interface Progress {
  childId: string
  choreId: string
  date: string   // "YYYY-MM-DD"
}

export interface LastReward {
  childId: string
  title: string
  date: string   // "YYYY-MM-DD"
}

export interface AppData {
  children: Child[]
  chores:   Chore[]
  rewards:  Reward[]
  progress: Progress[]
  lastReward?: LastReward | null
}
