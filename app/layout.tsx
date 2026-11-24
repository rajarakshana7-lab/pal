import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Celebrations } from '@/components/pal/celebrations'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-face' })

export const metadata: Metadata = {
  title: 'PAL — Personalized Adaptive Learning | Biology & Mathematics',
  description:
    'PAL is a gamified, adaptive learning platform for Biology and Mathematics. Earn XP, play interactive mini-games, take daily challenges and follow a personalized learning path.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} bg-background`}>
      <body className="antialiased">
        {children}
        <Celebrations />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
