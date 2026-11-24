import type { Difficulty, Subject } from './store'

export type QuizQuestion = {
  q: string
  options: string[]
  answer: number
  hint: string
  explanation: string
}

export type Lesson = {
  id: string
  title: string
  minutes: number
  intro: string
  points: { title: string; body: string }[]
  example?: { title: string; body: string }
  quiz: QuizQuestion[]
}

export type Module = {
  id: string
  subject: Subject
  title: string
  level: Difficulty
  summary: string
  game?: string
  lessons: Lesson[]
}

export const SUBJECTS: Record<Subject, { name: string; tagline: string; image: string; tone: 'bio' | 'math' }> = {
  biology: {
    name: 'Biology',
    tagline: 'Cells, bodies, genes and ecosystems — explore how life works.',
    image: '/images/biology.jpg',
    tone: 'bio',
  },
  mathematics: {
    name: 'Mathematics',
    tagline: 'Numbers, equations, shapes and change — build real problem-solving power.',
    image: '/images/mathematics.jpg',
    tone: 'math',
  },
}

export const LEVELS: { id: Difficulty; label: string; description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'Build strong foundations step by step.' },
  { id: 'intermediate', label: 'Intermediate', description: 'Connect ideas and practise applying them.' },
  { id: 'advanced', label: 'Advanced', description: 'Tackle deeper concepts and challenges.' },
]

