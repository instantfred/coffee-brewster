import { z } from 'zod';

export const createSessionSchema = z.object({
  methodId: z.string().min(1, 'Method ID is required'),
  durationSec: z
    .number()
    .min(30, 'Duration must be at least 30 seconds')
    .max(1800, 'Duration must be less than 30 minutes'),
  coffeeGrams: z
    .number()
    .min(5, 'Coffee amount must be at least 5g')
    .max(200, 'Coffee amount must be less than 200g'),
  waterMl: z
    .number()
    .min(50, 'Water amount must be at least 50ml')
    .max(3000, 'Water amount must be less than 3000ml'),
  yieldMl: z
    .number()
    .min(30, 'Yield must be at least 30ml')
    .max(2500, 'Yield must be less than 2500ml'),
  grindSetting: z.string().max(100).optional(),
  waterTempC: z
    .number()
    .min(60, 'Water temperature must be at least 60°C')
    .max(100, 'Water temperature must be at most 100°C')
    .optional(),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  pours: z.array(z.object({
    timestamp: z.number(),
    volumeMl: z.number(),
    label: z.string(),
  })).optional(),
  bean: z.object({
    variety: z.string().optional(),
    roaster: z.string().optional(),
    roastDate: z.string().optional(),
    origin: z.string().optional(),
  }).optional(),
});

export const updateSessionSchema = createSessionSchema.partial();

export const getSessionsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('20'),
  q: z.string().optional(), // search query
  methodId: z.string().optional(), // filter by method
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type GetSessionsQuery = z.infer<typeof getSessionsQuerySchema>;