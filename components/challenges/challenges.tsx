'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock, Lock, Play, Timer, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/pal/app-shell'
import { Feedback, formatTime, ResultScreen, Stat, starsFor, useCountdown } from '@/components/pal/game-kit'
import { dailyChallenges, type DailyChallenge } from '@/lib/pal/daily'
import { levelFromXp, todayKey } from '@/lib/pal/levels'
import { pal, useHydrated, usePal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

function useMidnightCountdown() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const secs = Math.floor((midnight.getTime() - now.getTime()) / 1000)
  const { left } = useCountdown(secs, true, () => {})
  const h = Math.floor(left / 3600)
  const m = Math.floor((left % 3600) / 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export function Challenges() {
  const s = usePal()
  const hydrated = useHydrated()
  const router = useRouter()
  const params = useSearchParams()
  const today = todayKey()
  const level = levelFromXp(s.xp).level
  const list = useMemo(() => dailyChallenges(today, level), [today, level])
  const playing = list.find((c) => c.id === params.get('play'))
  const done = s.daily[today] ?? {}
  const resetIn = useMidnightCountdown()

  if (playing) return <ChallengeRun key={playing.id} challenge={playing} onExit={() => router.replace('/challenges', { scroll: false })} />

  const count = Object.keys(done).length
  return (
    <div>
      <PageHeader
        eyebrow="Daily Challenges"
        title="Beat today's five challenges"
        description="Fresh challenges every day. Difficulty rises with your level — finish all five for the Daily Hero badge."
        actions={
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm">
            <Clock className="size-4 text-muted-foreground" aria-hidden="true" /> New set in <span className="font-mono font-semibold">{resetIn}</span>
          </div>
        }
      />
      <div className="mb-5 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold">{"Today's progress"}</p>
          <p className="font-mono text-muted-foreground">{hydrated ? count : 0}/5</p>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {list.map((c) => (
            <span key={c.id} className={cn('h-2 rounded-full', hydrated && c.id in done ? 'bg-bio' : 'bg-muted')} />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Difficulty tier {list[0]?.tier} of 3 · level {level}
          {list[0]?.tier < 3 ? ` · reach level ${list[0].tier * 3 + 1} for tier ${list[0].tier + 1}` : ''}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const score = hydrated ? done[c.id] : undefined
          const finished = score !== undefined
          return (
            <article key={c.id} className="flex flex-col rounded-3xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                    c.subject === 'biology' ? 'bg-bio-soft text-bio' : c.subject === 'mathematics' ? 'bg-math-soft text-math' : 'bg-xp-soft text-xp-foreground',
                  )}
                >
                  {c.subject === 'mixed' ? 'Mixed' : c.subject === 'biology' ? 'Biology' : 'Maths'}
                </span>
                <span className="flex gap-0.5" aria-label={`Difficulty ${c.tier} of 3`}>
                  {[1, 2, 3].map((t) => (
                    <span key={t} className={cn('h-3 w-1.5 rounded-sm', t <= c.tier ? 'bg-ink' : 'bg-muted')} />
                  ))}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Timer className="size-3.5" aria-hidden="true" /> {formatTime(c.seconds)}
                </span>
                <span className="flex items-center gap-1 font-semibold text-xp-foreground">
                  <Zap className="size-3.5 fill-xp text-xp" aria-hidden="true" /> {c.xp} XP
                </span>
                <span>{c.questions.length} questions</span>
              </div>
              {finished ? (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-bio-soft px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="size-4 text-bio" aria-hidden="true" /> Completed
                  </span>
                  <span className="font-mono">
                    {score}/{c.questions.length}
                  </span>
                </div>
              ) : (
                <Button size="xl" className="mt-4" onClick={() => router.replace(`/challenges?play=${c.id}`, { scroll: false })}>
                  <Play data-icon="inline-start" /> Start
                </Button>
              )}
            </article>
          )
        })}
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4" aria-hidden="true" /> Each challenge awards XP once per day. Replays are for practice.
      </p>
    </div>
  )
}

