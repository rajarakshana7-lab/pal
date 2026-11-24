'use client'

import { useState } from 'react'
import { DoorClosed, DoorOpen, Heart, Lightbulb, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, GameFrame, ResultScreen, Stat, StartScreen, starsFor } from '@/components/pal/game-kit'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Eq = { text: string; answer: number; hint: string; steps: string }
const STAGES = 10
const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a

function makeEquation(stage: number): Eq {
  const x = r(stage >= 7 ? -6 : 1, 12) || 3
  if (stage <= 2) {
    const a = r(2, 20)
    return { text: `x + ${a} = ${x + a}`, answer: x, hint: `Subtract ${a} from both sides.`, steps: `x = ${x + a} − ${a} = ${x}` }
  }
  if (stage <= 4) {
    const a = r(2, 9)
    return { text: `${a}x = ${a * x}`, answer: x, hint: `Divide both sides by ${a}.`, steps: `x = ${a * x} ÷ ${a} = ${x}` }
  }
  if (stage <= 6) {
    const a = r(2, 7)
    const b = r(1, 15)
    return { text: `${a}x + ${b} = ${a * x + b}`, answer: x, hint: `First subtract ${b}, then divide by ${a}.`, steps: `${a}x = ${a * x} → x = ${x}` }
  }
  if (stage <= 8) {
    const a = r(4, 9)
    const c = r(1, a - 1)
    const b = r(1, 12)
    const d = (a - c) * x + b
    const fmt = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`)
    return { text: `${a}x ${fmt(b)} = ${c}x ${fmt(d)}`.replace('+ 0', ''), answer: x, hint: `Move x terms to one side: subtract ${c}x from both sides.`, steps: `${a - c}x = ${d - b} → x = ${x}` }
  }
  const p = r(1, 9)
  const q = r(1, 9)
  const big = Math.max(p, q)
  if (stage === 9) return { text: `x² = ${big * big}  (x > 0)`, answer: big, hint: 'Take the square root of both sides.', steps: `x = √${big * big} = ${big}` }
  return { text: `x² − ${p + q}x + ${p * q} = 0  (larger root)`, answer: big, hint: `Find two numbers that multiply to ${p * q} and add to ${p + q}.`, steps: `(x − ${p})(x − ${q}) = 0 → x = ${p} or ${q}` }
}

export function EquationEscape() {
  const game = getGame('equation-escape')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [stage, setStage] = useState(1)
  const [eq, setEq] = useState<Eq>(() => makeEquation(1))
  const [value, setValue] = useState('')
  const [lives, setLives] = useState(3)
  const [hint, setHint] = useState(false)
  const [score, setScore] = useState(0)
  const [opening, setOpening] = useState(false)
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong'; text: string } | null>(null)
  const [xp, setXp] = useState(0)

  function end(finalStage: number, finalScore: number) {
    const cleared = finalStage - 1
    const earned = Math.min(game.maxXp, cleared * 12)
    setXp(earned)
    pal.recordGame(game.slug, finalScore, cleared >= STAGES, earned, { mathSolved: cleared })
    setPhase('done')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (opening || value.trim() === '') return
    const ok = Number(value) === eq.answer
    if (ok) {
      const pts = hint ? 5 : 10
      const ns = score + pts
      setScore(ns)
      setFb({ state: 'correct', text: `Door ${stage} unlocked! +${pts}. ${eq.steps}` })
      setOpening(true)
      setTimeout(() => {
        setOpening(false)
        setValue('')
        setHint(false)
        if (stage >= STAGES) return end(STAGES + 1, ns)
        setStage(stage + 1)
        setEq(makeEquation(stage + 1))
        setFb(null)
      }, 1100)
    } else {
      const nl = lives - 1
      setLives(nl)
      setFb({ state: 'wrong', text: nl > 0 ? `Locked! x = ${value} doesn't work. ${nl} ${nl === 1 ? 'life' : 'lives'} left.` : `Out of lives. The answer was x = ${eq.answer} (${eq.steps}).` })
      setValue('')
      if (nl <= 0) setTimeout(() => end(stage, score), 1600)
    }
  }

  function restart() {
    setStage(1)
    setEq(makeEquation(1))
    setValue('')
    setLives(3)
    setHint(false)
    setScore(0)
    setFb(null)
    setPhase('start')
  }

  return (
    <GameFrame
      game={game}
      onRestart={phase === 'play' ? restart : undefined}
      stats={
        phase === 'play' && (
          <>
            <Stat icon="level" label="Stage" value={`${stage}/${STAGES}`} />
            <div className="flex items-center gap-0.5 rounded-xl border bg-card px-3 py-2" aria-label={`${lives} lives`}>
              {[0, 1, 2].map((i) => (
                <Heart key={i} className={cn('size-4', i < lives ? 'fill-destructive text-destructive' : 'text-muted')} aria-hidden="true" />
              ))}
            </div>
          </>
        )
      }
    >
      {phase === 'start' && <StartScreen game={game} rules={[`Escape through ${STAGES} locked doors.`, 'Solve the equation on each door to unlock it.', 'Equations grow from one-step to two-sided and quadratic.', 'You have 3 lives — hints halve the points.']} onStart={() => setPhase('play')} />}

      {phase === 'play' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-3xl border bg-ink p-6 text-white">
            <p className="text-xs uppercase tracking-wider text-white/60">The corridor</p>
            <ol className="mt-4 grid grid-cols-5 gap-2">
              {Array.from({ length: STAGES }, (_, i) => i + 1).map((n) => (
                <li key={n} className={cn('flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border text-xs font-semibold', n < stage ? 'border-bio/50 bg-bio/20 text-bio-soft' : n === stage ? 'border-xp bg-xp/20 text-xp' : 'border-white/10 bg-white/5 text-white/40')}>
                  {n < stage ? <DoorOpen className="size-5" aria-hidden="true" /> : n === stage ? <DoorClosed className="size-5" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
                  {n}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-white/70">{stage <= 2 ? 'One-step addition' : stage <= 4 ? 'One-step multiplication' : stage <= 6 ? 'Two-step equations' : stage <= 8 ? 'Unknowns on both sides' : 'Quadratics'}</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className={cn('relative overflow-hidden rounded-3xl border-4 bg-card p-8 text-center transition-all duration-700', opening ? 'border-bio' : 'border-ink')}>
              <div className={cn('absolute inset-x-0 top-0 h-2 transition-colors', opening ? 'bg-bio' : 'bg-ink')} />
              <p className="text-sm font-semibold text-muted-foreground">Door {stage} · solve for x</p>
              <p className="mt-4 font-mono text-3xl font-bold sm:text-4xl">{eq.text}</p>
              <form onSubmit={submit} className="mx-auto mt-6 flex max-w-xs gap-2">
                <label htmlFor="eq-answer" className="sr-only">
                  x equals
                </label>
                <span className="flex items-center font-mono text-xl font-bold">x =</span>
                <input id="eq-answer" autoFocus value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))} inputMode="numeric" autoComplete="off" disabled={opening} className="h-14 w-full rounded-xl border-2 bg-background px-3 text-center font-mono text-2xl outline-none focus-visible:border-math" />
                <Button type="submit" size="xl" className="h-14" disabled={opening}>
                  Unlock
                </Button>
              </form>
              <Button variant="ghost" className="mt-3" onClick={() => setHint(true)} disabled={hint || opening}>
                <Lightbulb data-icon="inline-start" /> {hint ? eq.hint : 'Show hint'}
              </Button>
            </div>
            <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
          </div>
        </div>
      )}

      {phase === 'done' && <ResultScreen title={stage > STAGES ? 'You escaped!' : `Escaped ${stage - 1} of ${STAGES} doors`} score={score} xp={xp} stars={starsFor((stage - 1) / STAGES)} onRestart={restart} details="Strategy: do the same operation to both sides until x is alone." />}
    </GameFrame>
  )
}
