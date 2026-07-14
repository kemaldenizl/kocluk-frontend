"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { isApiError } from "@/lib/api/http-error";
import { authApi } from "./api";

/**
 * Thin react-query mutation hooks over {@link authApi}. Components stay declarative
 * (isPending / error / mutateAsync) and never touch fetch directly.
 */

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => qc.clear(),
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}

export function useResendVerification() {
  return useMutation({ mutationFn: authApi.resendVerification });
}

export function useChangePasswordRequest() {
  return useMutation({ mutationFn: authApi.changePasswordRequest });
}

export function useChangePasswordConfirm() {
  return useMutation({ mutationFn: authApi.changePasswordConfirm });
}

export function useChangeEmailRequest() {
  return useMutation({ mutationFn: authApi.changeEmailRequest });
}

/**
 * Validates an email-change token from the emailed link before showing the form.
 * Runs automatically once a token is present; never retries auth failures.
 */
export function useValidateEmailChangeToken(token: string) {
  return useQuery({
    queryKey: ["change-email", "validate", token],
    queryFn: () => authApi.changeEmailValidate(token),
    enabled: token.length > 0,
    retry: (failureCount, error) => (isApiError(error) ? false : failureCount < 1),
  });
}

export function useChangeEmailConfirm() {
  return useMutation({ mutationFn: authApi.changeEmailConfirm });
}
