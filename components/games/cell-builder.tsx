'use client'

import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, GameFrame, ResultScreen, Stat, StartScreen, starsFor } from '@/components/pal/game-kit'
import { shuffle } from '@/lib/pal/daily'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Part = { id: string; name: string; x: number; y: number; fn: string }

const LEVELS: { title: string; kind: 'animal' | 'plant'; parts: Part[] }[] = [
  {
    title: 'Level 1 · Animal cell',
    kind: 'animal',
    parts: [
      { id: 'nucleus', name: 'Nucleus', x: 50, y: 48, fn: 'Contains DNA and controls all cell activities.' },
      { id: 'mitochondrion', name: 'Mitochondrion', x: 24, y: 34, fn: 'Releases energy from glucose through aerobic respiration.' },
      { id: 'ribosome', name: 'Ribosomes', x: 74, y: 30, fn: 'Tiny structures where proteins are made.' },
      { id: 'membrane', name: 'Cell membrane', x: 88, y: 56, fn: 'Controls which substances enter and leave the cell.' },
      { id: 'cytoplasm', name: 'Cytoplasm', x: 30, y: 72, fn: 'Jelly-like fluid where most chemical reactions happen.' },
    ],
  },
  {
    title: 'Level 2 · Plant cell',
    kind: 'plant',
    parts: [
      { id: 'cellwall', name: 'Cell wall', x: 8, y: 50, fn: 'Rigid cellulose layer that supports and protects the cell.' },
      { id: 'membrane', name: 'Cell membrane', x: 17, y: 18, fn: 'Controls movement of substances in and out.' },
      { id: 'vacuole', name: 'Vacuole', x: 52, y: 56, fn: 'Stores cell sap and keeps the cell firm (turgid).' },
      { id: 'chloroplast', name: 'Chloroplast', x: 80, y: 28, fn: 'Contains chlorophyll and carries out photosynthesis.' },
      { id: 'nucleus', name: 'Nucleus', x: 28, y: 32, fn: 'Contains DNA and controls the cell.' },
      { id: 'mitochondrion', name: 'Mitochondrion', x: 80, y: 78, fn: 'Releases energy through respiration.' },
      { id: 'golgi', name: 'Golgi apparatus', x: 24, y: 78, fn: 'Modifies, packages and transports proteins.' },
    ],
  },
]

