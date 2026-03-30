/**
 * Configuration centralisée des variables d'environnement
 */

function getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue!;
}

export const config = {
    // Application
    nodeEnv: getEnv("NODE_ENV", "development"),
    port: parseInt(getEnv("PORT", "4000"), 10),

    // Supabase
    supabaseUrl: getEnv("VITE_SUPABASE_URL"),
    supabasePublishableKey: getEnv("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY"),

    // JWT
    jwtAccessSecret: getEnv("JWT_ACCESS_SECRET"),
    jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),

    // Session
    sessionExpiryDays: parseInt(getEnv("SESSION_EXPIRY_DAYS", "30"), 10),
};

// Validation
if (!Number.isInteger(config.port) || config.port <= 0 || config.port > 65535) {
    throw new Error("PORT must be a valid port number (1-65535)");
}
if (!Number.isInteger(config.sessionExpiryDays) || config.sessionExpiryDays <= 0) {
    throw new Error("SESSION_EXPIRY_DAYS must be a positive integer");
}
