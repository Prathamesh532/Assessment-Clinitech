import { z } from "zod";
import { paginationSchema } from "./common.schema.js";
export const clientListSchema = paginationSchema.extend({ search: z.string().trim().max(100).default(""), city: z.string().trim().max(80).optional(), state: z.string().trim().max(80).optional(), gender: z.string().trim().max(20).optional(), healthCondition: z.string().trim().max(100).optional() });
export const clientIdSchema = z.object({ clientId: z.coerce.number().int().positive() });
