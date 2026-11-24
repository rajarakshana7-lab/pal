'use client'

import { useSyncExternalStore } from 'react'
import { ACHIEVEMENTS, isUnlocked } from './achievements'
import { daysBetween, levelFromXp, todayKey } from './levels'

export type Subject = 'biology' | 'mathematics'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type GameStat = { plays: number; best: number; completions: number; lastPlayed?: string }

export type Diagnostic = {
  subject: Subject
  score: number
  total: number
  strengths: string[]
  weak: string[]
  path: string[]
  date: string
}

export type PalState = {
  version: 1
  name: string
  subject: Subject | null
  level: Difficulty | null
  onboarded: boolean
  diagnostics: Partial<Record<Subject, Diagnostic>>
  xp: number
  streak: number
  bestStreak: number
  lastActive: string | null
  activity: Record<string, number>
  completedLessons: string[]
  lessonScores: Record<string, number>
  mathSolved: number
  bioAnswered: number
  perfectQuizzes: number
  games: Record<string, GameStat>
  daily: Record<string, Record<string, number>>
  achievements: Record<string, string>
  explored3d: string[]
}

export type Celebration =
  | { id: number; kind: 'level'; level: number; title: string }
  | { id: number; kind: 'achievement'; achievementId: string }
  | { id: number; kind: 'xp'; amount: number; reason: string }

const STORAGE_KEY = 'pal-learner-v1'

export const INITIAL_STATE: PalState = {
  version: 1,
  name: '',
  subject: null,
  level: null,
  onboarded: false,
  diagnostics: {},
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActive: null,
  activity: {},
  completedLessons: [],
  lessonScores: {},
  mathSolved: 0,
  bioAnswered: 0,
  perfectQuizzes: 0,
  games: {},
  daily: {},
  achievements: {},
  explored3d: [],
}

let state: PalState = INITIAL_STATE
let loaded = false
let celebrations: Celebration[] = []
let celebrationId = 0
const listeners = new Set<() => void>()
const celebrationListeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) state = { ...INITIAL_STATE, ...JSON.parse(raw) }
  } catch {
    state = INITIAL_STATE
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode); progress stays in memory.
  }
}

function emit() {
  listeners.forEach((l) => l())
}

function pushCelebration(c: Omit<Celebration, 'id'>) {
  celebrations = [...celebrations, { ...c, id: ++celebrationId } as Celebration]
  celebrationListeners.forEach((l) => l())
}

export function dismissCelebration(id: number) {
  celebrations = celebrations.filter((c) => c.id !== id)
  celebrationListeners.forEach((l) => l())
}

function touchStreak(s: PalState): PalState {
  const today = todayKey()
  if (s.lastActive === today) return s
  const gap = s.lastActive ? daysBetween(s.lastActive, today) : null
  const streak = gap === 1 ? s.streak + 1 : 1
  return { ...s, streak, bestStreak: Math.max(s.bestStreak, streak), lastActive: today }
}

function update(mutator: (s: PalState) => PalState, xpReason?: string) {
  load()
  const before = state
  let next = mutator(touchStreak(before))

  for (const a of ACHIEVEMENTS) {
    if (!next.achievements[a.id] && isUnlocked(a, next)) {
      next = {
        ...next,
        achievements: { ...next.achievements, [a.id]: todayKey() },
        xp: next.xp + a.xp,
        activity: { ...next.activity, [todayKey()]: (next.activity[todayKey()] ?? 0) + a.xp },
      }
      pushCelebration({ kind: 'achievement', achievementId: a.id })
    }
  }

  const gained = next.xp - before.xp
  if (gained > 0 && xpReason) pushCelebration({ kind: 'xp', amount: gained, reason: xpReason })

  const oldLevel = levelFromXp(before.xp).level
  const newLevel = levelFromXp(next.xp)
  if (newLevel.level > oldLevel) {
    pushCelebration({ kind: 'level', level: newLevel.level, title: newLevel.title })
  }

  state = next
  persist()
  emit()
}

function addXp(s: PalState, amount: number): PalState {
  const key = todayKey()
  return { ...s, xp: s.xp + amount, activity: { ...s.activity, [key]: (s.activity[key] ?? 0) + amount } }
}

