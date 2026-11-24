'use client'

import Link from 'next/link'
import { ArrowRight, CalendarCheck, Flame, Gamepad2, Medal, Play, Sparkles, Target, Timer, Zap } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { AchievementIcon } from '@/components/pal/achievement-badge'
import { LevelBadge, ProgressRing, XpBar } from '@/components/pal/xp'
import { ACHIEVEMENTS, isUnlocked } from '@/lib/pal/achievements'
import { getModule, nextLesson, SUBJECTS, subjectProgress, modulesFor, moduleProgress } from '@/lib/pal/curriculum'
import { dailyChallenges } from '@/lib/pal/daily'
import { GAMES } from '@/lib/pal/games'
import { lastNDays, levelFromXp, todayKey } from '@/lib/pal/levels'
import { pal, useHydrated, usePal, type PalState, type Subject } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-3xl border bg-card p-5 sm:p-6', className)}>{children}</section>
}

function CardTitle({ icon: Icon, children, action }: { icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        {children}
      </h2>
      {action}
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function Dashboard() {
  const s = usePal()
  const hydrated = useHydrated()
  if (!hydrated) return <div className="h-[70vh] animate-pulse rounded-3xl bg-muted/50" />
  return (
    <div className="flex flex-col gap-5">
      {!s.onboarded && <OnboardBanner />}
      <HeroRow s={s} />
      <div className="grid gap-5 lg:grid-cols-2">
        <SubjectCard s={s} subject="biology" />
        <SubjectCard s={s} subject="mathematics" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <ContinueLearning s={s} />
        <TodayChallenges s={s} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <WeeklyChart s={s} />
        <Milestones s={s} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <RecommendedGames s={s} />
        <RecentAchievements s={s} />
      </div>
    </div>
  )
}

function OnboardBanner() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-primary/30 bg-accent p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">{"Let's personalize PAL for you"}</p>
        <p className="text-sm text-muted-foreground">Take the 2-minute diagnostic to build your learning path — or load a demo learner to explore.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="xl" onClick={() => pal.loadDemo()}>
          Load demo
        </Button>
        <Link href="/start" className={buttonVariants({ size: 'xl' })}>
          Start diagnostic
        </Link>
      </div>
    </div>
  )
}

