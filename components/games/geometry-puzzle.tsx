'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, GameFrame, ResultScreen, Stat, StartScreen, starsFor } from '@/components/pal/game-kit'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Dims = { a: number; b: number }
type Round = {
  shape: 'rect' | 'tri' | 'circle' | 'angles'
  mode: 'calc' | 'build'
  prompt: (d: Dims) => string
  labels: [string, string?]
  ranges: [[number, number], [number, number]?]
  start: Dims
  answer?: (d: Dims) => number
  tolerance?: number
  target?: (d: Dims) => boolean
  explain: (d: Dims) => string
}

const ROUNDS: Round[] = [
  { shape: 'rect', mode: 'calc', prompt: () => 'Set any size, then find the AREA of your rectangle.', labels: ['Length', 'Width'], ranges: [[2, 12], [2, 10]], start: { a: 6, b: 4 }, answer: (d) => d.a * d.b, explain: (d) => `Area = length × width = ${d.a} × ${d.b} = ${d.a * d.b}` },
  { shape: 'rect', mode: 'calc', prompt: () => 'Now find the PERIMETER of your rectangle.', labels: ['Length', 'Width'], ranges: [[2, 12], [2, 10]], start: { a: 7, b: 3 }, answer: (d) => 2 * (d.a + d.b), explain: (d) => `Perimeter = 2 × (${d.a} + ${d.b}) = ${2 * (d.a + d.b)}` },
  { shape: 'tri', mode: 'calc', prompt: () => 'Find the AREA of this right triangle.', labels: ['Base', 'Height'], ranges: [[2, 12], [2, 10]], start: { a: 8, b: 5 }, answer: (d) => (d.a * d.b) / 2, explain: (d) => `Area = ½ × base × height = ½ × ${d.a} × ${d.b} = ${(d.a * d.b) / 2}` },
  { shape: 'angles', mode: 'calc', prompt: () => 'Set two angles. What is the THIRD angle of the triangle?', labels: ['Angle A°', 'Angle B°'], ranges: [[20, 100], [20, 70]], start: { a: 60, b: 50 }, answer: (d) => 180 - d.a - d.b, explain: (d) => `Angles in a triangle add to 180°: 180 − ${d.a} − ${d.b} = ${180 - d.a - d.b}°` },
  { shape: 'circle', mode: 'calc', prompt: () => 'Find the AREA of the circle (use π ≈ 3.14, round to nearest whole number).', labels: ['Radius'], ranges: [[1, 10]], start: { a: 5, b: 0 }, answer: (d) => Math.round(3.14 * d.a * d.a), tolerance: 1, explain: (d) => `Area = πr² ≈ 3.14 × ${d.a}² ≈ ${Math.round(3.14 * d.a * d.a)}` },
  { shape: 'rect', mode: 'build', prompt: () => 'BUILD a rectangle with area 36 and perimeter 26.', labels: ['Length', 'Width'], ranges: [[1, 12], [1, 12]], start: { a: 6, b: 6 }, target: (d) => d.a * d.b === 36 && 2 * (d.a + d.b) === 26, explain: () => '9 × 4 = 36 and 2 × (9 + 4) = 26. A 6 × 6 square has area 36 but perimeter 24.' },
  { shape: 'tri', mode: 'build', prompt: () => 'BUILD a right triangle with an area of exactly 24.', labels: ['Base', 'Height'], ranges: [[1, 12], [1, 12]], start: { a: 4, b: 4 }, target: (d) => (d.a * d.b) / 2 === 24, explain: (d) => `½ × ${d.a} × ${d.b} = ${(d.a * d.b) / 2}. Pairs like 8 × 6, 12 × 4 work.` },
]