export const pal = {
  setProfile(partial: Partial<Pick<PalState, 'name' | 'subject' | 'level' | 'onboarded'>>) {
    load()
    state = { ...state, ...partial }
    persist()
    emit()
  },
  saveDiagnostic(d: Diagnostic, xp: number) {
    update((s) => addXp({ ...s, diagnostics: { ...s.diagnostics, [d.subject]: d }, onboarded: true }, xp), 'Diagnostic complete')
  },
  answer(subject: Subject, correct: boolean, xp = 0) {
    update((s) => {
      let n = s
      if (correct) n = subject === 'mathematics' ? { ...n, mathSolved: n.mathSolved + 1 } : { ...n, bioAnswered: n.bioAnswered + 1 }
      return xp > 0 ? addXp(n, xp) : n
    })
  },
  completeLesson(lessonId: string, scorePct: number, xp: number) {
    update((s) => {
      const first = !s.completedLessons.includes(lessonId)
      const n: PalState = {
        ...s,
        completedLessons: first ? [...s.completedLessons, lessonId] : s.completedLessons,
        lessonScores: { ...s.lessonScores, [lessonId]: Math.max(s.lessonScores[lessonId] ?? 0, scorePct) },
        perfectQuizzes: scorePct === 100 ? s.perfectQuizzes + 1 : s.perfectQuizzes,
      }
      return addXp(n, first ? xp : Math.round(xp / 3))
    }, 'Lesson complete')
  },
  recordGame(slug: string, score: number, completed: boolean, xp: number, extra?: { mathSolved?: number; bioAnswered?: number }) {
    update((s) => {
      const prev = s.games[slug] ?? { plays: 0, best: 0, completions: 0 }
      const n: PalState = {
        ...s,
        mathSolved: s.mathSolved + (extra?.mathSolved ?? 0),
        bioAnswered: s.bioAnswered + (extra?.bioAnswered ?? 0),
        games: {
          ...s.games,
          [slug]: {
            plays: prev.plays + 1,
            best: Math.max(prev.best, score),
            completions: prev.completions + (completed ? 1 : 0),
            lastPlayed: todayKey(),
          },
        },
      }
      return addXp(n, xp)
    }, 'Game reward')
  },
  recordDaily(challengeId: string, score: number, xp: number, extra?: { mathSolved?: number; bioAnswered?: number }) {
    update((s) => {
      const key = todayKey()
      const day = s.daily[key] ?? {}
      const first = day[challengeId] === undefined
      const n: PalState = {
        ...s,
        mathSolved: s.mathSolved + (extra?.mathSolved ?? 0),
        bioAnswered: s.bioAnswered + (extra?.bioAnswered ?? 0),
        daily: { ...s.daily, [key]: { ...day, [challengeId]: Math.max(day[challengeId] ?? 0, score) } },
      }
      return addXp(n, first ? xp : 0)
    }, 'Daily challenge')
  },
  explore3d(organelleId: string) {
    if (state.explored3d.includes(organelleId)) return
    update((s) => addXp({ ...s, explored3d: [...s.explored3d, organelleId] }, 10), 'New organelle discovered')
  },
  loadDemo() {
    const days = 9
    const activity: Record<string, number> = {}
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      activity[todayKey(d)] = [60, 85, 40, 120, 95, 70, 140, 55, 110][i % 9]
    }
    state = {
      ...state,
      name: state.name || 'Aanya',
      subject: state.subject ?? 'biology',
      level: state.level ?? 'intermediate',
      onboarded: true,
      xp: 1240,
      streak: 6,
      bestStreak: 6,
      lastActive: todayKey(),
      activity,
      completedLessons: ['bio-cell-1', 'bio-cell-2', 'bio-plant-1', 'math-arith-1', 'math-arith-2', 'math-num-1', 'math-alg-1'],
      lessonScores: { 'bio-cell-1': 100, 'bio-cell-2': 67, 'bio-plant-1': 100, 'math-arith-1': 100, 'math-arith-2': 67, 'math-num-1': 67, 'math-alg-1': 100 },
      mathSolved: 38,
      bioAnswered: 24,
      perfectQuizzes: 4,
      games: {
        'cell-builder': { plays: 3, best: 90, completions: 2 },
        'math-speed': { plays: 4, best: 210, completions: 3 },
        'equation-escape': { plays: 2, best: 6, completions: 1 },
      },
      achievements: { 'first-steps': todayKey(), 'perfect-score': todayKey(), 'rising-star': todayKey() },
    }
    persist()
    emit()
  },
  reset() {
    state = INITIAL_STATE
    persist()
    emit()
  },
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return state
}

function getServerSnapshot() {
  return INITIAL_STATE
}

export function usePal() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

const noopSubscribe = () => () => {}
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

const NO_CELEBRATIONS: Celebration[] = []
export function useCelebrations() {
  return useSyncExternalStore(
    (l) => {
      celebrationListeners.add(l)
      return () => celebrationListeners.delete(l)
    },
    () => celebrations,
    () => NO_CELEBRATIONS,
  )
}
