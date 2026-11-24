'use client'

import { Flame, Zap } from 'lucide-react'
import { levelFromXp } from '@/lib/pal/levels'
import { cn } from '@/lib/utils'

export function XpBar({ xp, className, size = 'md' }: { xp: number; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const info = levelFromXp(xp)
  const pct = Math.round(info.progress * 100)
  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('relative w-full overflow-hidden rounded-full bg-muted', size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5')}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={info.xpForNext}
        aria-valuenow={info.xpIntoLevel}
        aria-label={`Level ${info.level} progress`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-xp to-amber-400 transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
        {size === 'lg' && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.45)_50%,transparent_70%)] bg-[length:200%_100%] motion-safe:animate-[shimmer_2.4s_linear_infinite]" />
        )}
      </div>
    </div>
  )
}

export function LevelBadge({ level, className }: { level: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-sm font-bold text-white ring-2 ring-xp/70 ring-offset-2 ring-offset-background',
        className,
      )}
      aria-label={`Level ${level}`}
    >
      {level}
    </span>
  )
}

export function XpPill({ xp, className }: { xp: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-xp-soft px-2.5 py-1 text-xs font-semibold text-xp-foreground', className)}>
      <Zap className="size-3.5 fill-xp text-xp" aria-hidden="true" />
      {xp.toLocaleString()} XP
    </span>
  )
}

export function StreakPill({ streak, className }: { streak: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700', className)}>
      <Flame className={cn('size-3.5', streak > 0 ? 'fill-orange-500 text-orange-500' : 'text-orange-400')} aria-hidden="true" />
      {streak} day{streak === 1 ? '' : 's'}
    </span>
  )
}

export function ProgressRing({ value, size = 56, stroke = 6, tone = 'primary', children }: { value: number; size?: number; stroke?: number; tone?: 'primary' | 'bio' | 'math' | 'xp'; children?: React.ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = { primary: 'stroke-primary', bio: 'stroke-bio', math: 'stroke-math', xp: 'stroke-xp' }[tone]
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn('fill-none transition-[stroke-dashoffset] duration-700', color)}
          strokeDasharray={c}
          strokeDashoffset={c - (Math.min(100, value) / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{children}</div>
    </div>
  )
}
