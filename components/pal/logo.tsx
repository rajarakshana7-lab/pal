import Link from 'next/link'
import { cn } from '@/lib/utils'

export function PalMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex size-8 items-center justify-center rounded-lg bg-ink text-white', className)} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="M5 17 L10 11 L14 14 L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5" cy="17" r="1.8" fill="currentColor" />
        <circle cx="19" cy="7" r="2.4" fill="oklch(0.769 0.165 70.08)" />
      </svg>
    </span>
  )
}

export function PalLogo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 font-semibold tracking-tight text-foreground', className)}>
      <PalMark />
      <span className="text-lg">PAL</span>
    </Link>
  )
}
