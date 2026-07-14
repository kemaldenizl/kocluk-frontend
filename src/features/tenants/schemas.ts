import { z } from "zod";

/** Validation for tenant create/update, shared by the form and its route handler. */

const name = z.string().min(1, "Ad gerekli.").max(200, "Ad çok uzun.");
/** Optional URL slug; blank is coerced to undefined so the backend derives it from the name. */
const slug = z
  .string()
  .trim()
  .max(200, "Slug çok uzun.")
  .regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createTenantSchema = z.object({ name, slug });
export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = z.object({ name });
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
