'use client'

import { useRef, useState } from 'react'
import { Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime, GameFrame, ResultScreen, Stat, StartScreen, starsFor, useCountdown } from '@/components/pal/game-kit'
import { arithmeticQuestion, type ChallengeQuestion } from '@/lib/pal/daily'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

const SECONDS = 60

export function MathSpeed() {
  const game = getGame('math-speed')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [q, setQ] = useState<ChallengeQuestion>(() => arithmeticQuestion(Math.random, 1))
  const [value, setValue] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [solved, setSolved] = useState(0)
  const [attempted, setAttempted] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [xp, setXp] = useState(0)
  const ref = useRef({ score: 0, solved: 0, attempted: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const tier = Math.min(3, 1 + Math.floor(streak / 4))

  function finish() {
    const { score: sc, solved: so, attempted: at } = ref.current
    const accuracy = at ? so / at : 0
    const earned = Math.min(game.maxXp, Math.round(sc / 3 + accuracy * 20))
    setXp(earned)
    pal.recordGame(game.slug, sc, so >= 5, earned, { mathSolved: so })
    setPhase('done')
  }

  const timer = useCountdown(SECONDS, phase === 'play', finish)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    const ok = value.trim() === q.answer
    ref.current.attempted += 1
    setAttempted(ref.current.attempted)
    if (ok) {
      const newStreak = streak + 1
      const pts = 10 * tier + Math.min(newStreak, 10)
      ref.current.score += pts
      ref.current.solved += 1
      setScore(ref.current.score)
      setSolved(ref.current.solved)
      setStreak(newStreak)
      setBestStreak((b) => Math.max(b, newStreak))
      setFlash('ok')
      setQ(arithmeticQuestion(Math.random, Math.min(3, 1 + Math.floor(newStreak / 4))))
    } else {
      setStreak(0)
      setFlash('bad')
      setQ(arithmeticQuestion(Math.random, 1))
    }
    setValue('')
    setTimeout(() => setFlash(null), 300)
    inputRef.current?.focus()
  }

  function restart() {
    ref.current = { score: 0, solved: 0, attempted: 0 }
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setSolved(0)
    setAttempted(0)
    setValue('')
    timer.reset()
    setQ(arithmeticQuestion(Math.random, 1))
    setPhase('start')
  }

  return (
    <GameFrame
      game={game}
      onRestart={phase === 'play' ? restart : undefined}
      stats={
        phase === 'play' && (
          <>
            <Stat icon="time" label="Time" value={formatTime(timer.left)} tone={timer.left <= 10 ? 'warn' : undefined} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && <StartScreen game={game} rules={[`Solve as many as you can in ${SECONDS} seconds.`, 'Type the answer and press Enter.', 'Every 4 correct in a row raises the difficulty — and the points.', 'A wrong answer resets your streak.']} onStart={() => setPhase('play')} />}

      {phase === 'play' && (
        <div className="mx-auto w-full max-w-xl rounded-3xl border bg-card p-6 sm:p-10">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full transition-[width] duration-1000 ease-linear', timer.left <= 10 ? 'bg-destructive' : 'bg-math')} style={{ width: `${(timer.left / SECONDS) * 100}%` }} />
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="rounded-full bg-math-soft px-2.5 py-0.5 font-semibold text-math">Difficulty {tier}</span>
            <span className={cn('flex items-center gap-1 font-semibold', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')}>
              <Flame className={cn('size-4', streak > 0 && 'fill-orange-500')} aria-hidden="true" /> {streak} streak
            </span>
          </div>
          <p
            className={cn(
              'mt-8 text-center font-mono text-5xl font-bold tabular-nums transition-colors sm:text-6xl',
              flash === 'ok' && 'text-bio',
              flash === 'bad' && 'text-destructive motion-safe:animate-[pal-shake_0.3s]',
            )}
            aria-live="polite"
          >
            {q.prompt.replace(' = ?', '')}
          </p>
          <form onSubmit={submit} className="mt-8 flex gap-2">
            <label htmlFor="speed-answer" className="sr-only">
              Answer
            </label>
            <input
              id="speed-answer"
              ref={inputRef}
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))}
              inputMode="numeric"
              autoComplete="off"
              className="h-16 flex-1 rounded-2xl border-2 bg-background px-5 text-center font-mono text-3xl outline-none focus-visible:border-math"
            />
            <Button type="submit" size="xl" className="h-16 px-8">
              Enter
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {solved} solved · {attempted ? Math.round((solved / attempted) * 100) : 100}% accuracy
          </p>
        </div>
      )}

      {phase === 'done' && (
        <ResultScreen
          title={solved >= 20 ? 'Lightning calculator!' : 'Time!'}
          score={score}
          xp={xp}
          stars={starsFor(Math.min(1, solved / 20))}
          onRestart={restart}
          details={`${solved} correct out of ${attempted} · best streak ${bestStreak} · ${attempted ? Math.round((solved / attempted) * 100) : 0}% accuracy`}
        />
      )}
    </GameFrame>
  )
}
