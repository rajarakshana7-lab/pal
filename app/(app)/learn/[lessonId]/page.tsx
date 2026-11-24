import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/learn/lesson-player'
import { findLesson } from '@/lib/pal/curriculum'

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }): Promise<Metadata> {
  const { lessonId } = await params
  const found = findLesson(lessonId)
  return { title: found ? `${found.lesson.title} — PAL` : 'Lesson — PAL' }
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  if (!findLesson(lessonId)) notFound()
  return <LessonPlayer key={lessonId} lessonId={lessonId} />
}
