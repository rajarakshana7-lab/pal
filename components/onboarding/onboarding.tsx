'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Route, Sparkles, TrendingUp, TriangleAlert, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PalLogo } from '@/components/pal/logo'
import { buildPath, diagnosticQuestions, getModule, LEVELS, SUBJECTS } from '@/lib/pal/curriculum'
import { todayKey } from '@/lib/pal/levels'
import { pal, usePal, type Difficulty, type Subject } from '@/lib/pal/store'
import { cn } from '@/lib/utils'

type Step = 'welcome' | 'subject' | 'level' | 'diagnostic' | 'results'
const STEP_ORDER: Step[] = ['welcome', 'subject', 'level', 'diagnostic', 'results']

export function Onboarding() {
  const router = useRouter()
  const s = usePal()
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState(s.name)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [level, setLevel] = useState<Difficulty | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showHint, setShowHint] = useState(false)

  const questions = useMemo(() => (subject ? diagnosticQuestions(subject) : []), [subject])
  const stepIdx = STEP_ORDER.indexOf(step)

  const result = useMemo(() => {
    if (step !== 'results' || !subject || !level) return null
    const strengths = questions.filter((_, i) => answers[i]).map((q) => q.moduleId)
    const weak = questions.filter((_, i) => !answers[i]).map((q) => q.moduleId)
    return { strengths, weak, path: buildPath(subject, level, weak), score: strengths.length, total: questions.length }
  }, [step, subject, level, questions, answers])

  function submitAnswer() {
    if (picked === null) return
    const correct = picked === questions[qIndex].answer
    setAnswers((a) => [...a, correct])
  }

  function nextQuestion() {
    setPicked(null)
    setShowHint(false)
    if (qIndex + 1 < questions.length) setQIndex(qIndex + 1)
    else setStep('results')
  }

  function finish() {
    if (!subject || !level || !result) return
    pal.setProfile({ name: name.trim() || 'Learner', subject, level })
    pal.saveDiagnostic(
      { subject, score: result.score, total: result.total, strengths: result.strengths, weak: result.weak, path: result.path, date: todayKey() },
      30 + result.score * 10,
    )
    router.push('/dashboard')
  }

  const answered = answers.length > qIndex
  const q = questions[qIndex]

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <PalLogo />
        <div className="flex items-center gap-1.5" aria-label={`Step ${stepIdx + 1} of ${STEP_ORDER.length}`}>
          {STEP_ORDER.map((st, i) => (
            <span key={st} className={cn('h-1.5 rounded-full transition-all', i <= stepIdx ? 'w-8 bg-primary' : 'w-4 bg-muted')} />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        {step === 'welcome' && (
          <section className="rounded-3xl border bg-card p-8 sm:p-10">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-xp-soft">
              <Sparkles className="size-6 text-xp" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">Welcome to PAL!</h1>
            <p className="mt-2 text-muted-foreground text-pretty">
              {"Let's build a learning path that fits you. It takes about two minutes, and you'll earn your first XP along the way."}
            </p>
            <form
              className="mt-8"
              onSubmit={(e) => {
                e.preventDefault()
                setStep('subject')
              }}
            >
              <label htmlFor="learner-name" className="text-sm font-medium">
                What should we call you?
              </label>
              <input
                id="learner-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                autoComplete="given-name"
                maxLength={24}
                className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              />
              <Button type="submit" size="xl" className="mt-6">
                {"Let's go"} <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          </section>
        )}

        {step === 'subject' && (
          <section>
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              Hi {name.trim() || 'there'}! Which subject first?
            </h1>
            <p className="mt-2 text-muted-foreground">You can switch any time — progress in both subjects is saved.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {(['biology', 'mathematics'] as const).map((key) => {
                const subj = SUBJECTS[key]
                const active = subject === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSubject(key)}
                    aria-pressed={active}
                    className={cn(
                      'overflow-hidden rounded-3xl border-2 bg-card text-left transition-all hover:-translate-y-0.5',
                      active ? (key === 'biology' ? 'border-bio shadow-lg' : 'border-math shadow-lg') : 'border-border',
                    )}
                  >
                    <div className={cn('relative aspect-[16/9]', key === 'biology' ? 'bg-bio-soft' : 'bg-math-soft')}>
                      <Image src={subj.image} alt="" fill className="object-cover" sizes="360px" />
                    </div>
                    <div className="p-5">
                      <p className="text-xl font-bold">{subj.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{subj.tagline}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <NavRow onBack={() => setStep('welcome')} onNext={() => setStep('level')} nextDisabled={!subject} />
          </section>
        )}

        {step === 'level' && (
          <section>
            <h1 className="text-3xl font-bold tracking-tight text-balance">How confident are you in {subject && SUBJECTS[subject].name}?</h1>
            <p className="mt-2 text-muted-foreground">{"Be honest — the diagnostic will fine-tune it."}</p>
            <div className="mt-8 grid gap-3">
              {LEVELS.map((lvl, i) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  aria-pressed={level === lvl.id}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border-2 bg-card p-5 text-left transition-colors',
                    level === lvl.id ? 'border-primary bg-accent' : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="flex items-end gap-1" aria-hidden="true">
                    {[0, 1, 2].map((b) => (
                      <span key={b} className={cn('w-2 rounded-sm', b <= i ? 'bg-primary' : 'bg-muted')} style={{ height: 10 + b * 7 }} />
                    ))}
                  </span>
                  <span>
                    <span className="block font-semibold">{lvl.label}</span>
                    <span className="block text-sm text-muted-foreground">{lvl.description}</span>
                  </span>
                </button>
              ))}
            </div>
            <NavRow
              onBack={() => setStep('subject')}
              onNext={() => {
                setQIndex(0)
                setAnswers([])
                setPicked(null)
                setStep('diagnostic')
              }}
              nextDisabled={!level}
              nextLabel="Start diagnostic"
            />
          </section>
        )}

        {step === 'diagnostic' && q && (
          <section>
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-primary">Diagnostic · {q.moduleTitle}</p>
              <p className="font-mono text-muted-foreground">
                {qIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${((qIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
            </div>
            <div className="mt-6 rounded-3xl border bg-card p-6 sm:p-8">
              <h1 className="text-xl font-semibold text-balance sm:text-2xl">{q.q}</h1>
              <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Answer options">
                {q.options.map((opt, i) => {
                  const isCorrect = answered && i === q.answer
                  const isWrong = answered && picked === i && i !== q.answer
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={picked === i}
                      disabled={answered}
                      onClick={() => setPicked(i)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left font-medium transition-colors',
                        isCorrect ? 'border-bio bg-bio-soft' : isWrong ? 'border-destructive bg-destructive/5' : picked === i ? 'border-primary bg-accent' : 'border-border hover:border-primary/40',
                      )}
                    >
                      {opt}
                      {isCorrect && <CheckCircle2 className="size-5 text-bio" aria-label="Correct" />}
                      {isWrong && <XCircle className="size-5 text-destructive" aria-label="Incorrect" />}
                    </button>
                  )
                })}
              </div>
              {showHint && !answered && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-xp-soft p-3 text-sm">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-xp" aria-hidden="true" /> {q.hint}
                </p>
              )}
              {answered && (
                <p className={cn('mt-4 rounded-xl p-3 text-sm', answers[qIndex] ? 'bg-bio-soft' : 'bg-destructive/5')} role="status">
                  <span className="font-semibold">{answers[qIndex] ? 'Correct! ' : 'Not quite. '}</span>
                  {q.explanation}
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-between gap-2">
                <Button variant="ghost" onClick={() => setShowHint(true)} disabled={answered || showHint}>
                  <Lightbulb data-icon="inline-start" /> Hint
                </Button>
                {answered ? (
                  <Button size="xl" onClick={nextQuestion}>
                    {qIndex + 1 < questions.length ? 'Next question' : 'See my results'} <ArrowRight data-icon="inline-end" />
                  </Button>
                ) : (
                  <Button size="xl" onClick={submitAnswer} disabled={picked === null}>
                    Check answer
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 'results' && result && subject && (
          <section>
            <p className="text-sm font-semibold text-primary">Diagnostic complete</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance">
              You scored {result.score} / {result.total} in {SUBJECTS[subject].name}
            </h1>
            <p className="mt-2 text-muted-foreground">{"Here's what PAL learned about you and the path it built."}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-card p-5">
                <p className="flex items-center gap-2 font-semibold">
                  <TrendingUp className="size-4 text-bio" aria-hidden="true" /> Strengths
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {result.strengths.length ? (
                    result.strengths.map((id) => (
                      <li key={id} className="rounded-lg bg-bio-soft px-2.5 py-1 text-sm">
                        {getModule(id)?.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">{"We'll build them together!"}</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <p className="flex items-center gap-2 font-semibold">
                  <TriangleAlert className="size-4 text-xp" aria-hidden="true" /> Focus areas
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {result.weak.length ? (
                    result.weak.map((id) => (
                      <li key={id} className="rounded-lg bg-xp-soft px-2.5 py-1 text-sm">
                        {getModule(id)?.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">No gaps found — impressive!</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border bg-card p-5">
              <p className="flex items-center gap-2 font-semibold">
                <Route className="size-4 text-primary" aria-hidden="true" /> Your personalized learning path
              </p>
              <ol className="mt-4 flex flex-col gap-2">
                {result.path.map((id, i) => {
                  const m = getModule(id)!
                  const weak = result.weak.includes(id)
                  return (
                    <li key={id} className="flex items-center gap-3 rounded-xl border px-3 py-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-ink font-mono text-xs font-bold text-white">{i + 1}</span>
                      <span className="flex-1 font-medium">{m.title}</span>
                      <span className="text-xs capitalize text-muted-foreground">{m.level}</span>
                      {weak && <span className="rounded-full bg-xp-soft px-2 py-0.5 text-[11px] font-semibold text-xp-foreground">Revise</span>}
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink p-5 text-white">
              <p className="font-semibold">+{30 + result.score * 10} XP for completing your diagnostic</p>
              <Button size="xl" className="bg-white text-ink hover:bg-white/90" onClick={finish}>
                Go to my dashboard <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function NavRow({ onBack, onNext, nextDisabled, nextLabel = 'Continue' }: { onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-8 flex justify-between">
      <Button variant="ghost" size="xl" onClick={onBack}>
        <ArrowLeft data-icon="inline-start" /> Back
      </Button>
      <Button size="xl" onClick={onNext} disabled={nextDisabled}>
        {nextLabel} <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}
