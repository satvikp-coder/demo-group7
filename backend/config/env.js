import dotenv from "dotenv";
import { z } from "zod";
import { isIP } from "node:net";

dotenv.config({ path: new URL("../.env", import.meta.url), quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_SSL: z.enum(["disable", "verify-full"]).default("disable"),
  DATABASE_SSL_CA_FILE: z.string().optional(),
  TRUST_PROXY: z.string().refine(value => !value || value.split(',').every(part => {
    if (['loopback','linklocal','uniquelocal'].includes(part)) return true;
    const [address,bits,...rest]=part.split('/');
    const version=isIP(address);
    return version && !rest.length && (bits===undefined || /^\d+$/.test(bits) && Number(bits) <= (version===4?32:128));
  }), "Must be trusted IPs/CIDRs or named private ranges").default(""),
  ALLOW_OPERATOR_REGISTRATION: z.enum(["true", "false"]).optional(),
  AUTH_RATE_LIMIT: z.coerce.number().int().min(1).max(1000).optional(),
  GENERATION_RATE_LIMIT: z.coerce.number().int().min(1).max(100).default(30),
  DATABASE_URL: z.string().url().refine(
    (value) => URL.canParse(value) && ["postgres:", "postgresql:"].includes(new URL(value).protocol),
    "Must be a PostgreSQL URL",
  ),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().min(1).max(65535),
  CORS_ORIGIN: z.string().refine((list) => list.split(",").every((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.origin === value;
  }), "Must be comma-separated exact HTTP(S) origins"),
});

export function loadEnv(source = process.env) {
  const result = schema.safeParse(source);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path[0]))];
    throw new Error("Missing or invalid environment variables: " + fields.join(", "));
  }
  const config = result.data;
  if (config.NODE_ENV === "production") {
    if (config.ALLOW_OPERATOR_REGISTRATION === "true") throw new Error("Public operator registration is forbidden in production");
    if (config.JWT_SECRET.length < 48 || new Set(config.JWT_SECRET).size < 10 || /^(.{1,16})\1+$/.test(config.JWT_SECRET) || /secret|password|example|change.?me/i.test(config.JWT_SECRET)) throw new Error("JWT_SECRET must be randomly generated (at least48 characters)");
    if (config.CORS_ORIGIN.split(",").some(value => new URL(value).protocol !== "https:")) {
      // HTTP is allowed solely on private local staging origins; public deployment must use HTTPS.
      if (config.CORS_ORIGIN.split(",").some(value => !["localhost","127.0.0.1","[::1]"].includes(new URL(value).hostname))) throw new Error("Production CORS_ORIGIN requires HTTPS");
    }
  }
  return Object.freeze({...config, AUTH_RATE_LIMIT: config.AUTH_RATE_LIMIT ?? (config.NODE_ENV === "production" ? 20 : 500),
    ALLOW_OPERATOR_REGISTRATION: config.NODE_ENV !== "production" && config.ALLOW_OPERATOR_REGISTRATION !== "false"});
}

export const env = loadEnv();
