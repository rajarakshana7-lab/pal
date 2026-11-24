'use client'

import { useRef, useState } from 'react'
import { ArrowRight, DoorClosed, DoorOpen, KeyRound, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, formatTime, GameFrame, ResultScreen, Stat, StartScreen, starsFor, useCountdown } from '@/components/pal/game-kit'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Puzzle = { q: string; answer: number; hint: string }
type Room = { name: string; story: string; puzzles: Puzzle[] }

const ROOMS: Room[] = [
  {
    name: 'The Laboratory',
    story: 'The lab door has a 3-digit lock. Each solved puzzle reveals one key — its last digit is part of the code.',
    puzzles: [
      { q: 'A beaker holds 250 ml. You pour in 3 more beakers. Total ml?', answer: 1000, hint: '250 × 4' },
      { q: '15% of 80 = ?', answer: 12, hint: '10% is 8, 5% is 4' },
      { q: '7 × 8 − 9 = ?', answer: 47, hint: 'Multiply first: 56 − 9' },
    ],
  },
  {
    name: 'The Vault',
    story: 'Steel walls. The vault code is hidden in algebra. Collect all three keys to open it.',
    puzzles: [
      { q: 'Solve: 3x + 5 = 29', answer: 8, hint: 'Subtract 5, then divide by 3' },
      { q: 'If y = 2x² and x = 3, y = ?', answer: 18, hint: 'Square first: 3² = 9' },
      { q: 'Solve: 5(x − 2) = 35', answer: 9, hint: 'Divide by 5 first: x − 2 = 7' },
    ],
  },
  {
    name: 'The Observatory',
    story: 'The final door to freedom. Geometry and patterns guard the exit.',
    puzzles: [
      { q: 'A triangle has angles 47° and 68°. Third angle?', answer: 65, hint: '180 − 47 − 68' },
      { q: 'Next in sequence: 3, 7, 15, 31, ?', answer: 63, hint: 'Double and add 1' },
      { q: 'Area of a rectangle 12 by 7 = ?', answer: 84, hint: 'Length × width' },
    ],
  },
]

const TOTAL_SECONDS = 360

