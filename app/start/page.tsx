import type { Metadata } from 'next'
import { Onboarding } from '@/components/onboarding/onboarding'

export const metadata: Metadata = { title: 'Get started — PAL' }

export default function StartPage() {
  return <Onboarding />
}
