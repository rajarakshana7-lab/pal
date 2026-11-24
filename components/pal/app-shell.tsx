'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Gamepad2, LayoutDashboard, Menu, Medal, Orbit, Timer, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { levelFromXp } from '@/lib/pal/levels'
import { useHydrated, usePal } from '@/lib/pal/store'
import { cn } from '@/lib/utils'
import { PalLogo } from './logo'
import { LevelBadge, StreakPill, XpBar, XpPill } from './xp'

export const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/challenges', label: 'Daily Challenges', icon: Timer },
  { href: '/games', label: 'Mini-Games', icon: Gamepad2 },
  { href: '/universe', label: 'Learning Universe', icon: Orbit },
  { href: '/achievements', label: 'Achievements', icon: Medal },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-ink text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className="size-4.5" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function PlayerCard() {
  const s = usePal()
  const hydrated = useHydrated()
  const info = levelFromXp(s.xp)
  if (!hydrated) return <div className="h-[104px] rounded-2xl bg-muted/60" />
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <LevelBadge level={info.level} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{s.name || 'Learner'}</p>
          <p className="truncate text-xs text-muted-foreground">{info.title}</p>
        </div>
      </div>
      <XpBar xp={s.xp} className="mt-3" size="sm" />
      <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
        {info.xpIntoLevel} / {info.xpForNext} XP to level {info.level + 1}
      </p>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const s = usePal()
  const hydrated = useHydrated()

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r bg-card/70 p-5 backdrop-blur lg:flex">
        <PalLogo href="/dashboard" />
        <NavLinks />
        <div className="mt-auto">
          <PlayerCard />
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg border lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </button>
        <PalLogo href="/dashboard" className="lg:hidden" />
        <div className="ml-auto flex items-center gap-2">
          {hydrated && (
            <>
              <StreakPill streak={s.streak} />
              <XpPill xp={s.xp} />
              <span className="hidden items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white sm:inline-flex">
                Lv {levelFromXp(s.xp).level}
              </span>
            </>
          )}
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-label="Close navigation" />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <PalLogo href="/dashboard" />
              <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg border" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X className="size-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <PlayerCard />
            </div>
          </div>
        </div>
      )}

      <main className="lg:ml-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-muted-foreground text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
