import type { TokenPair } from "@/lib/auth/tokens";
import type { StudentType } from "@/config/student-type";

/** User summary returned by register/login. */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentType: StudentType;
  emailVerified: boolean;
  isActive: boolean;
}

export interface MfaChallenge {
  challengeToken: string;
  expiresAtUtc: string;
}

/** Login/MFA-complete response shape. Tokens are stripped before reaching the browser. */
export interface LoginResult {
  user: AuthUser;
  tokens: TokenPair | null;
  mfaChallenge: MfaChallenge | null;
  requiresMfa: boolean;
}

/** What the browser receives from our login route (no tokens — they live in httpOnly cookies). */
export interface ClientLoginResult {
  user: AuthUser;
  requiresMfa: boolean;
  mfaChallenge: MfaChallenge | null;
}

export interface RegisterResult {
  user: AuthUser;
}

/** Generic `{ message }` body used by the various 202-Accepted endpoints. */
export interface MessageResult {
  message: string;
}

export interface ValidateTokenResult {
  isValid: boolean;
  message: string;
}
