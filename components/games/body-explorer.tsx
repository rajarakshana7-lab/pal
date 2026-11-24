'use client'

import { useMemo, useRef, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, formatTime, GameFrame, ResultScreen, Stat, StartScreen, starsFor, useCountdown } from '@/components/pal/game-kit'
import { shuffle } from '@/lib/pal/daily'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Organ = { id: string; name: string; clue: string; fact: string; color: string }

const ORGANS: Organ[] = [
  { id: 'brain', name: 'Brain', clue: 'Find the organ that controls thoughts, memory and movement.', fact: 'The brain sends signals through ~86 billion neurons.', color: 'oklch(0.78 0.1 350)' },
  { id: 'lungs', name: 'Lungs', clue: 'Find the organs where oxygen enters the blood.', fact: 'Gas exchange happens in millions of tiny air sacs called alveoli.', color: 'oklch(0.8 0.09 15)' },
  { id: 'heart', name: 'Heart', clue: 'Find the muscular pump that pushes blood around the body.', fact: 'The heart has four chambers and beats about 100,000 times a day.', color: 'oklch(0.58 0.2 25)' },
  { id: 'liver', name: 'Liver', clue: 'Find the organ that makes bile and removes toxins.', fact: 'The liver is the largest internal organ and can regenerate.', color: 'oklch(0.5 0.12 35)' },
  { id: 'stomach', name: 'Stomach', clue: 'Find where food is churned with acid and enzymes.', fact: 'Stomach acid (HCl) also kills most bacteria in food.', color: 'oklch(0.78 0.12 70)' },
  { id: 'kidneys', name: 'Kidneys', clue: 'Find the organs that filter blood and make urine.', fact: 'Kidneys filter around 180 litres of blood plasma every day.', color: 'oklch(0.55 0.13 15)' },
  { id: 'intestines', name: 'Intestines', clue: 'Find where most nutrients are absorbed into the blood.', fact: 'Villi in the small intestine give it a huge surface area.', color: 'oklch(0.82 0.1 40)' },
  { id: 'bladder', name: 'Bladder', clue: 'Find the organ that stores urine.', fact: 'An adult bladder can hold about 400–600 ml.', color: 'oklch(0.85 0.1 95)' },
]

const ROUND_SECONDS = 90

export function BodyExplorer() {
  const game = getGame('body-explorer')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [order, setOrder] = useState<Organ[]>(() => ORGANS)
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [found, setFound] = useState<string[]>([])
  const [hint, setHint] = useState(false)
  const [wrongTries, setWrongTries] = useState(0)
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong'; text: string } | null>(null)
  const [xp, setXp] = useState(0)
  const scoreRef = useRef(0)
  const target = order[i]
  const maxScore = ORGANS.length * 15

  function finish(final = scoreRef.current) {
    const earned = Math.round(game.maxXp * (final / maxScore)) + (timer.left > 0 && final === maxScore ? 10 : 0)
    setXp(Math.min(game.maxXp, earned))
    pal.recordGame(game.slug, final, true, Math.min(game.maxXp, earned), { bioAnswered: found.length })
    setPhase('done')
  }

  const timer = useCountdown(ROUND_SECONDS, phase === 'play', () => finish())

  function pick(id: string) {
    if (phase !== 'play' || !target || found.includes(id)) return
    const organ = ORGANS.find((o) => o.id === id)!
    if (id === target.id) {
      const pts = Math.max(5, 15 - (hint ? 5 : 0) - wrongTries * 3)
      scoreRef.current += pts
      setScore(scoreRef.current)
      setFound((f) => [...f, id])
      setFb({ state: 'correct', text: `${organ.name}! +${pts}. ${organ.fact}` })
      pal.answer('biology', true, 0)
      setHint(false)
      setWrongTries(0)
      if (i + 1 < order.length) setI(i + 1)
      else setTimeout(() => finish(scoreRef.current), 900)
    } else {
      setWrongTries((w) => w + 1)
      setFb({ state: 'wrong', text: `That's the ${organ.name} — ${organ.clue.replace('Find ', '').replace(/^the /, 'it is the ').replace('.', '')}. Try again!` })
    }
  }

  function start() {
    setOrder(shuffle(ORGANS))
    setPhase('play')
  }

  function restart() {
    scoreRef.current = 0
    setScore(0)
    setI(0)
    setFound([])
    setHint(false)
    setWrongTries(0)
    setFb(null)
    timer.reset()
    setPhase('start')
  }

  const organProps = (id: string) => {
    const organ = ORGANS.find((o) => o.id === id)!
    const isFound = found.includes(id)
    const isHint = hint && target?.id === id
    return {
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': isFound ? organ.name : `Unknown organ`,
      onClick: () => pick(id),
      onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(id)),
      className: cn('cursor-pointer outline-none transition-all hover:brightness-110 focus-visible:stroke-primary focus-visible:[stroke-width:4]', isHint && 'motion-safe:animate-pulse'),
      fill: organ.color,
      stroke: isHint ? 'var(--primary)' : isFound ? 'oklch(0.45 0.15 150)' : 'oklch(0.3 0.02 260 / 0.5)',
      strokeWidth: isHint || isFound ? 3 : 1.5,
      opacity: isFound ? 1 : 0.85,
    }
  }

  const bodyOutline = useMemo(
    () => (
      <g fill="oklch(0.93 0.03 60)" stroke="oklch(0.7 0.05 60)" strokeWidth={2}>
        <circle cx={100} cy={40} r={30} />
        <rect x={90} y={66} width={20} height={16} />
        <path d="M58 86 Q100 74 142 86 L150 230 Q150 290 128 300 L72 300 Q50 290 50 230 Z" />
        <path d="M58 90 L30 190 L40 194 L66 120 Z" />
        <path d="M142 90 L170 190 L160 194 L134 120 Z" />
        <path d="M74 296 L68 392 L88 392 L98 300 Z" />
        <path d="M126 296 L132 392 L112 392 L102 300 Z" />
      </g>
    ),
    [],
  )

  return (
    <GameFrame
      game={game}
      onRestart={phase === 'play' ? restart : undefined}
      stats={
        phase === 'play' && (
          <>
            <Stat icon="time" label="Time" value={formatTime(timer.left)} tone={timer.left <= 15 ? 'warn' : undefined} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && (
        <StartScreen game={game} rules={[`Find all ${ORGANS.length} organs in ${ROUND_SECONDS} seconds.`, 'Read the clue and click the matching organ on the body.', '15 points each — hints and wrong clicks reduce points.', 'Wrong clicks still teach you what that organ does.']} onStart={start} />
      )}

      {phase === 'play' && target && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border bg-card p-4">
            <svg viewBox="0 0 200 400" className="mx-auto h-[min(70vh,520px)] w-auto" aria-label="Human body diagram">
              {bodyOutline}
              <ellipse cx={100} cy={36} rx={21} ry={15} {...organProps('brain')} />
              <g {...organProps('lungs')}>
                <ellipse cx={80} cy={122} rx={17} ry={30} />
                <ellipse cx={120} cy={122} rx={17} ry={30} />
              </g>
              <path d="M106 116 c8 -10 20 0 10 14 l-10 12 l-10 -12 c-10 -14 2 -24 10 -14 z" {...organProps('heart')} />
              <ellipse cx={84} cy={170} rx={24} ry={12} {...organProps('liver')} />
              <ellipse cx={118} cy={176} rx={15} ry={11} {...organProps('stomach')} />
              <g {...organProps('kidneys')}>
                <ellipse cx={72} cy={202} rx={7} ry={11} />
                <ellipse cx={128} cy={202} rx={7} ry={11} />
              </g>
              <rect x={82} y={196} width={36} height={52} rx={14} {...organProps('intestines')} />
              <ellipse cx={100} cy={266} rx={11} ry={8} {...organProps('bladder')} />
            </svg>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border bg-ink p-6 text-white">
              <p className="text-xs uppercase tracking-wider text-white/60">
                Organ {i + 1} of {order.length}
              </p>
              <p className="mt-2 text-xl font-semibold text-balance">{target.clue}</p>
              <Button variant="secondary" className="mt-4" onClick={() => setHint(true)} disabled={hint}>
                <Lightbulb data-icon="inline-start" /> {hint ? 'Look for the glowing outline' : 'Hint (−5 pts)'}
              </Button>
            </div>
            <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
            <div className="rounded-3xl border bg-card p-5">
              <p className="text-sm font-semibold">Discovered organs</p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {ORGANS.map((o) => (
                  <li key={o.id} className={cn('flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm', found.includes(o.id) ? 'bg-bio-soft font-medium' : 'text-muted-foreground')}>
                    <span className="size-3 rounded-full" style={{ background: found.includes(o.id) ? o.color : 'var(--muted)' }} />
                    {found.includes(o.id) ? o.name : '???'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <ResultScreen
          title={found.length === ORGANS.length ? 'Anatomy expert!' : "Time's up!"}
          score={`${score}/${maxScore}`}
          xp={xp}
          stars={starsFor(score / maxScore)}
          onRestart={restart}
          details={`You found ${found.length} of ${ORGANS.length} organs${found.length === ORGANS.length ? ` with ${timer.left}s to spare` : ''}.`}
        />
      )}
    </GameFrame>
  )
}
