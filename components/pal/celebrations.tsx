'use client'

import { useEffect } from 'react'
import { Sparkles, X, Zap } from 'lucide-react'
import { ACHIEVEMENTS } from '@/lib/pal/achievements'
import { dismissCelebration, useCelebrations, type Celebration } from '@/lib/pal/store'
import { Button } from '@/components/ui/button'
import { AchievementIcon } from './achievement-badge'

const CONFETTI_COLORS = ['var(--xp)', 'var(--bio)', 'var(--math)', '#f472b6', '#f97316']

export function Confetti({ pieces = 60 }: { pieces?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden" aria-hidden="true">
      {Array.from({ length: pieces }).map((_, i) => {
        const left = (i * 37) % 100
        const delay = (i % 12) * 0.08
        const duration = 1.8 + ((i * 7) % 10) / 10
        return (
          <span
            key={i}
            className="absolute -top-4 block h-3 w-2 rounded-sm"
            style={{
              left: `${left}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `pal-confetti ${duration}s ${delay}s ease-in forwards`,
            }}
          />
        )
      })}
    </div>
  )
}

function Toast({ c }: { c: Celebration }) {
  useEffect(() => {
    if (c.kind === 'level') return
    const t = setTimeout(() => dismissCelebration(c.id), c.kind === 'xp' ? 2200 : 4200)
    return () => clearTimeout(t)
  }, [c])

  if (c.kind === 'xp') {
    return (
      <div className="flex items-center gap-2 rounded-full border border-xp/40 bg-card px-4 py-2 text-sm font-semibold shadow-lg motion-safe:animate-[pal-pop_0.35s_ease-out]">
        <Zap className="size-4 fill-xp text-xp" aria-hidden="true" />
        <span>+{c.amount} XP</span>
        <span className="font-normal text-muted-foreground">{c.reason}</span>
      </div>
    )
  }
  if (c.kind === 'achievement') {
    const a = ACHIEVEMENTS.find((x) => x.id === c.achievementId)
    if (!a) return null
    return (
      <div className="flex w-80 items-center gap-3 rounded-2xl border bg-card p-3 pr-2 shadow-xl motion-safe:animate-[pal-pop_0.4s_ease-out]">
        <AchievementIcon achievement={a} unlocked />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-xp-foreground">Badge unlocked</p>
          <p className="truncate font-semibold">{a.title}</p>
          <p className="truncate text-xs text-muted-foreground">{a.description}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => dismissCelebration(c.id)} aria-label="Dismiss">
          <X />
        </Button>
      </div>
    )
  }
  return null
}

export function Celebrations() {
  const items = useCelebrations()
  const level = items.find((c) => c.kind === 'level') as Extract<Celebration, { kind: 'level' }> | undefined
  const toasts = items.filter((c) => c.kind !== 'level')

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.slice(-3).map((c) => (
          <div key={c.id} className="pointer-events-auto">
            <Toast c={c} />
          </div>
        ))}
      </div>
      {level && (
        <>
          <Confetti />
          <div className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="level-up-title">
            <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-2xl motion-safe:animate-[pal-pop_0.45s_ease-out]">
              <div className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-ink font-mono text-4xl font-bold text-white ring-4 ring-xp ring-offset-4 ring-offset-card">
                {level.level}
              </div>
              <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-xp-foreground">
                <Sparkles className="size-4 text-xp" aria-hidden="true" /> Level up
              </p>
              <h2 id="level-up-title" className="mt-1 text-2xl font-bold text-balance">
                You are now a {level.title}!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">New learning worlds and harder challenges are now open to you.</p>
              <Button size="xl" className="mt-6 w-full" onClick={() => dismissCelebration(level.id)} autoFocus>
                Keep going
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
