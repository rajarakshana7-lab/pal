export const LEVEL_TITLES = [
  'Curious Beginner',
  'Spark Seeker',
  'Explorer',
  'Problem Solver',
  'Lab Apprentice',
  'Scholar',
  'Theory Crafter',
  'Master Mind',
  'Grand Researcher',
  'PAL Legend',
]

export function xpForLevel(level: number) {
  return 100 + (level - 1) * 60
}

export function levelFromXp(xp: number) {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  const needed = xpForLevel(level)
  return {
    level,
    xpIntoLevel: remaining,
    xpForNext: needed,
    progress: remaining / needed,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
  }
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysBetween(a: string, b: string) {
  const ms = new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()
  return Math.round(ms / 86_400_000)
}

export function lastNDays(n: number) {
  const days: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push(todayKey(d))
  }
  return days
}
