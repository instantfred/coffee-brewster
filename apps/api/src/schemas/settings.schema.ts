import { z } from 'zod';

export const updateSettingsSchema = z.object({
  units: z.enum(['METRIC', 'IMPERIAL']).optional(),
  tempUnit: z.enum(['C', 'F']).optional(),
  recommend: z.boolean().optional(),
  defaultMethodId: z.string().optional().nullable(),
  cupSizeMl: z
    .number()
    .min(100, 'Cup size must be at least 100ml')
    .max(1000, 'Cup size must be less than 1000ml')
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;