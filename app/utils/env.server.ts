// Environment configuration utilities (server-side only)

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

export const env = {
  // Paypack Configuration
  PAYPACK_BASE_URL: getOptionalEnvVar('PAYPACK_BASE_URL', 'https://payments.paypack.rw/api'),
  PAYPACK_CLIENT_ID: getRequiredEnvVar('PAYPACK_CLIENT_ID'),
  PAYPACK_CLIENT_SECRET: getRequiredEnvVar('PAYPACK_CLIENT_SECRET'),
  
  // Application Configuration
  SESSION_SECRET: getRequiredEnvVar('SESSION_SECRET'),
  NODE_ENV: getOptionalEnvVar('NODE_ENV', 'development'),
  
  // Derived values
  isDevelopment: getOptionalEnvVar('NODE_ENV', 'development') === 'development',
  isProduction: getOptionalEnvVar('NODE_ENV', 'development') === 'production',
} as const;

// Validate environment on module load
export function validateEnvironment(): void {
  try {
    // This will throw if any required env vars are missing
    env.PAYPACK_CLIENT_ID;
    env.PAYPACK_CLIENT_SECRET;
    env.SESSION_SECRET;
    
    console.log('✅ Environment configuration validated');
  } catch (error) {
    console.error('❌ Environment configuration error:', error);
    if (env.isProduction) {
      throw error;
    }
  }
}
