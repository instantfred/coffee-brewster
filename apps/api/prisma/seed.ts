import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const METHOD_PRESETS = [
  {
    key: 'v60',
    name: 'Hario V60',
    defaultRatio: 15,
    bloom: true,
    pours: 2,
    notes: 'Pour-over method with paper filter, medium-fine grind',
    presets: {
      grind: 'Medium-fine',
      tempC: 94,
      filter: 'V60 paper',
      tips: [
        'Rinse filter to preheat and remove paper taste.',
        'Swirl after each pour to level the bed.',
        'Pour in slow, controlled spirals from center outward.',
      ],
    },
  },
  {
    key: 'chemex',
    name: 'Chemex',
    defaultRatio: 16,
    bloom: true,
    pours: 3,
    notes: 'Clean, bright extraction with thick paper filter',
    presets: {
      grind: 'Medium-coarse',
      tempC: 94,
      filter: 'Chemex paper',
      tips: [
        'Use Chemex-specific filters for best results.',
        'Pour slowly to maintain proper extraction time.',
        'The thick filter removes oils for a clean cup.',
      ],
    },
  },
  {
    key: 'aeropress',
    name: 'AeroPress',
    defaultRatio: 14,
    bloom: true,
    pours: 0,
    notes: 'Immersion brewing with pressure extraction',
    presets: {
      grind: 'Medium',
      tempC: 85,
      filter: 'Paper or metal',
      tips: [
        'Lower temperature for paper filter, higher for metal.',
        'Steep for 1-2 minutes before pressing.',
        'Press slowly and steadily for best extraction.',
      ],
    },
  },
  {
    key: 'french_press',
    name: 'French Press',
    defaultRatio: 15,
    bloom: false,
    pours: 0,
    notes: 'Full immersion brewing with metal mesh filter',
    presets: {
      grind: 'Coarse',
      tempC: 95,
      filter: 'Metal mesh',
      tips: [
        'Use coarse grind to avoid over-extraction.',
        'Steep for 4 minutes for optimal extraction.',
        'Break the crust at 4 minutes, then press gently.',
      ],
    },
  },
  {
    key: 'moka',
    name: 'Moka Pot',
    defaultRatio: 10,
    bloom: false,
    pours: 0,
    notes: 'Stovetop espresso-style brewing',
    presets: {
      grind: 'Fine-medium',
      tempC: 98,
      filter: 'Basket',
      tips: [
        'Fill water chamber to just below safety valve.',
        'Use medium heat to avoid burning.',
        'Remove from heat when gurgling starts.',
      ],
    },
  },
];

async function main() {
  console.log('Start seeding...');

  // Clean existing data
  await prisma.brewMethod.deleteMany();

  // Seed brew methods
  for (const method of METHOD_PRESETS) {
    await prisma.brewMethod.create({
      data: {
        ...method,
        presets: JSON.stringify(method.presets), // Convert object to JSON string
      },
    });
    console.log(`Created brew method: ${method.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });