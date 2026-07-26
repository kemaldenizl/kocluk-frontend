"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { isApiError } from "@/lib/api/http-error";
import { mfaApi } from "./api";

/**
 * Thin react-query hooks over {@link mfaApi}. Components stay declarative
 * (isPending / error / mutateAsync) and never touch fetch directly.
 */

/** Reads whether MFA is enabled. Does not retry on 401 (the proxy handles auth). */
export function useMfaStatus() {
  return useQuery({
    queryKey: queryKeys.mfaStatus,
    queryFn: mfaApi.status,
    retry: (failureCount, error) => (isApiError(error) && error.isUnauthorized ? false : failureCount < 2),
  });
}

/** Begins enrolment: fetches the QR/otpauth URI and manual entry key. */
export function useBeginMfaSetup() {
  return useMutation({ mutationFn: mfaApi.setupBegin });
}

/** Confirms enrolment with a TOTP code; returns recovery codes and flips status → on. */
export function useCompleteMfaSetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mfaApi.setupComplete,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mfaStatus }),
  });
}

/** Disables MFA with a TOTP or recovery code; flips status → off. */
export function useDisableMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mfaApi.disable,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mfaStatus }),
  });
}

/** Regenerates recovery codes after a TOTP check. */
export function useRegenerateRecoveryCodes() {
  return useMutation({ mutationFn: mfaApi.regenerateRecoveryCodes });
}

/** Completes an MFA login challenge; a session is issued (cookies set) on success. */
export function useCompleteMfaLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mfaApi.loginComplete,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}