function ShapeView({ shape, d }: { shape: Round['shape']; d: Dims }) {
  const U = 22
  if (shape === 'rect') {
    const w = d.a * U
    const h = d.b * U
    return (
      <svg viewBox="0 0 320 260" className="size-full" aria-label={`Rectangle ${d.a} by ${d.b}`}>
        <rect x={160 - w / 2} y={130 - h / 2} width={w} height={h} rx={4} fill="oklch(0.9 0.06 280)" stroke="var(--math)" strokeWidth={3} className="transition-all duration-300" />
        <text x={160} y={130 - h / 2 - 8} textAnchor="middle" className="fill-foreground font-mono text-sm font-bold">{d.a}</text>
        <text x={160 + w / 2 + 10} y={134} className="fill-foreground font-mono text-sm font-bold">{d.b}</text>
      </svg>
    )
  }
  if (shape === 'tri') {
    const w = d.a * U
    const h = d.b * U
    const x0 = 160 - w / 2
    const y0 = 130 + h / 2
    return (
      <svg viewBox="0 0 320 260" className="size-full" aria-label={`Right triangle base ${d.a}, height ${d.b}`}>
        <polygon points={`${x0},${y0} ${x0 + w},${y0} ${x0},${y0 - h}`} fill="oklch(0.9 0.08 150)" stroke="var(--bio)" strokeWidth={3} className="transition-all duration-300" />
        <rect x={x0} y={y0 - 12} width={12} height={12} fill="none" stroke="var(--bio)" />
        <text x={x0 + w / 2} y={y0 + 18} textAnchor="middle" className="fill-foreground font-mono text-sm font-bold">{d.a}</text>
        <text x={x0 - 18} y={y0 - h / 2} className="fill-foreground font-mono text-sm font-bold">{d.b}</text>
      </svg>
    )
  }
  if (shape === 'circle') {
    const rr = d.a * 11
    return (
      <svg viewBox="0 0 320 260" className="size-full" aria-label={`Circle radius ${d.a}`}>
        <circle cx={160} cy={130} r={rr} fill="oklch(0.92 0.06 80)" stroke="var(--xp)" strokeWidth={3} className="transition-all duration-300" />
        <line x1={160} y1={130} x2={160 + rr} y2={130} stroke="var(--foreground)" strokeWidth={2} strokeDasharray="4 3" />
        <text x={160 + rr / 2} y={124} textAnchor="middle" className="fill-foreground font-mono text-sm font-bold">r = {d.a}</text>
      </svg>
    )
  }
  const A = (d.a * Math.PI) / 180
  const B = (d.b * Math.PI) / 180
  const base = 220
  const C = Math.PI - A - B
  const side = (base * Math.sin(B)) / Math.sin(C)
  const px = 50 + side * Math.cos(A)
  const py = 220 - side * Math.sin(A)
  const scale = py < 20 ? (220 - 20) / (220 - py) : 1
  const fy = 220 - (220 - py) * scale
  return (
    <svg viewBox="0 0 320 260" className="size-full" aria-label={`Triangle with angles ${d.a} and ${d.b}`}>
      <polygon points={`50,220 ${50 + base},220 ${50 + (px - 50) * scale},${fy}`} fill="oklch(0.92 0.05 260)" stroke="var(--primary)" strokeWidth={3} className="transition-all duration-300" />
      <text x={62} y={212} className="fill-foreground font-mono text-xs font-bold">{d.a}°</text>
      <text x={50 + base - 34} y={212} className="fill-foreground font-mono text-xs font-bold">{d.b}°</text>
      <text x={50 + (px - 50) * scale - 6} y={fy + 26} className="fill-destructive font-mono text-sm font-bold">?</text>
    </svg>
  )
}

export function GeometryPuzzle() {
  const game = getGame('geometry-puzzle')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [ri, setRi] = useState(0)
  const [d, setD] = useState<Dims>(ROUNDS[0].start)
  const [value, setValue] = useState('')
  const [tries, setTries] = useState(0)
  const [solved, setSolved] = useState(false)
  const [score, setScore] = useState(0)
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong'; text: string } | null>(null)
  const [xp, setXp] = useState(0)
  const R = ROUNDS[ri]
  const maxScore = ROUNDS.length * 15

  function check(e?: React.FormEvent) {
    e?.preventDefault()
    const n = tries + 1
    setTries(n)
    const ok = R.mode === 'build' ? R.target!(d) : Math.abs(Number(value) - R.answer!(d)) <= (R.tolerance ?? 0) && value.trim() !== ''
    if (ok) {
      const pts = n === 1 ? 15 : n === 2 ? 10 : 5
      setScore((s) => s + pts)
      setSolved(true)
      setFb({ state: 'correct', text: `Correct! +${pts}. ${R.explain(d)}` })
      pal.answer('mathematics', true, 0)
    } else {
      setFb({ state: 'wrong', text: R.mode === 'build' ? `Not yet: area ${R.shape === 'tri' ? (d.a * d.b) / 2 : d.a * d.b}${R.shape === 'rect' ? `, perimeter ${2 * (d.a + d.b)}` : ''}. Keep adjusting!` : n >= 2 ? `Hint: ${R.explain(d).split('=')[0]}= ...` : 'Not quite — try again.' })
    }
  }

  function next() {
    if (ri + 1 >= ROUNDS.length) {
      const earned = Math.round(game.maxXp * (score / maxScore))
      setXp(earned)
      pal.recordGame(game.slug, score, true, earned, { mathSolved: ROUNDS.length })
      setPhase('done')
      return
    }
    setRi(ri + 1)
    setD(ROUNDS[ri + 1].start)
    setValue('')
    setTries(0)
    setSolved(false)
    setFb(null)
  }

  function restart() {
    setRi(0)
    setD(ROUNDS[0].start)
    setValue('')
    setTries(0)
    setSolved(false)
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
            <Stat icon="level" label="Puzzle" value={`${ri + 1}/${ROUNDS.length}`} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && <StartScreen game={game} rules={['Use the sliders to resize each shape yourself.', 'Calculate puzzles: work out area, perimeter or angles of YOUR shape.', 'Build puzzles: adjust the shape until it meets the target.', '15 points first try, fewer after.']} onStart={() => setPhase('play')} />}

      {phase === 'play' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border bg-card p-4">
            <div className="aspect-[32/26] w-full rounded-2xl bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:22px_22px]">
              <ShapeView shape={R.shape} d={d} />
            </div>
            <div className="mt-4 flex flex-col gap-4 px-2">
              {R.labels.map((label, idx) => {
                if (!label) return null
                const key = idx === 0 ? 'a' : 'b'
                const [min, max] = R.ranges[idx]!
                return (
                  <label key={label} className="flex items-center gap-4 text-sm font-medium">
                    <span className="w-20 shrink-0">{label}</span>
                    <input type="range" min={min} max={max} value={d[key]} disabled={solved} onChange={(e) => (setD({ ...d, [key]: Number(e.target.value) }), setFb(null))} className="flex-1 accent-[var(--math)]" />
                    <span className="w-10 text-right font-mono font-bold">{d[key]}</span>
                  </label>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border bg-card p-6">
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', R.mode === 'build' ? 'bg-bio-soft text-bio' : 'bg-math-soft text-math')}>{R.mode === 'build' ? 'Build challenge' : 'Calculate'}</span>
              <p className="mt-3 text-xl font-semibold text-balance">{R.prompt(d)}</p>
              {R.mode === 'calc' ? (
                <form onSubmit={check} className="mt-5 flex gap-2">
                  <label htmlFor="geo-answer" className="sr-only">
                    Answer
                  </label>
                  <input id="geo-answer" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" disabled={solved} autoComplete="off" className="h-14 flex-1 rounded-xl border-2 bg-background px-4 font-mono text-2xl outline-none focus-visible:border-math" />
                  <Button type="submit" size="xl" className="h-14" disabled={solved}>
                    Check
                  </Button>
                </form>
              ) : (
                !solved && (
                  <Button size="xl" className="mt-5 w-full" onClick={() => check()}>
                    Check my shape
                  </Button>
                )
              )}
            </div>
            <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
            {solved && (
              <Button size="xl" onClick={next}>
                {ri + 1 < ROUNDS.length ? 'Next puzzle' : 'See results'} <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === 'done' && <ResultScreen title="Geometry genius!" score={`${score}/${maxScore}`} xp={xp} stars={starsFor(score / maxScore)} onRestart={restart} details="Area measures the space inside; perimeter measures the distance around." />}
    </GameFrame>
  )
}
