import { z } from "zod";

/** Validation for membership management, shared by forms and route handlers. */

const email = z.string().trim().min(1, "E-posta gerekli.").email("Geçerli bir e-posta gir.").max(320, "E-posta çok uzun.");

/** Add-member form: the admin identifies the existing user by email. */
export const addMemberFormSchema = z.object({ email });
export type AddMemberFormInput = z.infer<typeof addMemberFormSchema>;

/**
 * Full add-member payload sent to the backend. The tenant comes from panel context;
 * the user is identified by `email` or `userId` (at least one is required).
 */
export const addMemberSchema = z
  .object({
    tenantId: z.string().min(1, "Kiracı gerekli."),
    userId: z.string().min(1).optional(),
    email: email.optional(),
    roleIds: z.array(z.string().min(1)).optional(),
  })
  .refine((d) => Boolean(d.userId || d.email), {
    message: "Kullanıcı e-postası veya kimliği gerekli.",
    path: ["email"],
  });
export type AddMemberInput = z.infer<typeof addMemberSchema>;

/** Grant a tenant role to a member. */
export const grantMemberRoleSchema = z.object({ roleId: z.string().min(1, "Rol seç.") });
export type GrantMemberRoleInput = z.infer<typeof grantMemberRoleSchema>;