export const MODULES: Module[] = [
  // ───────────── BIOLOGY ─────────────
  {
    id: 'cell-biology',
    subject: 'biology',
    title: 'Cell Biology',
    level: 'beginner',
    summary: 'The structure and function of cells — the basic unit of life.',
    game: 'cell-builder',
    lessons: [
      {
        id: 'bio-cell-1',
        title: "The Cell: Life's Building Block",
        minutes: 6,
        intro: 'Every living organism is made of one or more cells. Cells take in nutrients, release energy, grow and reproduce.',
        points: [
          { title: 'Cell theory', body: 'All living things are made of cells, the cell is the basic unit of life, and all cells come from pre-existing cells.' },
          { title: 'Prokaryotic vs eukaryotic', body: 'Prokaryotes (bacteria) have no nucleus. Eukaryotes (plants, animals, fungi) keep their DNA inside a membrane-bound nucleus.' },
          { title: 'Plant vs animal cells', body: 'Plant cells also have a cell wall, chloroplasts and a large central vacuole.' },
        ],
        example: { title: 'Think of it like a city', body: 'The nucleus is city hall, mitochondria are power stations and the cell membrane is the city border with security gates.' },
        quiz: [
          { q: 'Which structure controls the activities of a eukaryotic cell?', options: ['Cell membrane', 'Nucleus', 'Ribosome', 'Vacuole'], answer: 1, hint: 'It contains the DNA.', explanation: 'The nucleus holds DNA, which carries instructions for all cell activities.' },
          { q: 'Which of these is found in plant cells but NOT animal cells?', options: ['Mitochondria', 'Cell membrane', 'Cell wall', 'Cytoplasm'], answer: 2, hint: 'It gives plants a rigid shape.', explanation: 'The cellulose cell wall supports plant cells. Animal cells only have a membrane.' },
          { q: 'Bacteria are examples of…', options: ['Eukaryotic cells', 'Prokaryotic cells', 'Plant cells', 'Viruses'], answer: 1, hint: 'They have no nucleus.', explanation: 'Bacteria are prokaryotes — their DNA floats freely in the cytoplasm.' },
        ],
      },
      {
        id: 'bio-cell-2',
        title: 'Organelles at Work',
        minutes: 7,
        intro: 'Organelles are tiny structures inside the cell, each with a specific job.',
        points: [
          { title: 'Mitochondria', body: 'Release energy from glucose through aerobic respiration, producing ATP.' },
          { title: 'Ribosomes & ER', body: 'Ribosomes build proteins; the endoplasmic reticulum transports them. The Golgi apparatus packages them for export.' },
          { title: 'Chloroplasts', body: 'Found in plant cells, they capture light energy for photosynthesis.' },
        ],
        quiz: [
          { q: 'Which organelle is known as the powerhouse of the cell?', options: ['Golgi apparatus', 'Mitochondrion', 'Lysosome', 'Nucleolus'], answer: 1, hint: 'It performs aerobic respiration.', explanation: 'Mitochondria release energy as ATP during aerobic respiration.' },
          { q: 'Where are proteins made?', options: ['Ribosomes', 'Vacuole', 'Cell wall', 'Chloroplast'], answer: 0, hint: 'Tiny dots, often attached to the rough ER.', explanation: 'Ribosomes translate mRNA into proteins.' },
          { q: 'Which organelle packages and ships proteins?', options: ['Lysosome', 'Nucleus', 'Golgi apparatus', 'Mitochondrion'], answer: 2, hint: 'Think of a post office.', explanation: 'The Golgi apparatus modifies, packages and sends proteins to their destinations.' },
        ],
      },
    ],
  },
  {
    id: 'plant-biology',
    subject: 'biology',
    title: 'Plant Biology',
    level: 'beginner',
    summary: 'How plants make food, move water and reproduce.',
    lessons: [
      {
        id: 'bio-plant-1',
        title: 'Photosynthesis',
        minutes: 6,
        intro: 'Plants make their own food using light energy, water and carbon dioxide.',
        points: [
          { title: 'The equation', body: 'Carbon dioxide + water → glucose + oxygen, powered by light energy absorbed by chlorophyll.' },
          { title: 'Where it happens', body: 'Inside chloroplasts, mainly in the palisade cells of leaves.' },
          { title: 'Limiting factors', body: 'Light intensity, CO₂ concentration and temperature all affect the rate.' },
        ],
        quiz: [
          { q: 'Which gas do plants release during photosynthesis?', options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], answer: 2, hint: 'It is the gas we breathe in.', explanation: 'Oxygen is a by-product of splitting water during photosynthesis.' },
          { q: 'Which pigment absorbs light energy?', options: ['Haemoglobin', 'Chlorophyll', 'Melanin', 'Keratin'], answer: 1, hint: 'It makes leaves green.', explanation: 'Chlorophyll in chloroplasts absorbs mostly red and blue light.' },
          { q: 'Photosynthesis produces which sugar?', options: ['Glucose', 'Sucrose', 'Lactose', 'Fructose'], answer: 0, hint: 'C₆H₁₂O₆', explanation: 'Glucose is produced and later converted to starch for storage.' },
        ],
      },
      {
        id: 'bio-plant-2',
        title: 'Plant Structure & Transport',
        minutes: 6,
        intro: 'Roots, stems and leaves work together to move water and nutrients.',
        points: [
          { title: 'Xylem', body: 'Carries water and minerals up from the roots to the leaves.' },
          { title: 'Phloem', body: 'Transports sugars from leaves to the rest of the plant (translocation).' },
          { title: 'Stomata', body: 'Tiny pores on leaves that let gases in and out; guard cells open and close them.' },
        ],
        quiz: [
          { q: 'Which tissue transports water upward?', options: ['Phloem', 'Xylem', 'Epidermis', 'Cambium'], answer: 1, hint: 'X for eXtra water going up.', explanation: 'Xylem vessels carry water and minerals from roots to leaves.' },
          { q: 'Loss of water vapour from leaves is called…', options: ['Translocation', 'Respiration', 'Transpiration', 'Osmosis'], answer: 2, hint: 'It happens through stomata.', explanation: 'Transpiration is evaporation of water from leaves via stomata.' },
          { q: 'What controls the opening of stomata?', options: ['Root hairs', 'Guard cells', 'Xylem', 'Chloroplasts'], answer: 1, hint: 'They "guard" the pore.', explanation: 'Guard cells change shape to open or close each stoma.' },
        ],
      },
    ],
  },
  {
    id: 'human-anatomy',
    subject: 'biology',
    title: 'Human Anatomy and Physiology',
    level: 'intermediate',
    summary: 'Organ systems and how they keep the body alive.',
    game: 'body-explorer',
    lessons: [
      {
        id: 'bio-body-1',
        title: 'Body Systems Overview',
        minutes: 7,
        intro: 'Cells form tissues, tissues form organs, and organs work together in organ systems.',
        points: [
          { title: 'Digestive system', body: 'Breaks food into small soluble molecules that can be absorbed in the small intestine.' },
          { title: 'Respiratory system', body: 'Lungs exchange oxygen and carbon dioxide across thin alveoli walls.' },
          { title: 'Nervous system', body: 'The brain and spinal cord process information and coordinate responses.' },
        ],
        quiz: [
          { q: 'Where does most nutrient absorption happen?', options: ['Stomach', 'Large intestine', 'Small intestine', 'Oesophagus'], answer: 2, hint: 'It is lined with villi.', explanation: 'Villi in the small intestine give a huge surface area for absorption.' },
          { q: 'Gas exchange in the lungs happens in the…', options: ['Bronchi', 'Alveoli', 'Trachea', 'Diaphragm'], answer: 1, hint: 'Tiny air sacs.', explanation: 'Alveoli have thin walls and a rich blood supply for fast diffusion.' },
          { q: 'Which organ filters blood to make urine?', options: ['Liver', 'Kidney', 'Pancreas', 'Spleen'], answer: 1, hint: 'You have two, bean-shaped.', explanation: 'Kidneys filter blood, removing urea and excess water.' },
        ],
      },
      {
        id: 'bio-body-2',
        title: 'Heart & Circulation',
        minutes: 6,
        intro: 'The heart pumps blood through a double circulatory system.',
        points: [
          { title: 'Four chambers', body: 'Two atria receive blood; two ventricles pump it out. The left ventricle has the thickest wall.' },
          { title: 'Vessels', body: 'Arteries carry blood away from the heart, veins return it, capillaries exchange materials.' },
          { title: 'Blood', body: 'Red cells carry oxygen, white cells fight infection, platelets help clotting.' },
        ],
        quiz: [
          { q: 'Which vessels carry blood AWAY from the heart?', options: ['Veins', 'Arteries', 'Capillaries', 'Lymph'], answer: 1, hint: 'A for Away.', explanation: 'Arteries have thick, elastic walls to handle high pressure.' },
          { q: 'Which chamber pumps blood to the whole body?', options: ['Right atrium', 'Left atrium', 'Right ventricle', 'Left ventricle'], answer: 3, hint: 'It has the thickest muscle.', explanation: 'The left ventricle pumps oxygenated blood into the aorta.' },
          { q: 'Which blood component carries oxygen?', options: ['Platelets', 'Plasma', 'Red blood cells', 'White blood cells'], answer: 2, hint: 'They contain haemoglobin.', explanation: 'Haemoglobin in red blood cells binds oxygen.' },
        ],
      },
    ],
  },
  {
    id: 'ecology',
    subject: 'biology',
    title: 'Ecology and Environment',
    level: 'intermediate',
    summary: 'How organisms interact with each other and their environment.',
    game: 'food-chain',
    lessons: [
      {
        id: 'bio-eco-1',
        title: 'Food Chains & Webs',
        minutes: 5,
        intro: 'Energy flows through ecosystems from producers to consumers.',
        points: [
          { title: 'Producers', body: 'Plants and algae make food by photosynthesis — they start every food chain.' },
          { title: 'Consumers', body: 'Primary consumers eat producers; secondary and tertiary consumers eat other animals.' },
          { title: '10% rule', body: 'Only about 10% of energy passes to the next trophic level; the rest is lost as heat.' },
        ],
        quiz: [
          { q: 'What is at the start of every food chain?', options: ['Herbivore', 'Producer', 'Decomposer', 'Predator'], answer: 1, hint: 'It makes its own food.', explanation: 'Producers capture energy from sunlight.' },
          { q: 'A rabbit eating grass is a…', options: ['Producer', 'Primary consumer', 'Secondary consumer', 'Decomposer'], answer: 1, hint: 'It eats the producer directly.', explanation: 'Herbivores that eat producers are primary consumers.' },
          { q: 'Roughly how much energy passes to the next level?', options: ['90%', '50%', '10%', '1%'], answer: 2, hint: 'Most is lost as heat.', explanation: 'About 10% is transferred; the rest is used for life processes or lost.' },
        ],
      },
      {
        id: 'bio-eco-2',
        title: 'Ecosystems & Cycles',
        minutes: 6,
        intro: 'Materials such as carbon and water are recycled through ecosystems.',
        points: [
          { title: 'Carbon cycle', body: 'Photosynthesis removes CO₂; respiration, decomposition and combustion return it.' },
          { title: 'Decomposers', body: 'Bacteria and fungi break down dead matter, releasing nutrients back to the soil.' },
          { title: 'Biodiversity', body: 'A variety of species makes ecosystems more stable and resilient.' },
        ],
        quiz: [
          { q: 'Which process removes CO₂ from the air?', options: ['Combustion', 'Respiration', 'Photosynthesis', 'Decay'], answer: 2, hint: 'Plants do it in sunlight.', explanation: 'Photosynthesis takes in carbon dioxide to make glucose.' },
          { q: 'Fungi that break down dead leaves are…', options: ['Producers', 'Decomposers', 'Herbivores', 'Parasites'], answer: 1, hint: 'They recycle nutrients.', explanation: 'Decomposers return nutrients to the soil.' },
          { q: 'High biodiversity usually makes an ecosystem…', options: ['Less stable', 'More stable', 'Unchanged', 'Smaller'], answer: 1, hint: 'More backups if one species declines.', explanation: 'Many species provide alternative food sources and roles.' },
        ],
      },
    ],
  },
  {
    id: 'microbiology',
    subject: 'biology',
    title: 'Microbiology',
    level: 'intermediate',
    summary: 'Bacteria, viruses, fungi and the immune system.',
    lessons: [
      {
        id: 'bio-micro-1',
        title: 'Microbes Around Us',
        minutes: 5,
        intro: 'Microorganisms are everywhere — many are helpful, some cause disease.',
        points: [
          { title: 'Bacteria', body: 'Single-celled prokaryotes. Some make yoghurt, others cause infections like strep throat.' },
          { title: 'Viruses', body: 'Not cells — they must infect a host cell to reproduce.' },
          { title: 'Fungi', body: 'Include yeast (used in bread) and moulds; Penicillium gave us penicillin.' },
        ],
        quiz: [
          { q: 'Which microbe can only reproduce inside host cells?', options: ['Bacteria', 'Yeast', 'Virus', 'Algae'], answer: 2, hint: 'It is not considered a living cell.', explanation: 'Viruses hijack host cells to make copies of themselves.' },
          { q: 'Antibiotics are effective against…', options: ['Viruses', 'Bacteria', 'All microbes', 'Allergies'], answer: 1, hint: 'Penicillin was the first.', explanation: 'Antibiotics kill bacteria but do not work on viruses.' },
          { q: 'Yeast is a type of…', options: ['Bacterium', 'Virus', 'Fungus', 'Protist'], answer: 2, hint: 'Used to make bread rise.', explanation: 'Yeast is a single-celled fungus.' },
        ],
      },
      {
        id: 'bio-micro-2',
        title: 'Immunity & Disease',
        minutes: 6,
        intro: 'Your immune system defends the body against pathogens.',
        points: [
          { title: 'White blood cells', body: 'Phagocytes engulf pathogens; lymphocytes make antibodies.' },
          { title: 'Vaccination', body: 'A harmless form of a pathogen trains the immune system to respond faster next time.' },
          { title: 'Memory cells', body: 'Remain after infection, giving long-lasting immunity.' },
        ],
        quiz: [
          { q: 'Which cells produce antibodies?', options: ['Red blood cells', 'Lymphocytes', 'Platelets', 'Neurons'], answer: 1, hint: 'A type of white blood cell.', explanation: 'Lymphocytes produce antibodies specific to each antigen.' },
          { q: 'Vaccines work by…', options: ['Killing all bacteria', 'Training the immune system', 'Replacing blood cells', 'Curing infections'], answer: 1, hint: 'They prepare the body in advance.', explanation: 'Vaccines trigger memory cells without causing illness.' },
          { q: 'Phagocytes destroy pathogens by…', options: ['Engulfing them', 'Freezing them', 'Starving them', 'Ignoring them'], answer: 0, hint: 'Phago = eat.', explanation: 'Phagocytosis means engulfing and digesting the pathogen.' },
        ],
      },
    ],
  },
  {
    id: 'genetics',
    subject: 'biology',
    title: 'Genetics and Heredity',
    level: 'advanced',
    summary: 'DNA, genes and how traits pass from parents to offspring.',
    game: 'genetics',
    lessons: [
      {
        id: 'bio-gen-1',
        title: 'DNA, Genes & Chromosomes',
        minutes: 7,
        intro: 'DNA is a double helix that stores genetic instructions.',
        points: [
          { title: 'Base pairs', body: 'A pairs with T, and C pairs with G.' },
          { title: 'Genes', body: 'A gene is a section of DNA that codes for a specific protein.' },
          { title: 'Chromosomes', body: 'Humans have 23 pairs of chromosomes — 46 in total.' },
        ],
        quiz: [
          { q: 'Adenine pairs with…', options: ['Cytosine', 'Guanine', 'Thymine', 'Uracil'], answer: 2, hint: 'A–T, C–G', explanation: 'In DNA, adenine always pairs with thymine.' },
          { q: 'How many chromosomes are in a human body cell?', options: ['23', '46', '44', '92'], answer: 1, hint: '23 pairs.', explanation: 'Body cells have 23 pairs = 46 chromosomes.' },
          { q: 'A gene codes for a…', options: ['Carbohydrate', 'Protein', 'Lipid', 'Mineral'], answer: 1, hint: 'Made by ribosomes.', explanation: 'Each gene carries the code for building a particular protein.' },
        ],
      },
      {
        id: 'bio-gen-2',
        title: 'Mendelian Inheritance',
        minutes: 8,
        intro: 'Alleles can be dominant or recessive. Punnett squares predict offspring.',
        points: [
          { title: 'Genotype vs phenotype', body: 'Genotype is the allele combination (Bb); phenotype is the observable trait (brown eyes).' },
          { title: 'Homozygous & heterozygous', body: 'BB or bb is homozygous; Bb is heterozygous.' },
          { title: 'Monohybrid cross', body: 'Bb × Bb gives a 1 : 2 : 1 genotype ratio and 3 : 1 phenotype ratio.' },
        ],
        example: { title: 'Punnett square', body: 'Cross Bb × Bb: BB, Bb, Bb, bb → 75% show the dominant trait.' },
        quiz: [
          { q: 'Bb × Bb — what fraction of offspring are bb?', options: ['0', '1/4', '1/2', '3/4'], answer: 1, hint: 'Draw a 2×2 grid.', explanation: 'Only one of four boxes is bb.' },
          { q: 'An organism with genotype Tt is…', options: ['Homozygous dominant', 'Heterozygous', 'Homozygous recessive', 'Mutant'], answer: 1, hint: 'Two different alleles.', explanation: 'Different alleles = heterozygous.' },
          { q: 'The observable characteristic is the…', options: ['Genotype', 'Allele', 'Phenotype', 'Chromosome'], answer: 2, hint: 'Pheno = show.', explanation: 'Phenotype is what you can observe.' },
        ],
      },
    ],
  },
  {
    id: 'evolution',
    subject: 'biology',
    title: 'Evolution',
    level: 'advanced',
    summary: 'How species change over time through natural selection.',
    lessons: [
      {
        id: 'bio-evo-1',
        title: 'Natural Selection',
        minutes: 6,
        intro: 'Darwin proposed that organisms best suited to their environment survive and reproduce.',
        points: [
          { title: 'Variation', body: 'Individuals in a population differ because of mutations and sexual reproduction.' },
          { title: 'Survival of the fittest', body: 'Those with helpful traits are more likely to survive and pass on their alleles.' },
          { title: 'Over generations', body: 'Helpful alleles become more common, changing the population.' },
        ],
        quiz: [
          { q: 'Who proposed the theory of natural selection?', options: ['Mendel', 'Darwin', 'Newton', 'Pasteur'], answer: 1, hint: 'He sailed on HMS Beagle.', explanation: 'Charles Darwin published On the Origin of Species in 1859.' },
          { q: 'The original source of new variation is…', options: ['Mutation', 'Exercise', 'Diet', 'Climate'], answer: 0, hint: 'A change in DNA.', explanation: 'Mutations create new alleles.' },
          { q: 'Antibiotic-resistant bacteria are an example of…', options: ['Extinction', 'Natural selection', 'Photosynthesis', 'Cloning'], answer: 1, hint: 'Resistant ones survive.', explanation: 'Resistant bacteria survive and reproduce, so resistance spreads.' },
        ],
      },
      {
        id: 'bio-evo-2',
        title: 'Evidence for Evolution',
        minutes: 5,
        intro: 'Fossils, anatomy and DNA all support evolution.',
        points: [
          { title: 'Fossils', body: 'Show how organisms changed across millions of years.' },
          { title: 'Homologous structures', body: 'Similar bone layouts in human arms, whale fins and bat wings suggest a common ancestor.' },
          { title: 'DNA comparison', body: 'Closely related species share more DNA sequences.' },
        ],
        quiz: [
          { q: 'A bat wing and a human arm are…', options: ['Analogous', 'Homologous', 'Unrelated', 'Vestigial'], answer: 1, hint: 'Same bones, different use.', explanation: 'Homologous structures share an ancestral design.' },
          { q: 'Preserved remains of ancient organisms are…', options: ['Fossils', 'Minerals', 'Genes', 'Spores'], answer: 0, hint: 'Found in rock layers.', explanation: 'Fossils record life from the past.' },
          { q: 'Species with more similar DNA are…', options: ['Less related', 'More closely related', 'Always the same species', 'Extinct'], answer: 1, hint: 'Think family resemblance.', explanation: 'More shared DNA means a more recent common ancestor.' },
        ],
      },
    ],
  },
  // ───────────── MATHEMATICS ─────────────
  {
    id: 'arithmetic',
    subject: 'mathematics',
    title: 'Arithmetic',
    level: 'beginner',
    summary: 'Operations, order of operations, fractions and percentages.',
    game: 'math-speed',
    lessons: [
      {
        id: 'math-arith-1',
        title: 'Order of Operations',
        minutes: 5,
        intro: 'BODMAS / PEMDAS tells us which operations to do first.',
        points: [
          { title: 'Brackets first', body: 'Always work inside brackets before anything else.' },
          { title: 'Orders (powers)', body: 'Then evaluate powers and roots.' },
          { title: 'Then × ÷, then + −', body: 'Multiply/divide left to right, then add/subtract left to right.' },
        ],
        example: { title: 'Worked example', body: '3 + 4 × 2 = 3 + 8 = 11 (not 14).' },
        quiz: [
          { q: '6 + 3 × 2 = ?', options: ['18', '12', '11', '15'], answer: 1, hint: 'Multiply first.', explanation: '3 × 2 = 6, then 6 + 6 = 12.' },
          { q: '(8 − 2)² ÷ 4 = ?', options: ['9', '16', '6', '36'], answer: 0, hint: 'Brackets, then power.', explanation: '6² = 36, 36 ÷ 4 = 9.' },
          { q: '20 − 12 ÷ 4 = ?', options: ['2', '17', '8', '5'], answer: 1, hint: 'Divide before subtracting.', explanation: '12 ÷ 4 = 3, 20 − 3 = 17.' },
        ],
      },
      {
        id: 'math-arith-2',
        title: 'Fractions & Percentages',
        minutes: 6,
        intro: 'Fractions, decimals and percentages are three ways to describe parts of a whole.',
        points: [
          { title: 'Equivalent forms', body: '1/2 = 0.5 = 50%. To convert a fraction to a percentage, multiply by 100.' },
          { title: 'Adding fractions', body: 'Use a common denominator: 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2.' },
          { title: 'Percent of a number', body: '25% of 80 = 0.25 × 80 = 20.' },
        ],
        quiz: [
          { q: 'What is 3/4 as a percentage?', options: ['34%', '75%', '43%', '70%'], answer: 1, hint: 'Multiply by 100.', explanation: '3 ÷ 4 = 0.75 → 75%.' },
          { q: '1/2 + 1/4 = ?', options: ['2/6', '3/4', '1/6', '2/4'], answer: 1, hint: 'Convert 1/2 into quarters.', explanation: '2/4 + 1/4 = 3/4.' },
          { q: 'What is 20% of 150?', options: ['15', '30', '20', '75'], answer: 1, hint: '10% is 15.', explanation: '0.2 × 150 = 30.' },
        ],
      },
    ],
  },
  {
    id: 'number-systems',
    subject: 'mathematics',
    title: 'Number Systems',
    level: 'beginner',
    summary: 'Natural, whole, integer, rational and irrational numbers; primes and factors.',
    game: 'number-quest',
    lessons: [
      {
        id: 'math-num-1',
        title: 'Types of Numbers',
        minutes: 5,
        intro: 'Numbers are organised into nested sets.',
        points: [
          { title: 'Natural & whole', body: 'Natural: 1, 2, 3… Whole numbers add 0.' },
          { title: 'Integers', body: 'Include negatives: …, −2, −1, 0, 1, 2, …' },
          { title: 'Rational & irrational', body: 'Rational numbers can be written as a fraction. √2 and π are irrational.' },
        ],
        quiz: [
          { q: 'Which number is irrational?', options: ['0.5', '√9', 'π', '−4'], answer: 2, hint: 'Its decimals never end or repeat.', explanation: 'π cannot be written as a fraction of integers.' },
          { q: '−7 is an example of…', options: ['A natural number', 'An integer', 'A whole number', 'An irrational number'], answer: 1, hint: 'Negative counting numbers.', explanation: 'Integers include negative whole numbers.' },
          { q: 'Which is NOT a natural number?', options: ['1', '0', '15', '100'], answer: 1, hint: 'Natural numbers start at 1.', explanation: '0 is a whole number but not natural.' },
        ],
      },
      {
        id: 'math-num-2',
        title: 'Primes, Factors & Multiples',
        minutes: 6,
        intro: 'Prime numbers have exactly two factors: 1 and themselves.',
        points: [
          { title: 'Primes', body: '2, 3, 5, 7, 11, 13… 2 is the only even prime.' },
          { title: 'HCF', body: 'The highest common factor of 12 and 18 is 6.' },
          { title: 'LCM', body: 'The lowest common multiple of 4 and 6 is 12.' },
        ],
        quiz: [
          { q: 'Which is a prime number?', options: ['21', '27', '29', '33'], answer: 2, hint: 'Check divisibility by 3.', explanation: '29 has only factors 1 and 29.' },
          { q: 'HCF of 16 and 24?', options: ['4', '8', '2', '48'], answer: 1, hint: 'Largest number dividing both.', explanation: '8 divides both 16 and 24.' },
          { q: 'LCM of 3 and 5?', options: ['8', '15', '1', '30'], answer: 1, hint: 'Smallest number in both times tables.', explanation: '15 is the first common multiple.' },
        ],
      },
    ],
  },
  {
    id: 'algebra',
    subject: 'mathematics',
    title: 'Algebra',
    level: 'intermediate',
    summary: 'Variables, expressions and solving equations.',
    game: 'equation-escape',
    lessons: [
      {
        id: 'math-alg-1',
        title: 'Expressions & Variables',
        minutes: 5,
        intro: 'A variable is a letter that stands for an unknown number.',
        points: [
          { title: 'Like terms', body: '3x + 2x = 5x, but 3x + 2y cannot be simplified.' },
          { title: 'Substitution', body: 'If x = 4, then 2x + 1 = 9.' },
          { title: 'Expanding', body: '3(x + 2) = 3x + 6.' },
        ],
        quiz: [
          { q: 'Simplify 4a + 3b − a', options: ['3a + 3b', '7ab', '6ab', '4a + 2b'], answer: 0, hint: 'Combine the a-terms.', explanation: '4a − a = 3a, leaving 3a + 3b.' },
          { q: 'If y = 3, what is 5y − 2?', options: ['13', '15', '17', '11'], answer: 0, hint: 'Replace y with 3.', explanation: '5 × 3 − 2 = 13.' },
          { q: 'Expand 2(x − 5)', options: ['2x − 5', '2x − 10', 'x − 10', '2x + 10'], answer: 1, hint: 'Multiply both terms.', explanation: '2·x − 2·5 = 2x − 10.' },
        ],
      },
      {
        id: 'math-alg-2',
        title: 'Solving Linear Equations',
        minutes: 6,
        intro: 'Keep the equation balanced: whatever you do to one side, do to the other.',
        points: [
          { title: 'Inverse operations', body: 'Undo + with −, × with ÷.' },
          { title: 'Two-step', body: '2x + 3 = 11 → 2x = 8 → x = 4.' },
          { title: 'Check', body: 'Substitute your answer back to verify.' },
        ],
        quiz: [
          { q: 'Solve x + 7 = 15', options: ['7', '8', '22', '9'], answer: 1, hint: 'Subtract 7.', explanation: 'x = 15 − 7 = 8.' },
          { q: 'Solve 3x = 21', options: ['7', '18', '63', '24'], answer: 0, hint: 'Divide by 3.', explanation: 'x = 21 ÷ 3 = 7.' },
          { q: 'Solve 4x − 5 = 11', options: ['3', '4', '1.5', '16'], answer: 1, hint: 'Add 5 first.', explanation: '4x = 16, so x = 4.' },
        ],
      },
    ],
  },
  {
    id: 'geometry',
    subject: 'mathematics',
    title: 'Geometry',
    level: 'intermediate',
    summary: 'Angles, triangles, area and perimeter.',
    game: 'geometry-puzzle',
    lessons: [
      {
        id: 'math-geo-1',
        title: 'Angles & Triangles',
        minutes: 5,
        intro: 'Angle facts help you find missing values.',
        points: [
          { title: 'Triangle sum', body: 'Interior angles of a triangle add to 180°.' },
          { title: 'Straight line', body: 'Angles on a straight line add to 180°; around a point, 360°.' },
          { title: 'Types', body: 'Equilateral (all 60°), isosceles (two equal), scalene (all different).' },
        ],
        quiz: [
          { q: 'Two angles of a triangle are 50° and 60°. The third?', options: ['70°', '80°', '90°', '60°'], answer: 0, hint: 'Total is 180°.', explanation: '180 − 50 − 60 = 70°.' },
          { q: 'Each angle in an equilateral triangle is…', options: ['45°', '60°', '90°', '120°'], answer: 1, hint: '180 ÷ 3', explanation: 'All three are equal: 60°.' },
          { q: 'Angles around a point add up to…', options: ['180°', '270°', '360°', '90°'], answer: 2, hint: 'A full turn.', explanation: 'A full turn is 360°.' },
        ],
      },
      {
        id: 'math-geo-2',
        title: 'Area & Perimeter',
        minutes: 6,
        intro: 'Perimeter is the distance around; area is the space inside.',
        points: [
          { title: 'Rectangle', body: 'Area = length × width; perimeter = 2(l + w).' },
          { title: 'Triangle', body: 'Area = ½ × base × height.' },
          { title: 'Circle', body: 'Area = πr²; circumference = 2πr.' },
        ],
        quiz: [
          { q: 'Area of a 6 × 4 rectangle?', options: ['10', '20', '24', '48'], answer: 2, hint: 'Length × width.', explanation: '6 × 4 = 24 square units.' },
          { q: 'Perimeter of a 5 × 3 rectangle?', options: ['15', '16', '8', '30'], answer: 1, hint: 'Add all four sides.', explanation: '2(5 + 3) = 16.' },
          { q: 'Area of a triangle with base 10, height 6?', options: ['60', '30', '16', '36'], answer: 1, hint: 'Half of base × height.', explanation: '½ × 10 × 6 = 30.' },
        ],
      },
    ],
  },
  {
    id: 'statistics',
    subject: 'mathematics',
    title: 'Statistics and Probability',
    level: 'intermediate',
    summary: 'Averages, data and the chance of events.',
    lessons: [
      {
        id: 'math-stat-1',
        title: 'Mean, Median & Mode',
        minutes: 5,
        intro: 'Averages summarise a data set with one number.',
        points: [
          { title: 'Mean', body: 'Add all values and divide by how many there are.' },
          { title: 'Median', body: 'The middle value when data is ordered.' },
          { title: 'Mode & range', body: 'Mode is the most common value; range = largest − smallest.' },
        ],
        quiz: [
          { q: 'Mean of 2, 4, 6, 8?', options: ['4', '5', '6', '20'], answer: 1, hint: 'Total ÷ 4.', explanation: '20 ÷ 4 = 5.' },
          { q: 'Median of 3, 9, 1, 7, 5?', options: ['5', '7', '9', '3'], answer: 0, hint: 'Order them first.', explanation: '1, 3, 5, 7, 9 → middle is 5.' },
          { q: 'Mode of 2, 3, 3, 4, 3, 5?', options: ['2', '3', '4', '5'], answer: 1, hint: 'Most frequent.', explanation: '3 appears three times.' },
        ],
      },
      {
        id: 'math-stat-2',
        title: 'Basic Probability',
        minutes: 6,
        intro: 'Probability measures how likely something is, from 0 (impossible) to 1 (certain).',
        points: [
          { title: 'Formula', body: 'P(event) = favourable outcomes ÷ total outcomes.' },
          { title: 'Complement', body: 'P(not A) = 1 − P(A).' },
          { title: 'Independent events', body: 'P(A and B) = P(A) × P(B).' },
        ],
        quiz: [
          { q: 'P(rolling a 4 on a fair die)?', options: ['1/4', '1/6', '4/6', '1/2'], answer: 1, hint: 'Six equally likely outcomes.', explanation: 'One favourable out of six.' },
          { q: 'If P(rain) = 0.3, P(no rain) = ?', options: ['0.3', '0.7', '1.3', '0.03'], answer: 1, hint: 'Complements sum to 1.', explanation: '1 − 0.3 = 0.7.' },
          { q: 'P(two heads from two coin flips)?', options: ['1/2', '1/4', '1/3', '1'], answer: 1, hint: 'Multiply ½ × ½.', explanation: '½ × ½ = ¼.' },
        ],
      },
    ],
  },
  {
    id: 'trigonometry',
    subject: 'mathematics',
    title: 'Trigonometry',
    level: 'advanced',
    summary: 'Ratios in right-angled triangles and special angles.',
    lessons: [
      {
        id: 'math-trig-1',
        title: 'Sine, Cosine & Tangent',
        minutes: 7,
        intro: 'SOH CAH TOA links the sides and angles of right-angled triangles.',
        points: [
          { title: 'SOH', body: 'sin θ = opposite ÷ hypotenuse.' },
          { title: 'CAH', body: 'cos θ = adjacent ÷ hypotenuse.' },
          { title: 'TOA', body: 'tan θ = opposite ÷ adjacent.' },
        ],
        quiz: [
          { q: 'tan θ equals…', options: ['opp/hyp', 'adj/hyp', 'opp/adj', 'hyp/adj'], answer: 2, hint: 'TOA', explanation: 'Tangent = opposite over adjacent.' },
          { q: 'Opposite = 3, hypotenuse = 5. sin θ = ?', options: ['3/5', '4/5', '5/3', '3/4'], answer: 0, hint: 'SOH', explanation: 'sin θ = 3/5.' },
          { q: 'The longest side of a right triangle is the…', options: ['Opposite', 'Adjacent', 'Hypotenuse', 'Base'], answer: 2, hint: 'Opposite the right angle.', explanation: 'The hypotenuse is always the longest side.' },
        ],
      },
      {
        id: 'math-trig-2',
        title: 'Special Angles',
        minutes: 6,
        intro: 'Some angles have exact trig values worth memorising.',
        points: [
          { title: '30° and 60°', body: 'sin 30° = ½, cos 60° = ½, sin 60° = √3/2.' },
          { title: '45°', body: 'sin 45° = cos 45° = √2/2, tan 45° = 1.' },
          { title: '0° and 90°', body: 'sin 0° = 0, sin 90° = 1, cos 0° = 1, cos 90° = 0.' },
        ],
        quiz: [
          { q: 'sin 30° = ?', options: ['1', '½', '√3/2', '0'], answer: 1, hint: 'Half of an equilateral triangle.', explanation: 'sin 30° = ½ exactly.' },
          { q: 'tan 45° = ?', options: ['0', '√2', '1', '½'], answer: 2, hint: 'Opposite equals adjacent.', explanation: 'In a 45° right triangle both legs are equal, so tan = 1.' },
          { q: 'cos 90° = ?', options: ['1', '0', '−1', '½'], answer: 1, hint: 'Adjacent side shrinks to nothing.', explanation: 'cos 90° = 0.' },
        ],
      },
    ],
  },
  {
    id: 'calculus',
    subject: 'mathematics',
    title: 'Calculus',
    level: 'advanced',
    summary: 'Limits, rates of change and derivatives.',
    lessons: [
      {
        id: 'math-calc-1',
        title: 'Limits & Rates of Change',
        minutes: 7,
        intro: 'Calculus studies how things change. A limit describes the value a function approaches.',
        points: [
          { title: 'Average rate', body: 'Gradient between two points = change in y ÷ change in x.' },
          { title: 'Instantaneous rate', body: 'Shrink the gap between points to zero — that limit is the derivative.' },
          { title: 'Limits', body: 'As x → 2, x² → 4.' },
        ],
        quiz: [
          { q: 'Gradient between (1, 2) and (3, 8)?', options: ['2', '3', '6', '4'], answer: 1, hint: 'Δy ÷ Δx', explanation: '(8 − 2) ÷ (3 − 1) = 3.' },
          { q: 'lim x→3 of (2x + 1)?', options: ['6', '7', '5', '3'], answer: 1, hint: 'Substitute x = 3.', explanation: '2(3) + 1 = 7.' },
          { q: 'A derivative measures…', options: ['Area', 'Instantaneous rate of change', 'Average value', 'Volume'], answer: 1, hint: 'Slope at a point.', explanation: 'The derivative is the gradient at a single point.' },
        ],
      },
      {
        id: 'math-calc-2',
        title: 'Derivatives Basics',
        minutes: 8,
        intro: 'The power rule makes differentiation quick.',
        points: [
          { title: 'Power rule', body: 'd/dx (xⁿ) = n·xⁿ⁻¹.' },
          { title: 'Constants', body: 'The derivative of a constant is 0.' },
          { title: 'Sum rule', body: 'Differentiate each term separately.' },
        ],
        example: { title: 'Worked example', body: 'd/dx (3x² + 5x − 4) = 6x + 5.' },
        quiz: [
          { q: 'd/dx (x³) = ?', options: ['3x²', 'x²', '3x', 'x⁴/4'], answer: 0, hint: 'Bring down the power.', explanation: '3·x³⁻¹ = 3x².' },
          { q: 'd/dx (7) = ?', options: ['7', '1', '0', '7x'], answer: 2, hint: 'Constants do not change.', explanation: 'A constant has zero rate of change.' },
          { q: 'd/dx (4x² + 2x) = ?', options: ['8x + 2', '4x + 2', '8x', '2x + 2'], answer: 0, hint: 'Apply the power rule to each term.', explanation: '8x + 2.' },
        ],
      },
    ],
  },
]