function Shape({ id, x, y, on }: { id: string; x: number; y: number; on: boolean }) {
  const cx = x * 4
  const cy = y * 3
  const o = on ? 1 : 0.28
  switch (id) {
    case 'nucleus':
      return (
        <g opacity={o}>
          <circle cx={cx} cy={cy} r={34} fill="oklch(0.78 0.1 300)" stroke="oklch(0.45 0.15 300)" strokeWidth={2} />
          <circle cx={cx + 6} cy={cy - 4} r={10} fill="oklch(0.55 0.16 300)" />
        </g>
      )
    case 'mitochondrion':
      return (
        <g opacity={o} transform={`rotate(-20 ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={26} ry={12} fill="oklch(0.82 0.12 50)" stroke="oklch(0.55 0.16 45)" strokeWidth={2} />
          <path d={`M${cx - 18} ${cy} q5 -9 9 0 t9 0 t9 0 t9 0`} fill="none" stroke="oklch(0.55 0.16 45)" strokeWidth={1.5} />
        </g>
      )
    case 'ribosome':
      return (
        <g opacity={o} fill="oklch(0.45 0.12 260)">
          {[[0, 0], [10, 6], [-8, 8], [4, -10], [-12, -6], [14, -4]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={cy + dy} r={3} />
          ))}
        </g>
      )
    case 'chloroplast':
      return (
        <g opacity={o}>
          <ellipse cx={cx} cy={cy} rx={24} ry={13} fill="oklch(0.72 0.17 145)" stroke="oklch(0.45 0.14 150)" strokeWidth={2} />
          {[-12, -4, 4, 12].map((d) => (
            <rect key={d} x={cx + d - 3} y={cy - 6} width={5} height={12} rx={1} fill="oklch(0.45 0.14 150)" />
          ))}
        </g>
      )
    case 'vacuole':
      return <rect opacity={o} x={cx - 70} y={cy - 40} width={140} height={80} rx={30} fill="oklch(0.9 0.05 230)" stroke="oklch(0.6 0.1 230)" strokeWidth={2} />
    case 'golgi':
      return (
        <g opacity={o} fill="none" stroke="oklch(0.65 0.15 80)" strokeWidth={4} strokeLinecap="round">
          {[0, 8, 16].map((d) => (
            <path key={d} d={`M${cx - 22} ${cy - 8 + d} q22 -14 44 0`} />
          ))}
        </g>
      )
    default:
      return null
  }
}

export function CellBuilder() {
  const game = getGame('cell-builder')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [level, setLevel] = useState(0)
  const [placed, setPlaced] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState<Record<string, number>>({})
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong'; text: string } | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [xp, setXp] = useState(0)

  const L = LEVELS[level]
  const bank = useMemo(() => shuffle(L.parts), [L])
  const levelDone = placed.length === L.parts.length
  const maxScore = LEVELS.reduce((a, l) => a + l.parts.length * 20, 0)

  function place(partId: string, zoneId: string) {
    if (placed.includes(zoneId)) return
    const part = L.parts.find((p) => p.id === partId)!
    if (partId === zoneId) {
      const pts = (mistakes[partId] ?? 0) === 0 ? 20 : 10
      setScore((s) => s + pts)
      setPlaced((p) => [...p, partId])
      setFb({ state: 'correct', text: `${part.name} placed! +${pts} — ${part.fn}` })
      pal.answer('biology', true, 0)
    } else {
      setMistakes((m) => ({ ...m, [partId]: (m[partId] ?? 0) + 1 }))
      setFb({ state: 'wrong', text: `That spot isn't the ${part.name}. Hint: ${part.fn}` })
    }
    setSelected(null)
  }

  function finish() {
    const pct = score / maxScore
    const earned = Math.round(game.maxXp * pct)
    setXp(earned)
    pal.recordGame(game.slug, score, true, earned, { bioAnswered: LEVELS.reduce((a, l) => a + l.parts.length, 0) })
    setPhase('done')
  }

  function restart() {
    setPhase('start')
    setLevel(0)
    setPlaced([])
    setScore(0)
    setMistakes({})
    setFb(null)
    setSelected(null)
  }

  return (
    <GameFrame
      game={game}
      onRestart={phase === 'play' ? restart : undefined}
      stats={
        phase === 'play' && (
          <>
            <Stat icon="level" label="Level" value={`${level + 1}/${LEVELS.length}`} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && (
        <StartScreen
          game={game}
          rules={['Drag each organelle label onto its numbered spot in the cell.', 'On touch screens: tap a label, then tap the spot.', '20 points for a first-try placement, 10 after a mistake.', 'Level 2 is a plant cell with extra structures.']}
          onStart={() => setPhase('play')}
        />
      )}

      {phase === 'play' && (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border bg-card p-4 sm:p-6">
            <p className="mb-3 text-sm font-semibold">{L.title}</p>
            <div className="relative aspect-[4/3] w-full select-none">
              <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden="true">
                {L.kind === 'animal' ? (
                  <ellipse cx={200} cy={150} rx={185} ry={135} fill="oklch(0.95 0.04 150)" stroke="oklch(0.6 0.12 150)" strokeWidth={placed.includes('membrane') ? 5 : 3} />
                ) : (
                  <>
                    <rect x={10} y={10} width={380} height={280} rx={18} fill="oklch(0.9 0.08 140)" stroke="oklch(0.5 0.12 140)" strokeWidth={placed.includes('cellwall') ? 12 : 8} opacity={placed.includes('cellwall') ? 1 : 0.6} />
                    <rect x={24} y={24} width={352} height={252} rx={12} fill="oklch(0.96 0.04 140)" stroke="oklch(0.6 0.12 150)" strokeWidth={placed.includes('membrane') ? 3 : 1.5} />
                  </>
                )}
                {L.parts.map((p) => (
                  <Shape key={p.id} id={p.id} x={p.x} y={p.y} on={placed.includes(p.id)} />
                ))}
              </svg>
              {L.parts.map((p, i) => {
                const done = placed.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={done ? `${p.name}, placed` : `Drop zone ${i + 1}`}
                    disabled={done}
                    onClick={() => selected && place(selected, p.id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setHover(p.id)
                    }}
                    onDragLeave={() => setHover(null)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setHover(null)
                      place(e.dataTransfer.getData('text/plain'), p.id)
                    }}
                    className={cn(
                      'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                      done ? 'border-transparent bg-card/90 px-2 py-1 text-foreground shadow-sm' : 'size-9 border-dashed border-ink/50 bg-white/80 hover:scale-110',
                      hover === p.id && 'scale-125 border-primary bg-accent',
                      selected && !done && 'motion-safe:animate-pulse border-primary',
                    )}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    {done ? p.name : i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border bg-card p-5">
              <p className="text-sm font-semibold">Organelles</p>
              <p className="text-xs text-muted-foreground">Drag a label onto the cell, or tap it then tap a spot.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {bank
                  .filter((p) => !placed.includes(p.id))
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', p.id)
                        setSelected(p.id)
                      }}
                      onClick={() => setSelected(selected === p.id ? null : p.id)}
                      aria-pressed={selected === p.id}
                      className={cn(
                        'cursor-grab rounded-xl border-2 bg-background px-3 py-2 text-sm font-semibold shadow-sm transition-all active:cursor-grabbing',
                        selected === p.id ? 'border-primary bg-accent' : 'border-border hover:border-primary/40',
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                {levelDone && <p className="text-sm text-muted-foreground">All organelles placed!</p>}
              </div>
            </div>
            <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
            {levelDone &&
              (level + 1 < LEVELS.length ? (
                <Button
                  size="xl"
                  onClick={() => {
                    setLevel(level + 1)
                    setPlaced([])
                    setFb(null)
                    setMistakes({})
                  }}
                >
                  Next level <ArrowRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button size="xl" onClick={finish}>
                  See results <ArrowRight data-icon="inline-end" />
                </Button>
              ))}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <ResultScreen title={score === maxScore ? 'Master cell builder!' : 'Cells complete!'} score={`${score}/${maxScore}`} xp={xp} stars={starsFor(score / maxScore)} onRestart={restart} details="You built both an animal and a plant cell. Remember: only plant cells have a cell wall, chloroplasts and a large permanent vacuole." />
      )}
    </GameFrame>
  )
}
