import type { Subject } from './store'

export type ChallengeQuestion = {
  prompt: string
  answer: string
  options?: string[]
  subject: Subject
}

export type DailyChallenge = {
  id: string
  title: string
  description: string
  subject: Subject | 'mixed'
  seconds: number
  xp: number
  tier: 1 | 2 | 3
  questions: ChallengeQuestion[]
}

export function seededRandom(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const int = (rand: () => number, min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

export function arithmeticQuestion(rand: () => number, tier: number): ChallengeQuestion {
  const ops = tier === 1 ? ['+', '−'] : tier === 2 ? ['+', '−', '×'] : ['+', '−', '×', '÷']
  const op = ops[int(rand, 0, ops.length - 1)]
  const max = tier === 1 ? 20 : tier === 2 ? 50 : 99
  let a = int(rand, 2, max)
  let b = int(rand, 2, max)
  let ans: number
  if (op === '+') ans = a + b
  else if (op === '−') {
    if (b > a) [a, b] = [b, a]
    ans = a - b
  } else if (op === '×') {
    a = int(rand, 2, tier === 2 ? 12 : 15)
    b = int(rand, 2, 12)
    ans = a * b
  } else {
    b = int(rand, 2, 12)
    ans = int(rand, 2, 12)
    a = b * ans
  }
  return { prompt: `${a} ${op} ${b} = ?`, answer: String(ans), subject: 'mathematics' }
}

const CELL_PARTS: { name: string; clue: string }[] = [
  { name: 'Nucleus', clue: 'Contains DNA and controls the cell' },
  { name: 'Mitochondrion', clue: 'Releases energy through respiration' },
  { name: 'Ribosome', clue: 'Site of protein synthesis' },
  { name: 'Cell membrane', clue: 'Controls what enters and leaves the cell' },
  { name: 'Cytoplasm', clue: 'Jelly-like fluid where reactions happen' },
  { name: 'Golgi apparatus', clue: 'Packages and ships proteins' },
  { name: 'Lysosome', clue: 'Contains enzymes that digest waste' },
  { name: 'Endoplasmic reticulum', clue: 'Network that transports proteins and lipids' },
]

const GENETICS_BANK: ChallengeQuestion[] = [
  { prompt: 'Bb × Bb: what fraction of offspring show the recessive trait?', options: ['0', '1/4', '1/2', '3/4'], answer: '1/4', subject: 'biology' },
  { prompt: 'BB × bb: what percentage of offspring are heterozygous?', options: ['0%', '25%', '50%', '100%'], answer: '100%', subject: 'biology' },
  { prompt: 'Which genotype is homozygous recessive?', options: ['TT', 'Tt', 'tt', 'tT'], answer: 'tt', subject: 'biology' },
  { prompt: 'Bb × bb gives what phenotype ratio (dominant : recessive)?', options: ['3 : 1', '1 : 1', '1 : 0', '1 : 2 : 1'], answer: '1 : 1', subject: 'biology' },
  { prompt: 'An allele that is always expressed when present is…', options: ['Recessive', 'Dominant', 'Mutant', 'Neutral'], answer: 'Dominant', subject: 'biology' },
  { prompt: 'Guanine pairs with…', options: ['Adenine', 'Thymine', 'Cytosine', 'Uracil'], answer: 'Cytosine', subject: 'biology' },
  { prompt: 'Human body cells contain how many chromosomes?', options: ['23', '46', '48', '92'], answer: '46', subject: 'biology' },
  { prompt: 'Sex chromosomes of a typical male are…', options: ['XX', 'XY', 'YY', 'X'], answer: 'XY', subject: 'biology' },
]

const BIO_RAPID: ChallengeQuestion[] = [
  { prompt: 'Gas released in photosynthesis?', options: ['O₂', 'CO₂', 'N₂', 'H₂'], answer: 'O₂', subject: 'biology' },
  { prompt: 'Organ that pumps blood?', options: ['Lung', 'Heart', 'Liver', 'Kidney'], answer: 'Heart', subject: 'biology' },
  { prompt: 'Vessels carrying blood away from the heart?', options: ['Veins', 'Arteries', 'Capillaries', 'Nerves'], answer: 'Arteries', subject: 'biology' },
  { prompt: 'Start of every food chain?', options: ['Producer', 'Predator', 'Herbivore', 'Decomposer'], answer: 'Producer', subject: 'biology' },
  { prompt: 'Antibiotics kill…', options: ['Viruses', 'Bacteria', 'Fungi', 'Allergens'], answer: 'Bacteria', subject: 'biology' },
  { prompt: 'Water moves up plants through…', options: ['Phloem', 'Xylem', 'Stomata', 'Root hairs'], answer: 'Xylem', subject: 'biology' },
]

function geometryQuestion(rand: () => number, tier: number): ChallengeQuestion {
  const kind = int(rand, 0, tier === 1 ? 1 : 3)
  if (kind === 0) {
    const l = int(rand, 3, 12)
    const w = int(rand, 2, 9)
    return { prompt: `Area of a ${l} × ${w} rectangle?`, answer: String(l * w), subject: 'mathematics' }
  }
  if (kind === 1) {
    const a = int(rand, 30, 80)
    const b = int(rand, 30, 80)
    return { prompt: `A triangle has angles ${a}° and ${b}°. Third angle (°)?`, answer: String(180 - a - b), subject: 'mathematics' }
  }
  if (kind === 2) {
    const base = int(rand, 2, 10) * 2
    const h = int(rand, 3, 12)
    return { prompt: `Area of a triangle with base ${base} and height ${h}?`, answer: String((base * h) / 2), subject: 'mathematics' }
  }
  const l = int(rand, 4, 15)
  const w = int(rand, 2, 10)
  return { prompt: `Perimeter of a ${l} × ${w} rectangle?`, answer: String(2 * (l + w)), subject: 'mathematics' }
}

export function dailyChallenges(dateKey: string, playerLevel: number): DailyChallenge[] {
  const rand = seededRandom(dateKey)
  const tier = (Math.min(3, 1 + Math.floor((playerLevel - 1) / 3)) as 1 | 2 | 3)
  const bonus = (tier - 1) * 10

  const cellQs = shuffle(CELL_PARTS, rand)
    .slice(0, 5)
    .map((p) => {
      const distractors = shuffle(CELL_PARTS.filter((x) => x.name !== p.name), rand).slice(0, 3).map((x) => x.name)
      return { prompt: p.clue, options: shuffle([p.name, ...distractors], rand), answer: p.name, subject: 'biology' as const }
    })

  const rapid: ChallengeQuestion[] = shuffle(
    [...Array.from({ length: 5 }, () => arithmeticQuestion(rand, tier)), ...shuffle(BIO_RAPID, rand).slice(0, 5)],
    rand,
  )

  return [
    {
      id: 'math-sprint',
      title: 'Math Sprint',
      description: 'Solve 5 mathematics problems in 3 minutes.',
      subject: 'mathematics',
      seconds: tier === 3 ? 120 : 180,
      xp: 40 + bonus,
      tier,
      questions: Array.from({ length: 5 }, () => arithmeticQuestion(rand, tier + (tier < 3 ? 1 : 0))),
    },
    {
      id: 'cell-id',
      title: 'Cell Detective',
      description: 'Identify 5 parts of a human cell from their function.',
      subject: 'biology',
      seconds: 120,
      xp: 40 + bonus,
      tier,
      questions: cellQs,
    },
    {
      id: 'genetics-quiz',
      title: 'Genetics Quiz',
      description: 'Answer 5 questions on alleles, crosses and DNA.',
      subject: 'biology',
      seconds: 150,
      xp: 45 + bonus,
      tier,
      questions: shuffle(GENETICS_BANK, rand).slice(0, 5),
    },
    {
      id: 'geometry-puzzle',
      title: 'Geometry Puzzle',
      description: 'Calculate 4 areas, perimeters or missing angles.',
      subject: 'mathematics',
      seconds: 150,
      xp: 45 + bonus,
      tier,
      questions: Array.from({ length: 4 }, () => geometryQuestion(rand, tier)),
    },
    {
      id: 'rapid-fire',
      title: 'Rapid Fire 10',
      description: 'Answer 10 mixed Biology and Math questions in 90 seconds.',
      subject: 'mixed',
      seconds: tier === 3 ? 75 : 90,
      xp: 60 + bonus,
      tier,
      questions: rapid,
    },
  ]
}
