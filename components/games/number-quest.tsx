'use client'

import { useState } from 'react'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, GameFrame, ResultScreen, Stat, StartScreen, starsFor } from '@/components/pal/game-kit'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Puzzle = { kind: string; terms: (number | null)[]; answer: number; hint: string; explain: string; prompt?: string }
const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const LEVELS = 10

function makePuzzle(level: number): Puzzle {
  const hide = (seq: number[], at = seq.length - 1) => ({ terms: seq.map((v, i) => (i === at ? null : v)), answer: seq[at] })
  switch (level) {
    case 1: {
      const s = r(1, 10), d = r(2, 6)
      const seq = Array.from({ length: 5 }, (_, i) => s + i * d)
      return { kind: 'Arithmetic sequence', ...hide(seq), hint: 'Look at the difference between neighbours.', explain: `Add ${d} each time.` }
    }
    case 2: {
      const s = r(40, 80), d = r(3, 9)
      const seq = Array.from({ length: 5 }, (_, i) => s - i * d)
      return { kind: 'Decreasing sequence', ...hide(seq, 2), hint: 'The numbers go down by the same amount.', explain: `Subtract ${d} each time.` }
    }
    case 3: {
      const s = r(1, 4), m = r(2, 3)
      const seq = Array.from({ length: 5 }, (_, i) => s * m ** i)
      return { kind: 'Geometric sequence', ...hide(seq), hint: 'Try dividing each term by the one before.', explain: `Multiply by ${m} each time.` }
    }
    case 4: {
      const o = r(1, 3)
      const seq = Array.from({ length: 5 }, (_, i) => (i + o) ** 2)
      return { kind: 'Square numbers', ...hide(seq), hint: 'These are special numbers: 1, 4, 9, 16…', explain: `They are square numbers: ${o + 4}² = ${(o + 4) ** 2}.` }
    }
    case 5: {
      const a = r(1, 3), b = r(2, 4)
      const seq = [a, b]
      while (seq.length < 7) seq.push(seq.at(-1)! + seq.at(-2)!)
      return { kind: 'Fibonacci-style', ...hide(seq), hint: 'Each term depends on the two before it.', explain: 'Add the previous two terms together.' }
    }
    case 6: {
      const seq = [1, 3, 6, 10, 15, 21]
      return { kind: 'Triangular numbers', ...hide(seq), hint: 'The gaps are 2, 3, 4, 5…', explain: 'The difference grows by 1 each time: +2, +3, +4, +5, +6.' }
    }
    case 7: {
      const seq = [2, 3, 5, 7, 11, 13, 17]
      const at = r(3, 6)
      return { kind: 'Prime numbers', ...hide(seq, at), hint: 'Each number has exactly two factors.', explain: 'These are prime numbers.' }
    }
    case 8: {
      const a = r(2, 5)
      const seq = [a]
      for (let i = 1; i < 6; i++) seq.push(i % 2 ? seq.at(-1)! * 2 : seq.at(-1)! + 3)
      return { kind: 'Alternating rule', ...hide(seq), hint: 'Two different rules take turns.', explain: 'Alternate: ×2, then +3.' }
    }
    case 9: {
      const n = r(12, 40)
      const sum = n + (n + 1) + (n + 2)
      return { kind: 'Logic puzzle', terms: [], answer: n, prompt: `Three consecutive numbers add up to ${sum}. What is the smallest?`, hint: `Divide ${sum} by 3 to find the middle number.`, explain: `${sum} ÷ 3 = ${n + 1}, so the numbers are ${n}, ${n + 1}, ${n + 2}.` }
    }
    default: {
      const x = r(3, 12)
      const m = r(2, 5)
      const a = r(2, 15)
      return { kind: 'Think of a number', terms: [], answer: x, prompt: `I think of a number, multiply it by ${m}, then add ${a}. The result is ${x * m + a}. What was my number?`, hint: 'Work backwards: undo each step in reverse order.', explain: `(${x * m + a} − ${a}) ÷ ${m} = ${x}.` }
    }
  }
}

