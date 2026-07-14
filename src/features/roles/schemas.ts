import { z } from "zod";

/** Validation for role create/rename, shared by forms and route handlers. */

const name = z.string().min(1, "Ad gerekli.").max(100, "Ad çok uzun.");

export const createRoleSchema = z.object({ name });
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({ name });
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const addRolePermissionSchema = z.object({
  permissionId: z.string().min(1, "İzin seç."),
});
export type AddRolePermissionInput = z.infer<typeof addRolePermissionSchema>;
