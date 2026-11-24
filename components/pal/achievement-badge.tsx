import { Calculator, Flame, Footprints, Globe, KeyRound, Leaf, Lock, Star, Target, Trophy, Zap } from 'lucide-react'
import type { Achievement } from '@/lib/pal/achievements'
import { cn } from '@/lib/utils'

const ICONS = {
  footprints: Footprints,
  leaf: Leaf,
  calculator: Calculator,
  target: Target,
  flame: Flame,
  trophy: Trophy,
  zap: Zap,
  star: Star,
  globe: Globe,
  key: KeyRound,
}

const TONES = {
  bio: 'bg-bio-soft text-bio ring-bio/30',
  math: 'bg-math-soft text-math ring-math/30',
  xp: 'bg-xp-soft text-xp-foreground ring-xp/40',
  primary: 'bg-accent text-primary ring-primary/30',
}

export function AchievementIcon({ achievement, unlocked, size = 'md' }: { achievement: Achievement; unlocked: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = unlocked ? ICONS[achievement.icon] : Lock
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl ring-1',
        size === 'sm' ? 'size-9' : size === 'lg' ? 'size-16' : 'size-12',
        unlocked ? TONES[achievement.tone] : 'bg-muted text-muted-foreground ring-border',
      )}
      aria-hidden="true"
    >
      <Icon className={size === 'sm' ? 'size-4' : size === 'lg' ? 'size-7' : 'size-5'} />
    </span>
  )
}
