'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Clock, Gamepad2, PlayCircle } from 'lucide-react'
import { LEVELS, modulesFor, moduleProgress, SUBJECTS, subjectProgress } from '@/lib/pal/curriculum'
import { getGame } from '@/lib/pal/games'
import { useHydrated, usePal, type Subject } from '@/lib/pal/store'
import { cn } from '@/lib/utils'
import { ProgressRing } from '@/components/pal/xp'

export function LearnBrowser({ subject }: { subject: Subject }) {
  const router = useRouter()
  const s = usePal()
  const hydrated = useHydrated()
  const completed = hydrated ? s.completedLessons : []
  const weak = hydrated ? (s.diagnostics[subject]?.weak ?? []) : []
  const isBio = subject === 'biology'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Learn</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{SUBJECTS[subject].name}</h1>
          <p className="mt-1 text-muted-foreground">{SUBJECTS[subject].tagline}</p>
        </div>
        <div className="inline-flex rounded-xl border bg-card p-1" role="tablist" aria-label="Subject">
          {(['biology', 'mathematics'] as const).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={subject === key}
              onClick={() => router.replace(`/learn?subject=${key}`, { scroll: false })}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                subject === key ? (key === 'biology' ? 'bg-bio text-white' : 'bg-math text-white') : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {SUBJECTS[key].name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
        <ProgressRing value={subjectProgress(subject, completed).pct} tone={isBio ? 'bio' : 'math'}>
          {subjectProgress(subject, completed).pct}%
        </ProgressRing>
        <div>
          <p className="font-semibold">
            {subjectProgress(subject, completed).done} of {subjectProgress(subject, completed).total} lessons complete
          </p>
          <p className="text-sm text-muted-foreground">Each lesson: short explanation → worked example → quiz with hints. Earn XP and bonus XP for correct answers.</p>
        </div>
      </div>

      {LEVELS.map((lvl) => {
        const mods = modulesFor(subject).filter((m) => m.level === lvl.id)
        if (!mods.length) return null
        return (
          <section key={lvl.id} aria-labelledby={`lvl-${lvl.id}`}>
            <div className="mb-3 flex items-baseline gap-3">
              <h2 id={`lvl-${lvl.id}`} className="text-lg font-bold">
                {lvl.label}
              </h2>
              <p className="text-sm text-muted-foreground">{lvl.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {mods.map((m) => {
                const mp = moduleProgress(m, completed)
                const game = m.game ? getGame(m.game) : undefined
                return (
                  <article key={m.id} className="flex flex-col rounded-3xl border bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{m.title}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{m.summary}</p>
                      </div>
                      {weak.includes(m.id) && <span className="shrink-0 rounded-full bg-xp-soft px-2 py-0.5 text-[11px] font-semibold text-xp-foreground">Focus area</span>}
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn('h-full rounded-full transition-all', isBio ? 'bg-bio' : 'bg-math')} style={{ width: `${mp.pct}%` }} />
                    </div>
                    <ul className="mt-4 flex flex-col gap-1">
                      {m.lessons.map((l) => {
                        const done = completed.includes(l.id)
                        return (
                          <li key={l.id}>
                            <Link href={`/learn/${l.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted">
                              {done ? <CheckCircle2 className="size-4.5 text-bio" aria-label="Completed" /> : <Circle className="size-4.5 text-muted-foreground" aria-label="Not started" />}
                              <span className="flex-1 text-sm font-medium">{l.title}</span>
                              {hydrated && s.lessonScores[l.id] !== undefined && <span className="font-mono text-xs text-muted-foreground">{s.lessonScores[l.id]}%</span>}
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="size-3" aria-hidden="true" /> {l.minutes}m
                              </span>
                              <PlayCircle className="size-4 text-primary" aria-hidden="true" />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                    {game && (
                      <Link href={`/games/${game.slug}`} className="mt-auto flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 pt-2.5 text-sm font-medium transition-colors hover:bg-muted">
                        <Gamepad2 className="size-4 text-primary" aria-hidden="true" />
                        Practise with {game.title}
                      </Link>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