function ChallengeRun({ challenge, onExit }: { challenge: DailyChallenge; onExit: () => void }) {
  const s = usePal()
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready')
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [typed, setTyped] = useState('')
  const [fb, setFb] = useState<{ ok: boolean; answer: string } | null>(null)
  const [xp, setXp] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scoreRef = useRef(0)
  const alreadyDone = challenge.id in (s.daily[todayKey()] ?? {})

  function finish(finalScore: number) {
    setPhase('done')
    const pct = finalScore / challenge.questions.length
    const earned = alreadyDone ? 0 : Math.round(challenge.xp * pct) + (pct === 1 ? Math.round(timer.left / 2) : 0)
    setXp(earned)
    const mathQ = challenge.questions.filter((q) => q.subject === 'mathematics').length
    pal.recordDaily(challenge.id, finalScore, earned, {
      mathSolved: Math.round(finalScore * (mathQ / challenge.questions.length)),
      bioAnswered: challenge.questions.length - mathQ,
    })
  }

  const timer = useCountdown(challenge.seconds, phase === 'play', () => finish(scoreRef.current))
  const q = challenge.questions[i]

  function submit(value: string) {
    if (fb || phase !== 'play') return
    const ok = value.trim().toLowerCase() === q.answer.toLowerCase()
    if (ok) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
    setFb({ ok, answer: q.answer })
    setTimeout(
      () => {
        setFb(null)
        setTyped('')
        if (i + 1 < challenge.questions.length) {
          setI(i + 1)
          setTimeout(() => inputRef.current?.focus(), 0)
        } else finish(scoreRef.current)
      },
      ok ? 450 : 1100,
    )
  }

  function restart() {
    scoreRef.current = 0
    setScore(0)
    setI(0)
    setFb(null)
    setTyped('')
    timer.reset()
    setPhase('ready')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onExit} aria-label="Back to challenges">
            <ArrowLeft />
          </Button>
          <div>
            <p className="text-xs text-muted-foreground">Daily Challenge · Tier {challenge.tier}</p>
            <h1 className="text-xl font-bold tracking-tight">{challenge.title}</h1>
          </div>
        </div>
        {phase === 'play' && (
          <div className="flex gap-2">
            <Stat icon="time" label="Time" value={formatTime(timer.left)} tone={timer.left <= 10 ? 'warn' : undefined} />
            <Stat icon="score" label="Score" value={`${score}/${challenge.questions.length}`} />
          </div>
        )}
      </div>

      {phase === 'ready' && (
        <div className="rounded-3xl border bg-card p-8 text-center">
          <Timer className="mx-auto size-10 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold">{challenge.description}</h2>
          <p className="mt-2 text-muted-foreground">
            {challenge.questions.length} questions · {formatTime(challenge.seconds)} on the clock · {alreadyDone ? 'practice mode (XP already claimed today)' : `up to ${challenge.xp} XP + speed bonus`}
          </p>
          <Button size="xl" className="mt-6" onClick={() => setPhase('play')} autoFocus>
            <Play data-icon="inline-start" /> Start the clock
          </Button>
        </div>
      )}

      {phase === 'play' && q && (
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full transition-[width] duration-1000 ease-linear', timer.left <= 10 ? 'bg-destructive' : 'bg-primary')} style={{ width: `${(timer.left / challenge.seconds) * 100}%` }} />
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Question {i + 1} of {challenge.questions.length}
          </p>
          <h2 className={cn('mt-2 text-balance font-bold', q.options ? 'text-xl sm:text-2xl' : 'font-mono text-4xl sm:text-5xl')}>{q.prompt}</h2>
          {q.options ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!!fb}
                  onClick={() => submit(opt)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-3.5 text-left font-medium transition-colors',
                    fb && opt === q.answer ? 'border-bio bg-bio-soft' : 'border-border hover:border-primary/40 hover:bg-accent',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <form
              className="mt-6 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (typed.trim()) submit(typed)
              }}
            >
              <label htmlFor="challenge-answer" className="sr-only">
                Your answer
              </label>
              <input
                id="challenge-answer"
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                disabled={!!fb}
                className="h-14 flex-1 rounded-xl border-2 bg-background px-4 font-mono text-2xl outline-none focus-visible:border-primary"
              />
              <Button type="submit" size="xl" className="h-14 px-6" disabled={!!fb}>
                Enter
              </Button>
            </form>
          )}
          <div className="mt-4 min-h-12">
            {fb && <Feedback state={fb.ok ? 'correct' : 'wrong'}>{fb.ok ? 'Correct!' : `The answer was ${fb.answer}.`}</Feedback>}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <ResultScreen
          title={score === challenge.questions.length ? 'Flawless challenge!' : timer.left === 0 ? "Time's up!" : 'Challenge complete!'}
          score={`${score}/${challenge.questions.length}`}
          xp={xp}
          stars={starsFor(score / challenge.questions.length)}
          onRestart={restart}
          details={alreadyDone && xp === 0 ? 'Practice run — XP for this challenge was already claimed today.' : score === challenge.questions.length ? 'Perfect score! Speed bonus added for time remaining.' : undefined}
          extra={
            <Button variant="link" className="mt-3" onClick={onExit}>
              Back to all challenges
            </Button>
          }
        />
      )}
    </div>
  )
}
