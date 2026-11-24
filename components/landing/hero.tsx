import Link from 'next/link'
import { ArrowRight, Check, Flame, Gamepad2, Sparkles, Trophy, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-6 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            PAL · Biology & Mathematics, gamified
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl">
            Learn Smarter.
            <br />
            <span className="text-primary">Level Up.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
            PAL turns Biology and Mathematics into a game you actually want to play. Earn XP, beat daily challenges, master playable mini-games and follow a learning path built around you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/start" className={buttonVariants({ size: 'xl' })}>
              Start Learning <ArrowRight data-icon="inline-end" />
            </Link>
            <Link href="/games" className={buttonVariants({ variant: 'outline', size: 'xl' })}>
              <Gamepad2 data-icon="inline-start" /> Play a game
            </Link>
          </div>
          <ul className="mt-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {['Adaptive diagnostic', 'Personal learning path', '10 playable mini-games', 'XP, badges & streaks'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-4 text-bio" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-3xl border bg-card p-4 shadow-xl shadow-ink/5">
            <div className="flex items-center gap-1.5 border-b pb-3">
              <span className="size-2.5 rounded-full bg-muted" />
              <span className="size-2.5 rounded-full bg-muted" />
              <span className="size-2.5 rounded-full bg-muted" />
              <span className="ml-3 text-xs text-muted-foreground">pal.app/dashboard</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl bg-ink p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-white/60">Level 7 · Theory Crafter</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    <Flame className="size-3 fill-orange-400 text-orange-400" aria-hidden="true" /> 6
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">Biology · Genetics</p>
                <p className="font-semibold">Mendelian Inheritance</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-xp to-amber-300" />
                </div>
                <p className="mt-2 font-mono text-xs text-white/60">340 / 500 XP</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border p-4">
                  <p className="text-xs text-muted-foreground">Daily challenge</p>
                  <p className="mt-0.5 text-sm font-semibold">Math Sprint</p>
                  <p className="mt-2 font-mono text-lg font-bold text-math">2:41</p>
                </div>
                <div className="rounded-2xl border bg-xp-soft p-4">
                  <p className="flex items-center gap-1 text-xs font-semibold text-xp-foreground">
                    <Trophy className="size-3.5" aria-hidden="true" /> Badge unlocked
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">Perfect Score</p>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { v: '1,240', l: 'Total XP' },
                { v: '62%', l: 'Biology' },
                { v: '48%', l: 'Maths' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border p-3">
                  <p className="font-mono text-lg font-bold">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -left-4 -top-4 hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-semibold shadow-lg sm:flex motion-safe:animate-[pal-float-up_3s_ease-in-out_infinite_alternate]">
            <Zap className="size-4 fill-xp text-xp" aria-hidden="true" /> +40 XP
          </div>
          <div className="absolute -bottom-4 -right-2 hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-semibold shadow-lg sm:flex">
            <Sparkles className="size-4 text-primary" aria-hidden="true" /> Level up!
          </div>
        </div>
      </div>
    </section>
  )
}