export function EscapeRoom() {
  const game = getGame('escape-room')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [room, setRoom] = useState(0)
  const [solved, setSolved] = useState<number[]>([])
  const [active, setActive] = useState<number | null>(0)
  const [value, setValue] = useState('')
  const [code, setCode] = useState('')
  const [hints, setHints] = useState<number[]>([])
  const [escaped, setEscaped] = useState(0)
  const [score, setScore] = useState(0)
  const [doorOpen, setDoorOpen] = useState(false)
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong' | 'hint'; text: string } | null>(null)
  const [xp, setXp] = useState(0)
  const ref = useRef({ score: 0, escaped: 0 })

  const R = ROOMS[room]
  const doorCode = R.puzzles.map((p) => String(p.answer % 10)).join('')

  function finish() {
    const { score: sc, escaped: es } = ref.current
    const earned = Math.min(game.maxXp, es * 40 + (es === ROOMS.length ? Math.round(timer.left / 12) : 0))
    setXp(earned)
    pal.recordGame(game.slug, sc, es === ROOMS.length, earned, { mathSolved: es * 3 })
    setPhase('done')
  }

  const timer = useCountdown(TOTAL_SECONDS, phase === 'play', finish)

  function solve(e: React.FormEvent) {
    e.preventDefault()
    if (active === null || !value.trim()) return
    const p = R.puzzles[active]
    if (Number(value) === p.answer) {
      const pts = hints.includes(active) ? 10 : 20
      ref.current.score += pts
      setScore(ref.current.score)
      const ns = [...solved, active]
      setSolved(ns)
      setFb({ state: 'correct', text: `Key ${active + 1} found! It shows the digit ${p.answer % 10}. +${pts}` })
      pal.answer('mathematics', true, 0)
      const nextIdx = R.puzzles.findIndex((_, i) => !ns.includes(i))
      setActive(nextIdx === -1 ? null : nextIdx)
    } else {
      setFb({ state: 'wrong', text: 'The key slot rejects that answer. Try again.' })
    }
    setValue('')
  }

  function tryDoor(e: React.FormEvent) {
    e.preventDefault()
    if (code === doorCode) {
      ref.current.escaped += 1
      ref.current.score += 30
      setEscaped(ref.current.escaped)
      setScore(ref.current.score)
      setDoorOpen(true)
      setFb({ state: 'correct', text: `The door swings open! ${R.name} escaped. +30` })
    } else {
      setFb({ state: 'wrong', text: 'Wrong code. Hint: use the key digits in order — key 1, key 2, key 3.' })
      setCode('')
    }
  }

  function nextRoom() {
    if (room + 1 >= ROOMS.length) return finish()
    setRoom(room + 1)
    setSolved([])
    setActive(0)
    setCode('')
    setHints([])
    setDoorOpen(false)
    setFb(null)
  }

  function restart() {
    ref.current = { score: 0, escaped: 0 }
    setRoom(0)
    setSolved([])
    setActive(0)
    setValue('')
    setCode('')
    setHints([])
    setEscaped(0)
    setScore(0)
    setDoorOpen(false)
    setFb(null)
    timer.reset()
    setPhase('start')
  }

  return (
    <GameFrame
      game={game}
      onRestart={phase === 'play' ? restart : undefined}
      stats={
        phase === 'play' && (
          <>
            <Stat icon="time" label="Time" value={formatTime(timer.left)} tone={timer.left <= 30 ? 'warn' : undefined} />
            <Stat icon="level" label="Room" value={`${room + 1}/${ROOMS.length}`} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && <StartScreen game={game} rules={['Escape three rooms in 6 minutes.', 'Solve each puzzle to collect a key. The last digit of each answer is printed on the key.', 'Enter the 3-digit door code to unlock the door.', 'Bonus XP for time remaining when you escape all rooms.']} onStart={() => setPhase('play')} />}

      {phase === 'play' && (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-ink p-6 text-white">
              <p className="text-xs uppercase tracking-wider text-xp">Room {room + 1}</p>
              <h2 className="mt-1 text-2xl font-bold">{R.name}</h2>
              <p className="mt-2 text-sm text-white/70 text-pretty">{R.story}</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {R.puzzles.map((p, i) => {
                  const done = solved.includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !done && (setActive(i), setFb(null))}
                      className={cn('flex flex-col items-center gap-1 rounded-2xl border p-3 text-sm transition-colors', done ? 'border-xp/50 bg-xp/15 text-xp' : active === i ? 'border-white/60 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10')}
                    >
                      {done ? <KeyRound className="size-6" aria-hidden="true" /> : <Lock className="size-6 text-white/50" aria-hidden="true" />}
                      <span className="font-semibold">{done ? `Key ${i + 1}: ${p.answer % 10}` : `Puzzle ${i + 1}`}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {active !== null && !doorOpen && (
              <div className="rounded-3xl border bg-card p-6">
                <p className="text-sm font-semibold text-muted-foreground">Puzzle {active + 1}</p>
                <p className="mt-2 text-xl font-semibold text-balance">{R.puzzles[active].q}</p>
                <form onSubmit={solve} className="mt-5 flex gap-2">
                  <label htmlFor="escape-answer" className="sr-only">
                    Answer
                  </label>
                  <input id="escape-answer" autoFocus value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))} inputMode="numeric" autoComplete="off" className="h-14 flex-1 rounded-xl border-2 bg-background px-4 font-mono text-2xl outline-none focus-visible:border-math" />
                  <Button type="submit" size="xl" className="h-14">
                    Solve
                  </Button>
                </form>
                <Button
                  variant="ghost"
                  className="mt-3"
                  disabled={hints.includes(active)}
                  onClick={() => {
                    setHints([...hints, active])
                    setFb({ state: 'hint', text: R.puzzles[active].hint })
                  }}
                >
                  Hint (−10)
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className={cn('flex flex-col items-center rounded-3xl border-4 bg-card p-6 text-center transition-colors duration-700', doorOpen ? 'border-bio' : 'border-ink')}>
              {doorOpen ? <DoorOpen className="size-16 text-bio" aria-hidden="true" /> : <DoorClosed className="size-16 text-ink" aria-hidden="true" />}
              <p className="mt-3 font-semibold">{doorOpen ? 'Door unlocked!' : 'Locked door'}</p>
              <p className="text-sm text-muted-foreground">
                Keys collected: {solved.length}/{R.puzzles.length}
              </p>
              {!doorOpen && (
                <form onSubmit={tryDoor} className="mt-4 flex w-full max-w-xs gap-2">
                  <label htmlFor="door-code" className="sr-only">
                    Door code
                  </label>
                  <input id="door-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 3))} disabled={solved.length < 3} placeholder="• • •" inputMode="numeric" autoComplete="off" className="h-14 w-full rounded-xl border-2 bg-background text-center font-mono text-2xl tracking-[0.5em] outline-none focus-visible:border-math disabled:opacity-50" />
                  <Button type="submit" size="xl" className="h-14" disabled={code.length < 3}>
                    Open
                  </Button>
                </form>
              )}
              {doorOpen && (
                <Button size="xl" className="mt-4" onClick={nextRoom}>
                  {room + 1 < ROOMS.length ? 'Enter next room' : 'Escape!'} <ArrowRight data-icon="inline-end" />
                </Button>
              )}
            </div>
            <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
            <div className="rounded-3xl border bg-card p-5">
              <p className="text-sm font-semibold">Mission progress</p>
              <ol className="mt-3 flex flex-col gap-2">
                {ROOMS.map((rm, i) => (
                  <li key={rm.name} className={cn('flex items-center gap-2 text-sm', i < escaped ? 'text-bio' : i === room ? 'font-semibold' : 'text-muted-foreground')}>
                    {i < escaped ? <DoorOpen className="size-4" aria-hidden="true" /> : <DoorClosed className="size-4" aria-hidden="true" />}
                    {rm.name}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && <ResultScreen title={escaped === ROOMS.length ? 'Mission complete — you escaped!' : `Trapped in room ${escaped + 1}`} score={score} xp={xp} stars={starsFor(escaped / ROOMS.length)} onRestart={restart} details={escaped === ROOMS.length ? `Escaped with ${formatTime(timer.left)} left on the clock.` : 'Try again — hints can help when you are stuck.'} />}
    </GameFrame>
  )
}
