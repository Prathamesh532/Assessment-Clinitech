import { z } from "zod";

export const loginSchema = z.object({ email: z.string().trim().email().transform((value) => value.toLowerCase()), password: z.string().min(8).max(128) });

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  mobile: z.string().trim().min(8).max(20),
  city: z.string().trim().min(1).max(80).optional().default("Not provided"),
  state: z.string().trim().min(1).max(80).optional().default("Not provided"),
  age: z.coerce.number().int().min(1).max(120).optional().default(18),
  gender: z.enum(["Female", "Male", "Other"]).optional().default("Other"),
  occupation: z.string().trim().min(1).max(100).optional().default("Not provided"),
  healthCondition: z.string().trim().min(1).max(120).optional().default("Not specified"),
  beautyGoal: z.string().trim().min(1).max(120).optional().default("General wellness"),
  password: z.string().min(8).max(128),
});
