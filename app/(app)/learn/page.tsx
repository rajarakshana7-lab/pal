import type { Metadata } from 'next'
import { LearnBrowser } from '@/components/learn/learn-browser'

export const metadata: Metadata = { title: 'Learn — PAL' }

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams
  return <LearnBrowser subject={subject === 'mathematics' ? 'mathematics' : 'biology'} />
}
