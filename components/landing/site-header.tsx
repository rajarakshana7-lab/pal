import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { PalLogo } from '@/components/pal/logo'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#subjects', label: 'Subjects' },
  { href: '#games', label: 'Games' },
  { href: '#why-pal', label: 'Why PAL' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <PalLogo />
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'lg', className: 'hidden sm:inline-flex' })}>
            Dashboard
          </Link>
          <Link href="/start" className={buttonVariants({ size: 'lg', className: 'px-4' })}>
            Start Learning
          </Link>
        </div>
      </div>
    </header>
  )
}
