import { z } from 'zod';

export const reverseBrewSchema = z.object({
  methodKey: z.enum(['v60', 'chemex', 'aeropress', 'french_press', 'moka']),
  cups: z
    .number()
    .min(0.5, 'Must brew at least 0.5 cups')
    .max(12, 'Cannot brew more than 12 cups'),
  ratio: z
    .number()
    .min(8, 'Ratio must be at least 1:8')
    .max(20, 'Ratio must be at most 1:20')
    .optional(),
  targetYieldMl: z
    .number()
    .min(50, 'Target yield must be at least 50ml')
    .max(3000, 'Target yield must be less than 3000ml')
    .optional(),
});

export type ReverseBrewInput = z.infer<typeof reverseBrewSchema>;