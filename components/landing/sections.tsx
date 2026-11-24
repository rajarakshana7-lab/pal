import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, Brain, ClipboardCheck, Flame, Gamepad2, Lightbulb, Medal, Route, Target, Timer, Trophy, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { LEVELS, MODULES, SUBJECTS } from '@/lib/pal/curriculum'
import { GAMES } from '@/lib/pal/games'
import { cn } from '@/lib/utils'

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground text-pretty">{description}</p>
    </div>
  )
}

const STEPS = [
  { icon: Brain, title: 'Pick your subject', body: 'Choose Biology or Mathematics and tell PAL your current level.' },
  { icon: ClipboardCheck, title: 'Quick diagnostic', body: 'A short adaptive check finds your strengths and weak areas.' },
  { icon: Route, title: 'Personal path', body: 'PAL orders modules so you fix gaps first, then stretch further.' },
  { icon: Gamepad2, title: 'Learn by playing', body: 'Lessons, quizzes and mini-games earn XP, badges and streaks.' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <SectionHeading eyebrow="How PAL works" title="A learning path that adjusts to you" description="Every learner starts in a different place. PAL meets you there and builds a route forward." />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Subjects() {
  return (
    <section id="subjects" className="scroll-mt-20 border-b bg-card py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <SectionHeading eyebrow="Two subjects, mastered deeply" title="Biology and Mathematics" description="PAL focuses on two subjects only, so every lesson, game and challenge is crafted with care." />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {(['biology', 'mathematics'] as const).map((key) => {
            const subj = SUBJECTS[key]
            const mods = MODULES.filter((m) => m.subject === key)
            const isBio = key === 'biology'
            return (
              <article key={key} className="overflow-hidden rounded-3xl border bg-background">
                <div className={cn('relative aspect-[16/8]', isBio ? 'bg-bio-soft' : 'bg-math-soft')}>
                  <Image src={subj.image} alt={`${subj.name} illustration`} fill className="object-cover" sizes="(min-width: 1024px) 560px, 100vw" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{subj.name}</h3>
                    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', isBio ? 'bg-bio-soft text-bio' : 'bg-math-soft text-math')}>{mods.length} modules</span>
                  </div>
                  <p className="mt-1.5 text-muted-foreground">{subj.tagline}</p>
                  <div className="mt-5 flex flex-col gap-3">
                    {LEVELS.map((lvl) => (
                      <div key={lvl.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                        <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{lvl.label}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {mods
                            .filter((m) => m.level === lvl.id)
                            .map((m) => (
                              <span key={m.id} className="rounded-lg border bg-card px-2.5 py-1 text-sm">
                                {m.title}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href={`/learn?subject=${key}`} className={buttonVariants({ variant: 'outline', size: 'lg', className: 'mt-6' })}>
                    Explore {subj.name} <ArrowRight data-icon="inline-end" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function GamesShowcase() {
  return (
    <section id="games" className="scroll-mt-20 border-b py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <SectionHeading eyebrow="Learn by playing" title="10 playable mini-games" description="Not decorative cards — real games with drag-and-drop, timers, scoring, hints and level progression." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GAMES.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className={cn(
                'group flex flex-col rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg',
                g.featured && 'lg:col-span-1 ring-1 ring-xp/50',
              )}
            >
              <span className={cn('w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', g.subject === 'biology' ? 'bg-bio-soft text-bio' : 'bg-math-soft text-math')}>
                {g.subject === 'biology' ? 'Biology' : 'Maths'}
              </span>
              <h3 className="mt-3 font-semibold leading-snug">{g.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.tagline}</p>
              <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-xp-foreground">
                <Zap className="size-3.5 fill-xp text-xp" aria-hidden="true" /> {g.maxXp} XP
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

const GAMIFY = [
  { icon: Zap, title: 'XP & Levels', body: 'Earn XP for lessons, correct answers and streak bonuses. Climb 10 titled levels.' },
  { icon: Timer, title: 'Daily Challenges', body: 'Five fresh timed challenges every day with difficulty that grows with you.' },
  { icon: Flame, title: 'Streaks', body: 'Learn a little every day to keep your flame alive and unlock Consistency Champion.' },
  { icon: Medal, title: 'Achievements', body: 'Collect badges like Biology Explorer, Math Master and Perfect Score.' },
  { icon: Trophy, title: 'Leaderboard', body: 'See how you rank this week and all-time against other PAL learners.' },
  { icon: BarChart3, title: 'Progress insights', body: 'Weekly activity charts, subject progress and smart revision tips.' },
]

export function WhyPal() {
  return (
    <section id="why-pal" className="scroll-mt-20 border-b bg-card py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <SectionHeading eyebrow="Why PAL" title="Feels like a game. Works like a tutor." description="Gamification keeps motivation high, while adaptive learning makes every minute count." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMIFY.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-background p-6">
              <f.icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function UniverseTeaser() {
  return (
    <section className="border-b py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="grid items-center overflow-hidden rounded-3xl bg-ink text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <p className="text-sm font-semibold text-xp">Featured experiences</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">Enter the PAL Learning Universe</h2>
            <p className="mt-3 text-white/70 text-pretty">
              Travel between learning worlds as you level up. Zoom inside a 3D cell, break out of the Math Escape Room, and unlock new planets with every milestone.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-sm">
              {[
                { icon: Target, t: '3D Biology Explorer — rotate, zoom and discover organelles' },
                { icon: Lightbulb, t: 'Math Escape Room — collect keys, crack the door codes' },
                { icon: Route, t: 'Learning Universe — worlds unlock as your level grows' },
              ].map((i) => (
                <li key={i.t} className="flex items-center gap-3">
                  <i.icon className="size-4 shrink-0 text-xp" aria-hidden="true" />
                  {i.t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/universe" className={buttonVariants({ size: 'xl', className: 'bg-white text-ink hover:bg-white/90' })}>
                Explore the universe
              </Link>
              <Link href="/games/cell-explorer-3d" className={buttonVariants({ variant: 'ghost', size: 'xl', className: 'text-white hover:bg-white/10 hover:text-white' })}>
                Try 3D Explorer <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <Image src="/images/universe.jpg" alt="Illustration of floating learning planets connected by glowing paths" fill className="object-cover" sizes="(min-width: 1024px) 560px, 100vw" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">Ready to level up your learning?</h2>
        <p className="mt-3 text-muted-foreground">It takes two minutes to set up your personalized path. No account needed to try.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/start" className={buttonVariants({ size: 'xl' })}>
            Start Learning <ArrowRight data-icon="inline-end" />
          </Link>
          <Link href="/challenges" className={buttonVariants({ variant: 'outline', size: 'xl' })}>
            {"Try today's challenge"}
          </Link>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row lg:px-6">
        <p>© 2026 PAL — Personalized Adaptive Learning</p>
        <p>Biology · Mathematics</p>
      </div>
    </footer>
  )
}
