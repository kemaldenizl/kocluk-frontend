import { routeApi } from "@/lib/api/route-api";
import type {
  ChangeEmailConfirmInput,
  ChangeEmailRequestInput,
  ChangePasswordConfirmInput,
  ChangePasswordRequestInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./schemas";
import type {
  ClientLoginResult,
  MessageResult,
  RegisterResult,
  ValidateTokenResult,
} from "./types";

/**
 * Client-side auth API. Every call goes through {@link routeApi} to our own route
 * handlers (never the backend directly), so the browser has no knowledge of the
 * backend URL or bearer tokens.
 */
export const authApi = {
  register: (input: RegisterInput) =>
    routeApi<RegisterResult>("/api/auth/register", { method: "POST", body: input }),

  login: (input: LoginInput) =>
    routeApi<ClientLoginResult>("/api/auth/login", { method: "POST", body: input }),

  logout: () => routeApi<null>("/api/auth/logout", { method: "POST" }),

  logoutAll: () => routeApi<null>("/api/auth/logout-all", { method: "POST" }),

  forgotPassword: (input: ForgotPasswordInput) =>
    routeApi<MessageResult>("/api/auth/forgot-password", { method: "POST", body: input }),

  resetPassword: (input: ResetPasswordInput) =>
    routeApi<null>("/api/auth/reset-password", { method: "POST", body: input }),

  verifyEmail: (input: VerifyEmailInput) =>
    routeApi<null>("/api/auth/verify-email", { method: "POST", body: input }),

  resendVerification: (input: ResendVerificationInput) =>
    routeApi<MessageResult>("/api/auth/resend-verification", { method: "POST", body: input }),

  changePasswordRequest: (input: ChangePasswordRequestInput) =>
    routeApi<MessageResult>("/api/auth/change-password/request", { method: "POST", body: input }),

  changePasswordConfirm: (input: ChangePasswordConfirmInput) =>
    routeApi<null>("/api/auth/change-password/confirm", { method: "POST", body: input }),

  changeEmailRequest: (input: ChangeEmailRequestInput) =>
    routeApi<MessageResult>("/api/auth/change-email/request", { method: "POST", body: input }),

  changeEmailValidate: (token: string) =>
    routeApi<ValidateTokenResult>("/api/auth/change-email/validate", { method: "GET", query: { token } }),

  changeEmailConfirm: (input: ChangeEmailConfirmInput) =>
    routeApi<null>("/api/auth/change-email/confirm", { method: "POST", body: input }),
};
