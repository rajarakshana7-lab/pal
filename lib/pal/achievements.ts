import type { PalState } from './store'
import { levelFromXp } from './levels'

export type Achievement = {
  id: string
  title: string
  description: string
  icon: 'footprints' | 'leaf' | 'calculator' | 'target' | 'flame' | 'trophy' | 'zap' | 'star' | 'globe' | 'key'
  tone: 'bio' | 'math' | 'xp' | 'primary'
  xp: number
  progress: (s: PalState) => { current: number; target: number }
}

function countSubjectLessons(s: PalState, prefix: 'bio' | 'math') {
  return s.completedLessons.filter((id) => id.startsWith(prefix)).length
}

function totalGameCompletions(s: PalState) {
  return Object.values(s.games).reduce((sum, g) => sum + g.completions, 0)
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first lesson.',
    icon: 'footprints',
    tone: 'primary',
    xp: 25,
    progress: (s) => ({ current: s.completedLessons.length, target: 1 }),
  },
  {
    id: 'biology-explorer',
    title: 'Biology Explorer',
    description: 'Complete 5 Biology lessons.',
    icon: 'leaf',
    tone: 'bio',
    xp: 75,
    progress: (s) => ({ current: countSubjectLessons(s, 'bio'), target: 5 }),
  },
  {
    id: 'math-master',
    title: 'Math Master',
    description: 'Solve 50 Mathematics problems correctly.',
    icon: 'calculator',
    tone: 'math',
    xp: 100,
    progress: (s) => ({ current: s.mathSolved, target: 50 }),
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get 100% in a lesson quiz.',
    icon: 'target',
    tone: 'xp',
    xp: 50,
    progress: (s) => ({ current: s.perfectQuizzes, target: 1 }),
  },
  {
    id: 'consistency-champion',
    title: 'Consistency Champion',
    description: 'Maintain a 7-day learning streak.',
    icon: 'flame',
    tone: 'xp',
    xp: 120,
    progress: (s) => ({ current: s.bestStreak, target: 7 }),
  },
  {
    id: 'game-champion',
    title: 'Game Champion',
    description: 'Complete 10 mini-games.',
    icon: 'trophy',
    tone: 'primary',
    xp: 100,
    progress: (s) => ({ current: totalGameCompletions(s), target: 10 }),
  },
  {
    id: 'daily-hero',
    title: 'Daily Hero',
    description: 'Finish all 5 daily challenges in one day.',
    icon: 'zap',
    tone: 'xp',
    xp: 80,
    progress: (s) => ({
      current: Math.max(0, ...Object.values(s.daily).map((d) => Object.keys(d).length)),
      target: 5,
    }),
  },
  {
    id: 'rising-star',
    title: 'Rising Star',
    description: 'Reach level 5.',
    icon: 'star',
    tone: 'primary',
    xp: 0,
    progress: (s) => ({ current: levelFromXp(s.xp).level, target: 5 }),
  },
  {
    id: 'cell-voyager',
    title: 'Cell Voyager',
    description: 'Discover every organelle in the 3D Biology Explorer.',
    icon: 'globe',
    tone: 'bio',
    xp: 60,
    progress: (s) => ({ current: s.explored3d.length, target: 7 }),
  },
  {
    id: 'escape-artist',
    title: 'Escape Artist',
    description: 'Escape all rooms in the Math Escape Room.',
    icon: 'key',
    tone: 'math',
    xp: 80,
    progress: (s) => ({ current: s.games['escape-room']?.completions ? 1 : 0, target: 1 }),
  },
]

export function isUnlocked(a: Achievement, s: PalState) {
  const p = a.progress(s)
  return p.current >= p.target
}
