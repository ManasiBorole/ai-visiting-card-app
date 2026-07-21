function getRequiredEnv(key: string, requiredInProduction = true): string {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production" && requiredInProduction) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return "";
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing required environment variable: AUTH_SECRET (or NEXTAUTH_SECRET)"
    );
  }

  return "development-auth-secret-change-me";
}

export const env = {
  databaseUrl: getRequiredEnv("DATABASE_URL", false),
  authSecret: getAuthSecret(),
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "CardVault",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  googleClientId: getRequiredEnv("GOOGLE_CLIENT_ID", false),
  googleClientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET", false),
  geminiApiKey: getRequiredEnv("GEMINI_API_KEY", false),
  cloudinaryCloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
} as const;

export const googleAuthEnabled =
  Boolean(env.googleClientId) && Boolean(env.googleClientSecret);

export const geminiEnabled = Boolean(env.geminiApiKey);

export const cloudinaryEnabled =
  Boolean(env.cloudinaryCloudName) &&
  Boolean(env.cloudinaryApiKey) &&
  Boolean(env.cloudinaryApiSecret);
