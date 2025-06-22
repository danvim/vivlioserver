import z from 'zod/v4';

const envSchema = z.object({
  PORT: z.string().transform((v) => Number.parseInt(v)),
  NAVIGATION_TIMEOUT: z
    .string()
    .transform((v) => Number.parseInt(v))
    .default(5000),
});

export const env = envSchema.parse(process.env);
