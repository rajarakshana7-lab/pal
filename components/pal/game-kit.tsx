'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock, Lightbulb, RotateCcw, Star, Trophy, XCircle, Zap } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GameMeta } from '@/lib/pal/games'
import { Confetti } from './celebrations'

export function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds)
  const endRef = useRef(onEnd)
  endRef.current = onEnd

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t)
          setTimeout(() => endRef.current(), 0)
          return 0
        }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  return { left, reset: (s = seconds) => setLeft(s), setLeft }
}

export function formatTime(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function GameFrame({ game, children, stats, onRestart }: { game: GameMeta; children: React.ReactNode; stats?: React.ReactNode; onRestart?: () => void }) {
  const tone = game.subject === 'biology' ? 'bg-bio-soft text-bio' : 'bg-math-soft text-math'
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/games" className={buttonVariants({ variant: 'outline', size: 'icon' })} aria-label="Back to games">
            <ArrowLeft />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', tone)}>
                {game.subject === 'biology' ? 'Biology' : 'Mathematics'}
              </span>
              <span className="text-xs text-muted-foreground">Up to {game.maxXp} XP</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{game.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats}
          {onRestart && (
            <Button variant="outline" onClick={onRestart}>
              <RotateCcw data-icon="inline-start" /> Restart
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export function Stat({ icon, label, value, tone }: { icon: 'score' | 'time' | 'level' | 'xp'; label: string; value: React.ReactNode; tone?: 'warn' }) {
  const Icon = { score: Star, time: Clock, level: Trophy, xp: Zap }[icon]
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border bg-card px-3 py-1.5', tone === 'warn' && 'border-destructive/40 bg-destructive/5 text-destructive')}>
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      <div className="leading-tight">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export function Feedback({ state, children }: { state: 'correct' | 'wrong' | 'hint' | null; children: React.ReactNode }) {
  if (!state) return null
  const styles = {
    correct: 'border-bio/30 bg-bio-soft text-foreground',
    wrong: 'border-destructive/30 bg-destructive/5 text-foreground',
    hint: 'border-xp/40 bg-xp-soft text-foreground',
  }[state]
  const Icon = { correct: CheckCircle2, wrong: XCircle, hint: Lightbulb }[state]
  const iconTone = { correct: 'text-bio', wrong: 'text-destructive', hint: 'text-xp' }[state]
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border p-3 text-sm motion-safe:animate-[pal-pop_0.25s_ease-out]', styles)} role="status">
      <Icon className={cn('mt-0.5 size-4 shrink-0', iconTone)} aria-hidden="true" />
      <div className="text-pretty">{children}</div>
    </div>
  )
}

export function ResultScreen({
  title,
  score,
  scoreLabel = 'Score',
  xp,
  stars,
  details,
  onRestart,
  extra,
}: {
  title: string
  score: React.ReactNode
  scoreLabel?: string
  xp: number
  stars: number
  details?: React.ReactNode
  onRestart: () => void
  extra?: React.ReactNode
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center">
      {stars >= 3 && <Confetti pieces={40} />}
      <div className="mx-auto flex w-fit gap-1" aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            className={cn('size-10 motion-safe:animate-[pal-pop_0.4s_ease-out_both]', i <= stars ? 'fill-xp text-xp' : 'text-muted')}
            style={{ animationDelay: `${i * 0.12}s` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <h2 className="mt-4 text-2xl font-bold text-balance">{title}</h2>
      <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{scoreLabel}</p>
          <p className="mt-1 font-mono text-2xl font-bold">{score}</p>
        </div>
        <div className="rounded-2xl bg-xp-soft p-4">
          <p className="text-xs uppercase tracking-wide text-xp-foreground">XP earned</p>
          <p className="mt-1 font-mono text-2xl font-bold text-xp-foreground">+{xp}</p>
        </div>
      </div>
      {details && <div className="mx-auto mt-4 max-w-md text-sm text-muted-foreground text-pretty">{details}</div>}
      {extra}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button size="xl" onClick={onRestart}>
          <RotateCcw data-icon="inline-start" /> Play again
        </Button>
        <Link href="/games" className={buttonVariants({ variant: 'outline', size: 'xl' })}>
          More games
        </Link>
      </div>
    </div>
  )
}

export function StartScreen({ game, rules, onStart, children }: { game: GameMeta; rules: string[]; onStart: () => void; children?: React.ReactNode }) {
  return (
    <div className="grid gap-6 rounded-3xl border bg-card p-6 sm:p-8 md:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="text-sm font-semibold text-primary">{game.tagline}</p>
        <p className="mt-2 text-muted-foreground text-pretty">{game.description}</p>
        <ul className="mt-5 flex flex-col gap-2.5">
          {rules.map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-bio" aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
        {children}
        <Button size="xl" className="mt-6" onClick={onStart}>
          Start game
        </Button>
      </div>
      <div className="flex flex-col justify-center gap-3 rounded-2xl bg-muted/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You will practise</p>
        <div className="flex flex-wrap gap-2">
          {game.skills.map((s) => (
            <span key={s} className="rounded-full border bg-card px-3 py-1 text-sm">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rewards</p>
        <p className="flex items-center gap-1.5 text-sm">
          <Zap className="size-4 fill-xp text-xp" aria-hidden="true" /> Up to {game.maxXp} XP · about {game.minutes} min
        </p>
      </div>
    </div>
  )
}

export function starsFor(pct: number) {
  return pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0
}
