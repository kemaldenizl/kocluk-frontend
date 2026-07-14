import { z } from "zod";
import { studentTypeSchema } from "@/config/student-type";

/**
 * Validation schemas shared by client forms (react-hook-form) and route handlers
 * (request-body validation). One source of truth for each contract.
 */

const email = z.string().min(1, "E-posta gerekli.");//.email("Geçerli bir e-posta adresi gir.");
const password = z.string().min(12, "Şifre en az 12 karakter olmalı.");
const token = z.string().min(1, "Kod gerekli.");
const firstName = z.string().min(1, "Ad gerekli.").max(100, "Ad çok uzun.");
const lastName = z.string().min(1, "Soyad gerekli.").max(100, "Soyad çok uzun.");
const studentType = studentTypeSchema;

export const registerSchema = z
  .object({
    firstName,
    lastName,
    email,
    password,
    confirmPassword: z.string().min(1, "Şifreni tekrar gir."),
    studentType,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({ email, password: z.string().min(1, "Şifre gerekli.") });
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ token, newPassword: password, confirmNewPassword: z.string().min(1, "Şifreni tekrar gir.") })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmNewPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({ token });
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({ email });
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre gerekli."),
});
export type ChangePasswordRequestInput = z.infer<typeof changePasswordRequestSchema>;

export const changePasswordConfirmSchema = z
  .object({ token, newPassword: password, confirmNewPassword: z.string().min(1, "Şifreni tekrar gir.") })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordConfirmInput = z.infer<typeof changePasswordConfirmSchema>;

export const changeEmailRequestSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre gerekli."),
});
export type ChangeEmailRequestInput = z.infer<typeof changeEmailRequestSchema>;

export const changeEmailConfirmSchema = z.object({ token, newEmail: email });
export type ChangeEmailConfirmInput = z.infer<typeof changeEmailConfirmSchema>;

/**
 * Confirm-page form schemas — only the field the user types. The token is read from
 * the URL and merged in on submit, so it is not part of the form.
 */
export const newPasswordSchema = z
  .object({ newPassword: password, confirmNewPassword: z.string().min(1, "Şifreni tekrar gir.") })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmNewPassword"],
  });
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;

export const newEmailSchema = z.object({ newEmail: email });
export type NewEmailInput = z.infer<typeof newEmailSchema>;
