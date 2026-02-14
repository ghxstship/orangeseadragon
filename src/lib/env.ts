import { z } from "zod";

const sharedServerEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export type SharedServerEnv = z.infer<typeof sharedServerEnvSchema>;

let cachedSharedEnv: SharedServerEnv | null = null;

function formatEnvIssues(issues: z.ZodIssue[]) {
  return issues
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");
}

export function getServerEnv(): SharedServerEnv {
  if (cachedSharedEnv) {
    return cachedSharedEnv;
  }

  const parsed = sharedServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${formatEnvIssues(parsed.error.issues)}`);
  }

  cachedSharedEnv = parsed.data;
  return cachedSharedEnv;
}

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getServiceRoleKey() {
  return getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY");
}

export function getStripeSecretKey() {
  return getRequiredEnvVar("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return getRequiredEnvVar("STRIPE_WEBHOOK_SECRET");
}

export function getAppHost() {
  return new URL(getServerEnv().NEXT_PUBLIC_APP_URL).host;
}
