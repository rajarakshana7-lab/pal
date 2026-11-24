'use client'

import { useState } from 'react'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, GameFrame, ResultScreen, Stat, StartScreen, starsFor } from '@/components/pal/game-kit'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Cross = { p1: string; p2: string; letter: string; dominant: string; recessive: string; trait: string }

const CROSSES: Cross[] = [
  { p1: 'BB', p2: 'bb', letter: 'B', dominant: 'brown eyes', recessive: 'blue eyes', trait: 'Eye colour' },
  { p1: 'Bb', p2: 'bb', letter: 'B', dominant: 'brown eyes', recessive: 'blue eyes', trait: 'Eye colour' },
  { p1: 'Tt', p2: 'Tt', letter: 'T', dominant: 'tall stem', recessive: 'short stem', trait: 'Pea plant height' },
  { p1: 'Rr', p2: 'RR', letter: 'R', dominant: 'red flowers', recessive: 'white flowers', trait: 'Flower colour' },
  { p1: 'Gg', p2: 'Gg', letter: 'G', dominant: 'green pods', recessive: 'yellow pods', trait: 'Pod colour' },
]

const FRACTIONS = ['0', '1/4', '1/2', '3/4', '1']

function combine(a: string, b: string) {
  return a === a.toUpperCase() || b !== b.toUpperCase() ? a + b : b + a
}

