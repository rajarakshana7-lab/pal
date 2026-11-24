'use client'

import { useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUp, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Feedback, GameFrame, ResultScreen, Stat, StartScreen, starsFor } from '@/components/pal/game-kit'
import { shuffle } from '@/lib/pal/daily'
import { getGame } from '@/lib/pal/games'
import { pal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

const ROLES = ['Producer', 'Primary consumer', 'Secondary consumer', 'Tertiary consumer', 'Quaternary consumer']

const CHAINS: { name: string; chain: string[] }[] = [
  { name: 'Grassland', chain: ['Grass', 'Grasshopper', 'Frog', 'Snake'] },
  { name: 'Woodland', chain: ['Oak leaves', 'Caterpillar', 'Blue tit', 'Sparrowhawk'] },
  { name: 'Pond', chain: ['Algae', 'Mosquito larva', 'Dragonfly nymph', 'Small fish', 'Heron'] },
  { name: 'Ocean', chain: ['Phytoplankton', 'Krill', 'Small fish', 'Seal', 'Shark'] },
]

function scrambled(chain: string[]) {
  let s = shuffle(chain)
  while (s.every((x, i) => x === chain[i])) s = shuffle(chain)
  return s
}

export function FoodChain() {
  const game = getGame('food-chain')!
  const [phase, setPhase] = useState<'start' | 'play' | 'done'>('start')
  const [round, setRound] = useState(0)
  const [items, setItems] = useState<string[]>(() => CHAINS[0].chain)
  const [attempts, setAttempts] = useState(0)
  const [checked, setChecked] = useState<boolean[] | null>(null)
  const [solved, setSolved] = useState(false)
  const [score, setScore] = useState(0)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [fb, setFb] = useState<{ state: 'correct' | 'wrong'; text: string } | null>(null)
  const [xp, setXp] = useState(0)

  const C = CHAINS[round]
  const maxScore = CHAINS.length * 30

  function move(from: number, to: number) {
    if (solved || to < 0 || to >= items.length) return
    setChecked(null)
    setItems((arr) => {
      const next = [...arr]
      const [x] = next.splice(from, 1)
      next.splice(to, 0, x)
      return next
    })
  }

  function check() {
    const ok = items.map((x, i) => x === C.chain[i])
    setChecked(ok)
    const n = attempts + 1
    setAttempts(n)
    if (ok.every(Boolean)) {
      const pts = n === 1 ? 30 : n === 2 ? 20 : 10
      setScore((s) => s + pts)
      setSolved(true)
      setFb({ state: 'correct', text: `Perfect chain! +${pts}. Energy flows from the ${C.chain[0].toLowerCase()} (producer) up to the ${C.chain.at(-1)!.toLowerCase()}. Only ~10% of energy passes to each level.` })
      pal.answer('biology', true, 0)
    } else {
      setFb({ state: 'wrong', text: `${ok.filter(Boolean).length}/${items.length} in the right place. Start with the producer — the organism that makes its own food.` })
    }
  }

  function next() {
    if (round + 1 >= CHAINS.length) {
      const earned = Math.round(game.maxXp * (score / maxScore))
      setXp(earned)
      pal.recordGame(game.slug, score, true, earned, { bioAnswered: CHAINS.length })
      setPhase('done')
      return
    }
    const r = round + 1
    setRound(r)
    setItems(scrambled(CHAINS[r].chain))
    setAttempts(0)
    setChecked(null)
    setSolved(false)
    setFb(null)
  }

  function start() {
    setItems(scrambled(CHAINS[0].chain))
    setPhase('play')
  }

  function restart() {
    setRound(0)
    setAttempts(0)
    setChecked(null)
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
            <Stat icon="level" label="Ecosystem" value={`${round + 1}/${CHAINS.length}`} />
            <Stat icon="score" label="Score" value={score} />
          </>
        )
      }
    >
      {phase === 'start' && <StartScreen game={game} rules={['Drag the organisms into order: producer at the top, top predator at the bottom.', 'You can also use the arrow buttons to move cards.', '30 points first try, 20 second try, 10 after that.', 'Later ecosystems have longer chains.']} onStart={start} />}

      {phase === 'play' && (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Ecosystem</p>
            <h2 className="text-xl font-bold">{C.name} food chain</h2>
            <ol className="mt-5 flex flex-col gap-2" aria-label="Food chain order">
              {items.map((name, idx) => (
                <li
                  key={name}
                  draggable={!solved}
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx !== null) move(dragIdx, idx)
                    setDragIdx(null)
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 bg-background px-3 py-3 transition-all',
                    !solved && 'cursor-grab active:cursor-grabbing',
                    dragIdx === idx && 'opacity-50',
                    checked?.[idx] === true && 'border-bio bg-bio-soft',
                    checked?.[idx] === false && 'border-destructive/60 bg-destructive/5',
                  )}
                >
                  <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="flex size-7 items-center justify-center rounded-lg bg-ink font-mono text-xs font-bold text-white">{idx + 1}</span>
                  <span className="flex-1 font-semibold">{name}</span>
                  {solved && <span className="text-xs text-muted-foreground">{ROLES[idx]}</span>}
                  {!solved && (
                    <span className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => move(idx, idx - 1)} disabled={idx === 0} aria-label={`Move ${name} up`}>
                        <ArrowUp />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => move(idx, idx + 1)} disabled={idx === items.length - 1} aria-label={`Move ${name} down`}>
                        <ArrowDown />
                      </Button>
                    </span>
                  )}
                </li>
              ))}
            </ol>
            {!solved && (
              <Button size="xl" className="mt-5 w-full" onClick={check}>
                Check chain
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border bg-card p-6">
              <p className="font-semibold">Energy flow</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-sm">
                {(solved ? C.chain : items.map(() => '?')).map((n, i, arr) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className={cn('rounded-lg px-2.5 py-1 font-medium', solved ? 'bg-bio-soft' : 'bg-muted text-muted-foreground')}>{n}</span>
                    {i < arr.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Arrows in a food chain show the direction energy flows — from the organism eaten to the organism that eats it.</p>
            </div>
            <div className="min-h-16">{fb && <Feedback state={fb.state}>{fb.text}</Feedback>}</div>
            {solved && (
              <Button size="xl" onClick={next}>
                {round + 1 < CHAINS.length ? 'Next ecosystem' : 'See results'} <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === 'done' && <ResultScreen title="Food chain champion!" score={`${score}/${maxScore}`} xp={xp} stars={starsFor(score / maxScore)} onRestart={restart} details="Every chain starts with a producer that captures energy from sunlight through photosynthesis." />}
    </GameFrame>
  )
}
