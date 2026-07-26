/**
 * Shared E2E test data. These credentials MUST mirror the seed users in
 * tests/e2e/support/mock-backend.mjs — they are the single source of truth the specs
 * and page objects reference so no test hard-codes a bare email/password string.
 */

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** Turkish label rendered for the seeded studentType (for assertions). */
  studentTypeLabel: string;
  isAdmin: boolean;
}

export const TEST_USERS = {
  /** A regular student with no admin permissions. */
  student: {
    email: "student@test.local",
    password: "Password12345",
    firstName: "Deniz",
    lastName: "Yılmaz",
    studentTypeLabel: "Lise",
    isAdmin: false,
  },
  /** A platform admin holding every admin-area permission. */
  admin: {
    email: "admin@test.local",
    password: "Password12345",
    firstName: "Admin",
    lastName: "Koç",
    studentTypeLabel: "Mezun",
    isAdmin: true,
  },
} as const satisfies Record<string, TestUser>;

/** A password that satisfies the 12-char minimum, for new registrations. */
export const VALID_PASSWORD = "Password12345";

/** Builds a unique, never-before-seen registration payload so re-runs never collide. */
export function makeNewUser(overrides: Partial<{ firstName: string; lastName: string; email: string; password: string }> = {}) {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return {
    firstName: "Yeni",
    lastName: "Kullanıcı",
    email: `new-${unique}@test.local`,
    password: VALID_PASSWORD,
    studentTypeLabel: "Üniversite",
    ...overrides,
  };
}
