import { z } from "zod";

/** Validation for role create/rename, shared by forms and route handlers. */

const name = z.string().min(1, "Ad gerekli.").max(200, "Ad çok uzun.");

/** Role name only — used by the create form, where the tenant comes from context. */
export const roleNameSchema = z.object({ name });
export type RoleNameInput = z.infer<typeof roleNameSchema>;

/** Full create payload sent to the backend: tenant-scoped (frontend_guide §9). */
export const createRoleSchema = z.object({
  tenantId: z.string().min(1, "Kiracı gerekli."),
  name,
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({ name });
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const addRolePermissionSchema = z.object({
  permissionId: z.string().min(1, "İzin seç."),
});
export type AddRolePermissionInput = z.infer<typeof addRolePermissionSchema>;