export function Genetics() {
  const game = getGame('genetics')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [round, setRound] = useState(0)
  const [cells, setCells] = useState<(string | null)[]>([null, null, null, null])
  const [stage, setStage] = useState<'grid' | 'ratio' | 'review'>('grid')
  const [gridOk, setGridOk] = useState<boolean[] | null>(null)
  const [ratioPick, setRatioPick] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [hint, setHint] = useState(false)
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong' | 'hint'; text: string } | null>(null)
  const [xp, setXp] = useState(0)

  const c = CROSSES[round]
  const g1 = c.p1.split('')
  const g2 = c.p2.split('')
  const answer = g1.flatMap((a) => g2.map((b) => combine(a, b)))
  const recessiveCount = answer.filter((x) => x === x.toLowerCase()).length
  const recessiveFraction = FRACTIONS[recessiveCount]
  const options = [c.letter + c.letter, c.letter + c.letter.toLowerCase(), c.letter.toLowerCase() + c.letter.toLowerCase()]
  const maxScore = CROSSES.length * 30

  function cycle(idx: number) {
    if (stage !== 'grid') return
    setGridOk(null)
    setCells((cs) => {
      const next = [...cs]
      const cur = next[idx]
      const pos = cur ? options.indexOf(cur) : -1
      next[idx] = options[(pos + 1) % options.length]
      return next
    })
  }

  function checkGrid() {
    const ok = cells.map((v, i) => v === answer[i])
    setGridOk(ok)
    const right = ok.filter(Boolean).length
    if (right === 4) {
      const pts = hint ? 15 : 20
      setScore((s) => s + pts)
      setFb({ state: 'correct', text: `Punnett square correct! +${pts}. Now predict the outcome.` })
      setStage('ratio')
      pal.answer('biology', true, 0)
    } else {
      setFb({ state: 'wrong', text: `${right}/4 cells correct. Each cell combines the allele above it with the allele to its left.` })
    }
  }

  function checkRatio(v: string) {
    setRatioPick(v)
    const ok = v === recessiveFraction
    if (ok) setScore((s) => s + 10)
    pal.answer('biology', ok, 0)
    const dom = 4 - recessiveCount
    setFb({
      state: ok ? 'correct' : 'wrong',
      text: `${ok ? 'Correct! +10. ' : `Not quite — it's ${recessiveFraction}. `}${dom}/4 offspring show ${c.dominant} and ${recessiveCount}/4 show ${c.recessive} (ratio ${dom}:${recessiveCount}). Only ${options[2]} shows the recessive trait.`,
    })
    setStage('review')
  }

  function nextRound() {
    if (round + 1 >= CROSSES.length) {
      const earned = Math.round(game.maxXp * (score / maxScore))
      setXp(earned)
      pal.recordGame(game.slug, score, true, earned)
      setPhase('done')
      return
    }
    setRound(round + 1)
    setCells([null, null, null, null])
    setStage('grid')
    setGridOk(null)
    setRatioPick(null)
    setHint(false)
    setFb(null)
  }

  function restart() {
    setPhase('start')
    setRound(0)
    setCells([null, null, null, null])
    setStage('grid')
    setGridOk(null)
    setRatioPick(null)
    setScore(0)
    setHint(false)
    setFb(null)
  }

  return (
    <GameFrame
      game={game}
      onRestart={phase === 'play' ? restart : undefined}
      stats={
        phase === 'play' && (
          <>
            <Stat icon="level" label="Cross" value={`${round + 1}/${CROSSES.length}`} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && (
        <StartScreen game={game} rules={['Fill in all four boxes of the Punnett square by clicking to cycle genotypes.', 'Then predict what fraction of offspring show the recessive trait.', '20 points for the square, 10 for the prediction.', 'Crosses get trickier as you go.']} onStart={() => setPhase('play')} />
      )}

      {phase === 'play' && (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">{c.trait}</p>
            <p className="mt-1 text-lg font-semibold">
              Cross: <span className="font-mono">{c.p1}</span> × <span className="font-mono">{c.p2}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono font-semibold">{c.letter}</span> = {c.dominant} (dominant) · <span className="font-mono font-semibold">{c.letter.toLowerCase()}</span> = {c.recessive} (recessive)
            </p>

            <div className="mx-auto mt-6 grid w-fit grid-cols-[48px_repeat(2,minmax(0,96px))] gap-2">
              <span />
              {g2.map((a, i) => (
                <span key={`t${i}`} className="flex h-12 items-center justify-center rounded-xl bg-math-soft font-mono text-xl font-bold text-math">
                  {a}
                </span>
              ))}
              {g1.map((a, r) => (
                <Row key={r}>
                  <span className="flex w-12 items-center justify-center rounded-xl bg-bio-soft font-mono text-xl font-bold text-bio">{a}</span>
                  {[0, 1].map((col) => {
                    const idx = r * 2 + col
                    const v = cells[idx]
                    const ok = gridOk?.[idx]
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => cycle(idx)}
                        disabled={stage !== 'grid'}
                        aria-label={`Row ${a}, column ${g2[col]}: ${v ?? 'empty'}. Click to change.`}
                        className={cn(
                          'flex size-24 items-center justify-center rounded-xl border-2 font-mono text-2xl font-bold transition-all',
                          ok === true ? 'border-bio bg-bio-soft' : ok === false ? 'border-destructive bg-destructive/5 motion-safe:animate-[pal-shake_0.35s]' : v ? 'border-primary bg-accent' : 'border-dashed border-border hover:border-primary/50',
                        )}
                      >
                        {v ?? '?'}
                      </button>
                    )
                  })}
                </Row>
              ))}
            </div>
            {hint && stage === 'grid' && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-xp-soft p-3 text-sm">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-xp" aria-hidden="true" />
                Top-left cell = {g1[0]} + {g2[0]} = <span className="font-mono font-semibold">{answer[0]}</span>. Always write the capital letter first.
              </p>
            )}
            {stage === 'grid' && (
              <div className="mt-6 flex flex-wrap justify-between gap-2">
                <Button variant="ghost" onClick={() => setHint(true)} disabled={hint}>
                  <Lightbulb data-icon="inline-start" /> Hint (−5)
                </Button>
                <Button size="xl" onClick={checkGrid} disabled={cells.some((x) => !x)}>
                  Check square
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className={cn('rounded-3xl border bg-card p-6 transition-opacity', stage === 'grid' && 'opacity-50')}>
              <p className="font-semibold">Inheritance outcome</p>
              <p className="mt-1 text-sm text-muted-foreground">What fraction of offspring will have {c.recessive}?</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {FRACTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    disabled={stage !== 'ratio'}
                    onClick={() => checkRatio(f)}
                    className={cn(
                      'rounded-xl border-2 py-3 font-mono font-bold transition-colors',
                      stage === 'review' && f === recessiveFraction ? 'border-bio bg-bio-soft' : stage === 'review' && f === ratioPick ? 'border-destructive bg-destructive/5' : 'border-border enabled:hover:border-primary/40',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {stage === 'review' && (
                <div className="mt-5 flex gap-1.5" aria-label="Offspring outcome">
                  {answer.map((g, i) => (
                    <div key={i} className={cn('flex-1 rounded-xl p-3 text-center text-xs font-semibold', g === g.toLowerCase() ? 'bg-math-soft text-math' : 'bg-bio-soft text-bio')}>
                      <p className="font-mono text-base">{g}</p>
                      <p className="mt-0.5 font-normal">{g === g.toLowerCase() ? c.recessive : c.dominant}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
            {stage === 'review' && (
              <Button size="xl" onClick={nextRound}>
                {round + 1 < CROSSES.length ? 'Next cross' : 'See results'} <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === 'done' && <ResultScreen title="Genetics solved!" score={`${score}/${maxScore}`} xp={xp} stars={starsFor(score / maxScore)} onRestart={restart} details="Remember: Aa × Aa gives a 3:1 ratio, Aa × aa gives 1:1, and AA × aa gives all heterozygous offspring." />}
    </GameFrame>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
