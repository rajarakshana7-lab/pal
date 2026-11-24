import type { Subject } from './store'

export type GameMeta = {
  slug: string
  title: string
  subject: Subject
  tagline: string
  description: string
  skills: string[]
  maxXp: number
  minutes: number
  featured?: boolean
  module: string
}

export const GAMES: GameMeta[] = [
  {
    slug: 'cell-explorer-3d',
    title: '3D Biology Explorer',
    subject: 'biology',
    tagline: 'Fly inside a living cell',
    description: 'Rotate and zoom a 3D animal cell. Click each organelle to discover its function, then test yourself in Quiz Mode.',
    skills: ['Organelles', 'Cell structure'],
    maxXp: 120,
    minutes: 5,
    featured: true,
    module: 'cell-biology',
  },
  {
    slug: 'cell-builder',
    title: 'Cell Builder',
    subject: 'biology',
    tagline: 'Drag organelles into place',
    description: 'Build an animal cell by dragging each organelle to its correct position. Learn what each one does as you place it.',
    skills: ['Organelles', 'Functions'],
    maxXp: 100,
    minutes: 4,
    module: 'cell-biology',
  },
  {
    slug: 'body-explorer',
    title: 'Human Body Explorer',
    subject: 'biology',
    tagline: 'Find the organs against the clock',
    description: 'Locate organs on the body map before time runs out. Use hints if you get stuck — but they cost points.',
    skills: ['Anatomy', 'Organ systems'],
    maxXp: 100,
    minutes: 3,
    module: 'human-anatomy',
  },
  {
    slug: 'genetics',
    title: 'Genetics Challenge',
    subject: 'biology',
    tagline: 'Solve Punnett square puzzles',
    description: 'Fill in missing genotypes in Punnett squares, then predict the inheritance outcome for each cross.',
    skills: ['Alleles', 'Inheritance ratios'],
    maxXp: 120,
    minutes: 5,
    module: 'genetics',
  },
  {
    slug: 'food-chain',
    title: 'Food Chain Quest',
    subject: 'biology',
    tagline: 'Arrange who eats whom',
    description: 'Arrange organisms from producer to top predator across three ecosystems with growing chain length.',
    skills: ['Trophic levels', 'Energy flow'],
    maxXp: 90,
    minutes: 3,
    module: 'ecology',
  },
  {
    slug: 'escape-room',
    title: 'Math Escape Room',
    subject: 'mathematics',
    tagline: 'Collect keys, crack codes, escape',
    description: 'Solve puzzles in each room to collect key digits, enter the door code and escape all three rooms on your mission.',
    skills: ['Mixed problem solving', 'Logic'],
    maxXp: 150,
    minutes: 8,
    featured: true,
    module: 'algebra',
  },
  {
    slug: 'math-speed',
    title: 'Math Speed Challenge',
    subject: 'mathematics',
    tagline: '60 seconds. How many can you solve?',
    description: 'Answer arithmetic questions against the clock. Difficulty ramps up with every correct streak — speed earns bonus XP.',
    skills: ['Mental arithmetic', 'Speed'],
    maxXp: 120,
    minutes: 1,
    module: 'arithmetic',
  },
  {
    slug: 'equation-escape',
    title: 'Equation Escape',
    subject: 'mathematics',
    tagline: 'Solve to unlock each stage',
    description: 'Every correct solution unlocks the next door. Equations grow from one-step to two-sided and quadratic.',
    skills: ['Linear equations', 'Quadratics'],
    maxXp: 120,
    minutes: 5,
    module: 'algebra',
  },
  {
    slug: 'geometry-puzzle',
    title: 'Geometry Puzzle',
    subject: 'mathematics',
    tagline: 'Shape it, then solve it',
    description: 'Resize rectangles, triangles and circles yourself, then calculate their area, perimeter or missing angles.',
    skills: ['Area', 'Perimeter', 'Angles'],
    maxXp: 100,
    minutes: 4,
    module: 'geometry',
  },
  {
    slug: 'number-quest',
    title: 'Number Quest',
    subject: 'mathematics',
    tagline: 'Patterns, sequences and logic',
    description: 'Crack number patterns and logic puzzles through progressively harder levels.',
    skills: ['Sequences', 'Reasoning'],
    maxXp: 100,
    minutes: 4,
    module: 'number-systems',
  },
]

export function getGame(slug: string) {
  return GAMES.find((g) => g.slug === slug)
}
