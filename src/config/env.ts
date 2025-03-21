import 'dotenv/config'; // Load environment variables from .env file
import { z } from 'zod';

const envVars = z
  .object({
    PORT: z.string().transform(Number).default('3000'), // Default port for the server
    API_PREFIX: z.string().default('api'), // Default prefix for the API
  })
  .passthrough();

// safeParse to validate the environment variables without stop the app
const parseEnv = envVars.safeParse(process.env);

if (!parseEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error('⚠️ ', parseEnv.error.format());
  throw new Error('🚫 Invalid environment variables');
}

// Variable to use across the entire application
export const env = {
  port: parseEnv.data.PORT,
  apiPrefix: parseEnv.data.API_PREFIX,
  // Add more environment variables as needed
};

// Type to have the environment variables in a type-safe way
export type Env = z.infer<typeof envVars>;