export const MODULE_SHORT: Record<string, string> = {
  'cell-biology': 'bio-cell',
  'plant-biology': 'bio-plant',
  'human-anatomy': 'bio-body',
  ecology: 'bio-eco',
  microbiology: 'bio-micro',
  genetics: 'bio-gen',
  evolution: 'bio-evo',
  arithmetic: 'math-arith',
  'number-systems': 'math-num',
  algebra: 'math-alg',
  geometry: 'math-geo',
  statistics: 'math-stat',
  trigonometry: 'math-trig',
  calculus: 'math-calc',
}

export function modulesFor(subject: Subject) {
  return MODULES.filter((m) => m.subject === subject)
}

export function getModule(id: string) {
  return MODULES.find((m) => m.id === id)
}

export function findLesson(lessonId: string) {
  for (const m of MODULES) {
    const lesson = m.lessons.find((l) => l.id === lessonId)
    if (lesson) return { module: m, lesson }
  }
  return null
}

export function moduleProgress(m: Module, completed: string[]) {
  const done = m.lessons.filter((l) => completed.includes(l.id)).length
  return { done, total: m.lessons.length, pct: Math.round((done / m.lessons.length) * 100) }
}

export function subjectProgress(subject: Subject, completed: string[]) {
  const lessons = modulesFor(subject).flatMap((m) => m.lessons)
  const done = lessons.filter((l) => completed.includes(l.id)).length
  return { done, total: lessons.length, pct: Math.round((done / lessons.length) * 100) }
}

