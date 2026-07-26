import { routeApi } from "@/lib/api/route-api";
import type { ClientLoginResult } from "@/features/auth/types";
import type {
  MfaDisableInput,
  MfaLoginCompleteInput,
  MfaRegenerateRecoveryCodesInput,
  MfaSetupCompleteInput,
} from "./schemas";
import type { MfaSetupBeginResult, MfaStatus, RecoveryCodesResult } from "./types";

/**
 * Client-side MFA API. Every call goes through {@link routeApi} to our own route
 * handlers (never the backend directly), so the browser never sees the backend URL,
 * bearer tokens, or the login challenge exchange.
 */
export const mfaApi = {
  /** BFF-tracked hint of whether MFA is enabled for the current account. */
  status: () => routeApi<MfaStatus>("/api/mfa/status"),

  setupBegin: () => routeApi<MfaSetupBeginResult>("/api/mfa/setup/begin", { method: "POST" }),

  setupComplete: (input: MfaSetupCompleteInput) =>
    routeApi<RecoveryCodesResult>("/api/mfa/setup/complete", { method: "POST", body: input }),

  loginComplete: (input: MfaLoginCompleteInput) =>
    routeApi<ClientLoginResult>("/api/mfa/login/complete", { method: "POST", body: input }),

  disable: (input: MfaDisableInput) =>
    routeApi<null>("/api/mfa/disable", { method: "POST", body: input }),

  regenerateRecoveryCodes: (input: MfaRegenerateRecoveryCodesInput) =>
    routeApi<RecoveryCodesResult>("/api/mfa/recovery-codes/regenerate", { method: "POST", body: input }),
};
