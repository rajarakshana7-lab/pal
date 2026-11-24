import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Challenges } from '@/components/challenges/challenges'

export const metadata: Metadata = { title: 'Daily Challenges — PAL' }

export default function ChallengesPage() {
  return (
    <Suspense>
      <Challenges />
    </Suspense>
  )
}
