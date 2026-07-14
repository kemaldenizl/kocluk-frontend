import { z } from "zod";

/** Validation for creating a permission, shared by the form and its route handler. */
export const createPermissionSchema = z.object({
  code: z
    .string()
    .min(1, "Kod gerekli.")
    .max(100, "Kod çok uzun.")
    .regex(/^[a-z][a-z0-9]*(\.[a-z0-9]+)+$/, "Kod 'alan.eylem' biçiminde olmalı (örn. reports.read)."),
});
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
