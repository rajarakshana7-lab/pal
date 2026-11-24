import { Hero } from '@/components/landing/hero'
import { FinalCta, GamesShowcase, HowItWorks, SiteFooter, Subjects, UniverseTeaser, WhyPal } from '@/components/landing/sections'
import { SiteHeader } from '@/components/landing/site-header'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Subjects />
        <GamesShowcase />
        <UniverseTeaser />
        <WhyPal />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