export function NumberQuest() {
  const game = getGame('number-quest')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [level, setLevel] = useState(1)
  const [pz, setPz] = useState<Puzzle>(() => makePuzzle(1))
  const [value, setValue] = useState('')
  const [hint, setHint] = useState(false)
  const [tries, setTries] = useState(0)
  const [solved, setSolved] = useState(false)
  const [score, setScore] = useState(0)
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong'; text: string } | null>(null)
  const [xp, setXp] = useState(0)
  const maxScore = LEVELS * 10

  function check(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || solved) return
    const n = tries + 1
    setTries(n)
    if (Number(value) === pz.answer) {
      const pts = Math.max(3, 10 - (hint ? 4 : 0) - (n - 1) * 3)
      setScore((s) => s + pts)
      setSolved(true)
      setFb({ state: 'correct', text: `Correct! +${pts}. ${pz.explain}` })
      pal.answer('mathematics', true, 0)
    } else if (n >= 3) {
      setSolved(true)
      setFb({ state: 'wrong', text: `The answer was ${pz.answer}. ${pz.explain}` })
      pal.answer('mathematics', false, 0)
    } else {
      setFb({ state: 'wrong', text: `Not quite — ${3 - n} ${3 - n === 1 ? 'try' : 'tries'} left.` })
      setValue('')
    }
  }

  function next() {
    if (level >= LEVELS) {
      const earned = Math.round(game.maxXp * (score / maxScore))
      setXp(earned)
      pal.recordGame(game.slug, score, true, earned, { mathSolved: LEVELS })
      setPhase('done')
      return
    }
    setLevel(level + 1)
    setPz(makePuzzle(level + 1))
    setValue('')
    setHint(false)
    setTries(0)
    setSolved(false)
    setFb(null)
  }

  function restart() {
    setLevel(1)
    setPz(makePuzzle(1))
    setValue('')
    setHint(false)
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
            <Stat icon="level" label="Level" value={`${level}/${LEVELS}`} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && <StartScreen game={game} rules={[`${LEVELS} levels of patterns, sequences and logic.`, 'Find the missing number in each pattern.', 'Three tries per puzzle — hints cost points.', 'Levels get harder: primes, Fibonacci and reasoning puzzles.']} onStart={() => setPhase('play')} />}

      {phase === 'play' && (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: LEVELS }, (_, i) => (
              <span key={i} className={cn('h-2 flex-1 rounded-full', i + 1 < level ? 'bg-math' : i + 1 === level ? 'bg-xp' : 'bg-muted')} />
            ))}
          </div>
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <span className="rounded-full bg-math-soft px-2.5 py-0.5 text-xs font-semibold text-math">{pz.kind}</span>
            {pz.prompt ? (
              <p className="mt-5 text-xl font-semibold text-balance sm:text-2xl">{pz.prompt}</p>
            ) : (
              <>
                <p className="mt-4 text-sm text-muted-foreground">Find the missing number</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pz.terms.map((t, i) => (
                    <span key={i} className={cn('flex h-16 min-w-16 items-center justify-center rounded-2xl border-2 px-3 font-mono text-2xl font-bold', t === null ? 'border-dashed border-xp bg-xp-soft text-xp-foreground' : 'bg-background')}>
                      {t === null ? (solved ? pz.answer : '?') : t}
                    </span>
                  ))}
                </div>
              </>
            )}
            <form onSubmit={check} className="mt-6 flex gap-2">
              <label htmlFor="nq-answer" className="sr-only">
                Answer
              </label>
              <input id="nq-answer" autoFocus value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))} disabled={solved} inputMode="numeric" autoComplete="off" className="h-14 flex-1 rounded-xl border-2 bg-background px-4 font-mono text-2xl outline-none focus-visible:border-math" />
              <Button type="submit" size="xl" className="h-14" disabled={solved}>
                Check
              </Button>
            </form>
            <Button variant="ghost" className="mt-3" onClick={() => setHint(true)} disabled={hint || solved}>
              <Lightbulb data-icon="inline-start" /> {hint ? pz.hint : 'Hint (−4)'}
            </Button>
          </div>
          <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
          {solved && (
            <Button size="xl" onClick={next} className="self-end">
              {level < LEVELS ? 'Next level' : 'See results'} <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      )}

      {phase === 'done' && <ResultScreen title="Quest complete!" score={`${score}/${maxScore}`} xp={xp} stars={starsFor(score / maxScore)} onRestart={restart} details="Pattern-spotting tip: check differences first, then ratios, then look for special number families." />}
    </GameFrame>
  )
}