function HeroRow({ s }: { s: PalState }) {
  const info = levelFromXp(s.xp)
  const overall = Math.round((subjectProgress('biology', s.completedLessons).pct + subjectProgress('mathematics', s.completedLessons).pct) / 2)
  const todayXp = s.activity[todayKey()] ?? 0
  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-xp/20 blur-3xl" />
        <p className="text-sm text-white/60">{greeting()},</p>
        <h1 className="text-3xl font-bold tracking-tight text-balance">{s.name || 'Learner'} 👋</h1>
        <div className="mt-6 flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-mono text-2xl font-bold ring-2 ring-xp">{info.level}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-semibold">{info.title}</p>
              <p className="font-mono text-xs text-white/60">
                {info.xpIntoLevel}/{info.xpForNext} XP
              </p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-xp to-amber-300 transition-[width] duration-700" style={{ width: `${Math.max(2, info.progress * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/60">{info.xpForNext - info.xpIntoLevel} XP until level {info.level + 1}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Total XP', value: s.xp.toLocaleString(), icon: Zap },
            { label: 'Today', value: `+${todayXp}`, icon: Sparkles },
            { label: 'Lessons', value: s.completedLessons.length, icon: Target },
          ].map((x) => (
            <div key={x.label} className="rounded-2xl bg-white/5 p-3">
              <x.icon className="size-4 text-xp" aria-hidden="true" />
              <p className="mt-1.5 font-mono text-lg font-bold">{x.value}</p>
              <p className="text-xs text-white/60">{x.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        <Card className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
            <Flame className={cn('size-7', s.streak > 0 ? 'fill-orange-500 text-orange-500 motion-safe:animate-pulse' : 'text-orange-300')} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Daily streak</p>
            <p className="text-2xl font-bold">
              {s.streak} day{s.streak === 1 ? '' : 's'}
            </p>
            <div className="mt-2 flex gap-1" aria-label="Last 7 days activity">
              {lastNDays(7).map((d) => (
                <span key={d} className={cn('h-1.5 flex-1 rounded-full', (s.activity[d] ?? 0) > 0 ? 'bg-orange-500' : 'bg-muted')} />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Best: {s.bestStreak} days · streak bonus +{Math.min(s.streak, 7) * 2} XP per lesson</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <ProgressRing value={overall} size={64} stroke={7}>
            {overall}%
          </ProgressRing>
          <div>
            <p className="text-sm text-muted-foreground">Overall progress</p>
            <p className="text-lg font-bold">Biology & Mathematics</p>
            <p className="text-xs text-muted-foreground">Across all 14 modules</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function SubjectCard({ s, subject }: { s: PalState; subject: Subject }) {
  const subj = SUBJECTS[subject]
  const p = subjectProgress(subject, s.completedLessons)
  const isBio = subject === 'biology'
  const mods = modulesFor(subject)
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', isBio ? 'bg-bio-soft text-bio' : 'bg-math-soft text-math')}>{subj.name}</span>
          <p className="mt-2 text-2xl font-bold">{p.pct}% complete</p>
          <p className="text-sm text-muted-foreground">
            {p.done} of {p.total} lessons
          </p>
        </div>
        <ProgressRing value={p.pct} tone={isBio ? 'bio' : 'math'} size={60}>
          {p.pct}%
        </ProgressRing>
      </div>
      <ul className="mt-5 grid grid-cols-7 gap-1.5" aria-label={`${subj.name} modules`}>
        {mods.map((m) => {
          const mp = moduleProgress(m, s.completedLessons)
          return (
            <li key={m.id} title={`${m.title}: ${mp.done}/${mp.total}`}>
              <div className="h-10 overflow-hidden rounded-lg bg-muted">
                <div className={cn('w-full rounded-lg transition-all', isBio ? 'bg-bio' : 'bg-math')} style={{ height: `${mp.pct}%`, marginTop: `${100 - mp.pct}%` }} />
              </div>
              <span className="sr-only">
                {m.title} {mp.pct}%
              </span>
            </li>
          )
        })}
      </ul>
      <Link href={`/learn?subject=${subject}`} className={buttonVariants({ variant: 'outline', size: 'lg', className: 'mt-5 w-full' })}>
        Open {subj.name} <ArrowRight data-icon="inline-end" />
      </Link>
    </Card>
  )
}

function ContinueLearning({ s }: { s: PalState }) {
  const subjects: Subject[] = s.subject === 'mathematics' ? ['mathematics', 'biology'] : ['biology', 'mathematics']
  const items = subjects.map((sub) => ({ sub, next: nextLesson(sub, s.completedLessons, s.diagnostics[sub]?.path) })).filter((x) => x.next)
  const weak = subjects.flatMap((sub) => s.diagnostics[sub]?.weak ?? []).filter((id) => {
    const m = getModule(id)
    return m && moduleProgress(m, s.completedLessons).pct < 100
  })
  return (
    <Card>
      <CardTitle icon={Play}>Continue learning</CardTitle>
      <div className="flex flex-col gap-3">
        {items.map(({ sub, next }) => {
          const isBio = sub === 'biology'
          const mp = moduleProgress(next!.module, s.completedLessons)
          return (
            <Link key={sub} href={`/learn/${next!.lesson.id}`} className="group flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
              <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl text-white', isBio ? 'bg-bio' : 'bg-math')}>
                <Play className="size-5 fill-white" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  {SUBJECTS[sub].name} · {next!.module.title}
                </p>
                <p className="truncate font-semibold">{next!.lesson.title}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full rounded-full', isBio ? 'bg-bio' : 'bg-math')} style={{ width: `${Math.max(4, mp.pct)}%` }} />
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )
        })}
        {items.length === 0 && <p className="text-sm text-muted-foreground">You have completed every lesson. Incredible work!</p>}
      </div>
      {weak.length > 0 && (
        <div className="mt-4 rounded-2xl bg-xp-soft p-4">
          <p className="text-sm font-semibold text-xp-foreground">Revision recommended</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Based on your diagnostic: {weak.slice(0, 3).map((id) => getModule(id)?.title).join(', ')}
          </p>
        </div>
      )}
    </Card>
  )
}

function TodayChallenges({ s }: { s: PalState }) {
  const today = todayKey()
  const list = dailyChallenges(today, levelFromXp(s.xp).level)
  const done = s.daily[today] ?? {}
  const count = Object.keys(done).length
  return (
    <Card>
      <CardTitle
        icon={Timer}
        action={
          <span className="font-mono text-xs text-muted-foreground">
            {count}/{list.length} done
          </span>
        }
      >
        {"Today's challenges"}
      </CardTitle>
      <ul className="flex flex-col gap-2">
        {list.map((c) => {
          const finished = c.id in done
          return (
            <li key={c.id}>
              <Link href={`/challenges?play=${c.id}`} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors hover:bg-muted/50">
                <CalendarCheck className={cn('size-4 shrink-0', finished ? 'text-bio' : 'text-muted-foreground')} aria-hidden="true" />
                <span className={cn('flex-1 truncate text-sm font-medium', finished && 'text-muted-foreground line-through')}>{c.title}</span>
                <span className="text-xs font-semibold text-xp-foreground">+{c.xp}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <Link href="/challenges" className={buttonVariants({ size: 'lg', className: 'mt-4 w-full' })}>
        Go to challenges
      </Link>
    </Card>
  )
}

function WeeklyChart({ s }: { s: PalState }) {
  const days = lastNDays(7)
  const values = days.map((d) => s.activity[d] ?? 0)
  const max = Math.max(50, ...values)
  const total = values.reduce((a, b) => a + b, 0)
  return (
    <Card>
      <CardTitle icon={Zap} action={<span className="font-mono text-xs text-muted-foreground">{total} XP this week</span>}>
        Weekly learning activity
      </CardTitle>
      <div className="flex h-48 items-end gap-2 sm:gap-3" role="img" aria-label={`XP earned over the last 7 days: ${values.join(', ')}`}>
        {days.map((d, i) => {
          const isToday = d === todayKey()
          const h = (values[i] / max) * 100
          return (
            <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">{values[i] || ''}</span>
              <div className="flex w-full flex-1 items-end">
                <div className={cn('w-full rounded-t-lg transition-all duration-700', isToday ? 'bg-xp' : 'bg-primary/80')} style={{ height: `${Math.max(values[i] ? 6 : 2, h)}%` }} />
              </div>
              <span className={cn('text-xs', isToday ? 'font-semibold' : 'text-muted-foreground')}>
                {new Date(`${d}T00:00:00`).toLocaleDateString('en', { weekday: 'short' })}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Milestones({ s }: { s: PalState }) {
  const upcoming = ACHIEVEMENTS.filter((a) => !isUnlocked(a, s))
    .map((a) => ({ a, p: a.progress(s) }))
    .sort((x, y) => y.p.current / y.p.target - x.p.current / x.p.target)
    .slice(0, 4)
  const info = levelFromXp(s.xp)
  return (
    <Card>
      <CardTitle icon={Target}>Upcoming milestones</CardTitle>
      <ul className="flex flex-col gap-4">
        <li className="flex items-center gap-3">
          <LevelBadge level={info.level + 1} className="size-9 text-xs" />
          <div className="flex-1">
            <p className="text-sm font-medium">Reach level {info.level + 1}</p>
            <XpBar xp={s.xp} size="sm" className="mt-1.5" />
          </div>
        </li>
        {upcoming.map(({ a, p }) => (
          <li key={a.id} className="flex items-center gap-3">
            <AchievementIcon achievement={a} unlocked={false} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.min(p.current, p.target)}/{p.target}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(Math.min(p.current, p.target) / p.target) * 100}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function RecommendedGames({ s }: { s: PalState }) {
  const weak = new Set([...(s.diagnostics.biology?.weak ?? []), ...(s.diagnostics.mathematics?.weak ?? [])])
  const ranked = [...GAMES].sort((a, b) => {
    const score = (g: (typeof GAMES)[number]) => (weak.has(g.module) ? 0 : 2) + (s.games[g.slug]?.plays ? 1 : 0) - (g.subject === s.subject ? 0.5 : 0)
    return score(a) - score(b)
  })
  return (
    <Card>
      <CardTitle
        icon={Gamepad2}
        action={
          <Link href="/games" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        }
      >
        Recommended mini-games
      </CardTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {ranked.slice(0, 4).map((g) => {
          const stat = s.games[g.slug]
          return (
            <Link key={g.slug} href={`/games/${g.slug}`} className="group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', g.subject === 'biology' ? 'bg-bio-soft text-bio' : 'bg-math-soft text-math')}>
                  {g.subject === 'biology' ? 'Biology' : 'Maths'}
                </span>
                {weak.has(g.module) && <span className="text-[11px] font-semibold text-xp-foreground">Fixes a gap</span>}
              </div>
              <p className="mt-2 font-semibold">{g.title}</p>
              <p className="text-sm text-muted-foreground">{g.tagline}</p>
              <p className="mt-3 text-xs text-muted-foreground">{stat?.plays ? `Best ${stat.best} · ${stat.plays} plays` : `Up to ${g.maxXp} XP`}</p>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

function RecentAchievements({ s }: { s: PalState }) {
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).sort((a, b) => (s.achievements[b.id] ?? '').localeCompare(s.achievements[a.id] ?? ''))
  return (
    <Card>
      <CardTitle
        icon={Medal}
        action={
          <span className="font-mono text-xs text-muted-foreground">
            {unlocked.length}/{ACHIEVEMENTS.length}
          </span>
        }
      >
        Recent achievements
      </CardTitle>
      {unlocked.length === 0 ? (
        <p className="text-sm text-muted-foreground">Complete your first lesson to earn the First Steps badge.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {unlocked.slice(0, 4).map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <AchievementIcon achievement={a} unlocked size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">{a.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/achievements" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'mt-4 w-full' })}>
        All badges
      </Link>
    </Card>
  )
}
