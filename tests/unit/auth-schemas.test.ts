import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/features/auth/schemas";

const validRegister = {
  firstName: "Ada",
  lastName: "Yılmaz",
  email: "user@example.com",
  password: "P@ssw0rd12345",
  confirmPassword: "P@ssw0rd12345",
  studentType: "HighSchool",
};

describe("auth schemas", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.studentType).toBe("HighSchool");
  });

  it("rejects an unknown studentType", () => {
    expect(registerSchema.safeParse({ ...validRegister, studentType: "Kindergarten" }).success).toBe(false);
    // numeric ids are no longer accepted — the backend serializes by name
    expect(registerSchema.safeParse({ ...validRegister, studentType: 2 }).success).toBe(false);
  });

  it("rejects a missing first or last name", () => {
    expect(registerSchema.safeParse({ ...validRegister, firstName: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegister, lastName: "" }).success).toBe(false);
  });

  it("rejects mismatched passwords on register", () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: "different12345" });
    expect(result.success).toBe(false);
  });

  it("requires a non-empty email", () => {
    expect(registerSchema.safeParse({ ...validRegister, email: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegister, email: "user@example.com" }).success).toBe(true);
  });

  it("rejects a short password on register but not on login", () => {
    expect(registerSchema.safeParse({ ...validRegister, password: "short", confirmPassword: "short" }).success).toBe(false);
    // login only requires the password to be present, not a minimum length
    expect(loginSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(true);
  });

  it("requires token, new password and a matching confirmation on reset", () => {
    expect(
      resetPasswordSchema.safeParse({ token: "", newPassword: "P@ssw0rd12345", confirmNewPassword: "P@ssw0rd12345" }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ token: "t", newPassword: "P@ssw0rd12345", confirmNewPassword: "nope12345678" }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ token: "t", newPassword: "P@ssw0rd12345", confirmNewPassword: "P@ssw0rd12345" }).success,
    ).toBe(true);
  });
});
