import "dotenv/config";

const isProd = (process.env.NODE_ENV ?? "development") === "production";

function requireInProd(name: string, devFallback: string): string {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  if (isProd) {
    throw new Error(`Missing required env var in production: ${name}`);
  }
  return devFallback;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  env: process.env.NODE_ENV ?? "development",
  appUrl: process.env.APP_URL ?? "http://localhost:5173",
  corsOrigins: (process.env.CORS_ORIGIN ?? "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  jwt: {
    secret: requireInProd("JWT_SECRET", "dev-only-secret-change-me"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),

  s3: {
    endpoint: process.env.S3_ENDPOINT ?? "",
    region: process.env.S3_REGION ?? "auto",
    bucket: process.env.S3_BUCKET ?? "",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    publicUrl: process.env.S3_PUBLIC_URL ?? "",
  },

  ai: {
    provider: process.env.AI_PROVIDER ?? "mock",
    apiUrl: process.env.AI_API_URL ?? "",
    apiKey: process.env.AI_API_KEY ?? "",
  },

  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    fromEmail: process.env.SMTP_FROM_EMAIL ?? "no-reply@publiciart.com",
    fromName: process.env.SMTP_FROM_NAME ?? "Publiciart Builder",
  },
};

export function isSmtpConfigured(): boolean {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
}
