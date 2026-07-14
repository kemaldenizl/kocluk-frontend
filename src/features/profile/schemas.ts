import { z } from "zod";
import { studentTypeSchema } from "@/config/student-type";

/**
 * Body for `PUT /api/users/me/update` — the editable identity fields. Shared by the
 * profile form (react-hook-form) and its route handler (request-body validation).
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Ad gerekli.").max(100, "Ad çok uzun."),
  lastName: z.string().min(1, "Soyad gerekli.").max(100, "Soyad çok uzun."),
  studentType: studentTypeSchema,
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
