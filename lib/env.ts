/**
 * Environment Variable Validation
 * This file validates that all required environment variables are present
 * at build time and runtime.
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optionalEnvVars = ["NEXT_PUBLIC_VERCEL_ENV", "VERCEL_URL"] as const;

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check optional variables and warn if missing
  for (const key of optionalEnvVars) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  // Throw error if required variables are missing
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing
        .map((key) => `  - ${key}`)
        .join("\n")}\n\n` +
        `Please check your .env.local file or environment configuration.`
    );
  }

  // Log warnings for optional variables (only in development)
  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `⚠️  Optional environment variables not set:\n${warnings
        .map((key) => `  - ${key}`)
        .join("\n")}`
    );
  }

  // Log success in development
  if (process.env.NODE_ENV === "development") {
    // Environment variables validation completed successfully
  }
}

/**
 * Get a required environment variable
 * @param key - Environment variable key
 * @returns The value of the environment variable
 * @throws Error if the environment variable is not set
 */
export function getEnvVar(key: (typeof requiredEnvVars)[number]): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Get an optional environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns The value of the environment variable or the default
 */
export function getOptionalEnvVar(
  key: (typeof optionalEnvVars)[number],
  defaultValue: string = ""
): string {
  return process.env[key] || defaultValue;
}

// Validate environment variables when this module is imported
// This ensures validation happens at build time
validateEnv();