export function nextLesson(subject: Subject, completed: string[], path?: string[]) {
  const order = path?.length ? path.map((id) => getModule(id)!).filter(Boolean) : modulesFor(subject)
  for (const m of order) {
    for (const l of m.lessons) if (!completed.includes(l.id)) return { module: m, lesson: l }
  }
  return null
}

const LEVEL_ORDER: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 }

export function diagnosticQuestions(subject: Subject) {
  return modulesFor(subject).map((m) => ({ moduleId: m.id, moduleTitle: m.title, ...m.lessons[0].quiz[0] }))
}

export function buildPath(subject: Subject, level: Difficulty, weak: string[]) {
  const mods = modulesFor(subject)
  const sorted = [...mods].sort((a, b) => {
    const aw = weak.includes(a.id) ? 0 : 1
    const bw = weak.includes(b.id) ? 0 : 1
    const aDist = Math.abs(LEVEL_ORDER[a.level] - LEVEL_ORDER[level])
    const bDist = Math.abs(LEVEL_ORDER[b.level] - LEVEL_ORDER[level])
    if (LEVEL_ORDER[a.level] < LEVEL_ORDER[level] && !weak.includes(a.id)) return 1
    if (LEVEL_ORDER[b.level] < LEVEL_ORDER[level] && !weak.includes(b.id)) return -1
    return aw - bw || aDist - bDist || LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
  })
  return sorted.map((m) => m.id)
}
