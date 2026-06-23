import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  CLIENT_ORIGINS: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return value.split(",").every((origin) => z.url().safeParse(origin.trim()).success);
      },
      { message: "CLIENT_ORIGINS must be a comma-separated list of valid URLs" },
    ),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  console.error("Invalid environment configuration", z.treeifyError(result.error));
  throw new Error("Environment validation failed");
}

export const env = result.data;
