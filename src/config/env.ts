/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envVars = z
  .object({
    PORT: z.string().default('3000').transform(Number),
  })
  .passthrough();

const parseEnv = envVars.safeParse(process.env);

if (!parseEnv.success) {
  console.error('Invalid environment variables:', parseEnv.error.format());
  throw new Error('Invalid environment variables');
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envVars> {}
  }
}
