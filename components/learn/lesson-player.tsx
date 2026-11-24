'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Gamepad2, Lightbulb, XCircle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { ResultScreen, starsFor } from '@/components/pal/game-kit'
import { findLesson, SUBJECTS } from '@/lib/pal/curriculum'
import { getGame } from '@/lib/pal/games'
import { pal, usePal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Phase = 'learn' | 'quiz' | 'done'

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const found = findLesson(lessonId)!
  const { module: mod, lesson } = found
  const s = usePal()
  const [phase, setPhase] = useState<Phase>('learn')
  const [card, setCard] = useState(0)
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [hint, setHint] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [earned, setEarned] = useState(0)

  const isBio = mod.subject === 'biology'
  const cards = [...lesson.points, ...(lesson.example ? [{ title: `Worked example: ${lesson.example.title}`, body: lesson.example.body }] : [])]
  const q = lesson.quiz[qi]
  const nextInModule = mod.lessons[mod.lessons.findIndex((l) => l.id === lesson.id) + 1]
  const game = mod.game ? getGame(mod.game) : undefined

  function check() {
    if (picked === null) return
    const ok = picked === q.answer
    setChecked(true)
    if (ok) {
      setCorrect((c) => c + 1)
      const bonus = hint ? 5 : 10
      setEarned((e) => e + bonus)
      pal.answer(mod.subject, true, bonus)
    } else {
      pal.answer(mod.subject, false, 0)
    }
  }

  function next() {
    if (qi + 1 < lesson.quiz.length) {
      setQi(qi + 1)
      setPicked(null)
      setChecked(false)
      setHint(false)
      return
    }
    const pct = Math.round((correct / lesson.quiz.length) * 100)
    const streakBonus = Math.min(s.streak, 7) * 2
    const base = 30 + streakBonus + (pct === 100 ? 20 : 0)
    setEarned((e) => e + base)
    pal.completeLesson(lesson.id, pct, base)
    setPhase('done')
  }

  function restart() {
    setPhase('learn')
    setCard(0)
    setQi(0)
    setPicked(null)
    setChecked(false)
    setHint(false)
    setCorrect(0)
    setEarned(0)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={`/learn?subject=${mod.subject}`} className={buttonVariants({ variant: 'outline', size: 'icon' })} aria-label="Back to modules">
          <ArrowLeft />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            <span className={isBio ? 'text-bio' : 'text-math'}>{SUBJECTS[mod.subject].name}</span> · {mod.title} · <span className="capitalize">{mod.level}</span>
          </p>
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{lesson.title}</h1>
        </div>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {[...cards.map((_, i) => phase !== 'learn' || i <= card), ...lesson.quiz.map((_, i) => phase === 'done' || (phase === 'quiz' && i <= qi))].map((on, i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', on ? (isBio ? 'bg-bio' : 'bg-math') : 'bg-muted')} />
        ))}
      </div>

      {phase === 'learn' && (
        <div className="overflow-hidden rounded-3xl border bg-card">
          {card === 0 && (
            <div className={cn('relative aspect-[16/6]', isBio ? 'bg-bio-soft' : 'bg-math-soft')}>
              <Image src={SUBJECTS[mod.subject].image} alt="" fill className="object-cover" sizes="768px" priority />
            </div>
          )}
          <div className="p-6 sm:p-8">
            {card === 0 && <p className="mb-5 text-lg leading-relaxed text-pretty">{lesson.intro}</p>}
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="size-3.5" aria-hidden="true" /> Concept {card + 1} of {cards.length}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-balance">{cards[card].title}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground text-pretty">{cards[card].body}</p>
            <div className="mt-8 flex justify-between gap-2">
              <Button variant="ghost" size="xl" onClick={() => setCard((c) => c - 1)} disabled={card === 0}>
                <ArrowLeft data-icon="inline-start" /> Back
              </Button>
              {card + 1 < cards.length ? (
                <Button size="xl" onClick={() => setCard((c) => c + 1)}>
                  Next <ArrowRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button size="xl" onClick={() => setPhase('quiz')}>
                  Start quiz <ArrowRight data-icon="inline-end" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'quiz' && q && (
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-primary">
              Question {qi + 1} of {lesson.quiz.length}
            </p>
            <p className="font-mono text-xs text-xp-foreground">+{earned} XP</p>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-balance sm:text-2xl">{q.q}</h2>
          <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Answer options">
            {q.options.map((opt, i) => {
              const isAns = checked && i === q.answer
              const isWrong = checked && picked === i && i !== q.answer
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={picked === i}
                  disabled={checked}
                  onClick={() => setPicked(i)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left font-medium transition-colors',
                    isAns ? 'border-bio bg-bio-soft' : isWrong ? 'border-destructive bg-destructive/5 motion-safe:animate-[pal-shake_0.35s]' : picked === i ? 'border-primary bg-accent' : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background font-mono text-xs">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{opt}</span>
                  {isAns && <CheckCircle2 className="size-5 text-bio" aria-label="Correct answer" />}
                  {isWrong && <XCircle className="size-5 text-destructive" aria-label="Your answer" />}
                </button>
              )
            })}
          </div>
          {hint && !checked && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-xp-soft p-3 text-sm">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-xp" aria-hidden="true" /> {q.hint}
            </p>
          )}
          {checked && (
            <div className={cn('mt-4 rounded-xl p-4 text-sm', picked === q.answer ? 'bg-bio-soft' : 'bg-destructive/5')} role="status">
              <p className="font-semibold">{picked === q.answer ? `Correct! +${hint ? 5 : 10} XP` : 'Not quite.'}</p>
              <p className="mt-1 text-muted-foreground">{q.explanation}</p>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <Button variant="ghost" size="xl" onClick={() => setHint(true)} disabled={checked || hint}>
              <Lightbulb data-icon="inline-start" /> Hint <span className="text-xs text-muted-foreground">(half XP)</span>
            </Button>
            {checked ? (
              <Button size="xl" onClick={next}>
                {qi + 1 < lesson.quiz.length ? 'Next question' : 'Finish lesson'} <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button size="xl" onClick={check} disabled={picked === null}>
                Check answer
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <ResultScreen
          title={correct === lesson.quiz.length ? 'Perfect lesson!' : 'Lesson complete!'}
          score={`${correct}/${lesson.quiz.length}`}
          scoreLabel="Quiz"
          xp={earned}
          stars={starsFor(correct / lesson.quiz.length)}
          onRestart={restart}
          details={
            correct < lesson.quiz.length
              ? 'Revision tip: re-read the concepts you missed, then try again for a perfect score bonus.'
              : 'You earned the perfect-score bonus. Keep the streak going!'
          }
          extra={
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-2">
              {nextInModule && (
                <Link href={`/learn/${nextInModule.id}`} className="flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium hover:bg-muted">
                  Next lesson: {nextInModule.title} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
              {game && (
                <Link href={`/games/${game.slug}`} className="flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium hover:bg-muted">
                  <span className="flex items-center gap-2">
                    <Gamepad2 className="size-4 text-primary" aria-hidden="true" /> Practise: {game.title}
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          }
        />
      )}
    </div>
  )
}
