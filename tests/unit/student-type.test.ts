import { describe, expect, it } from "vitest";
import {
  STUDENT_TYPE_LABELS,
  STUDENT_TYPE_OPTIONS,
  STUDENT_TYPE_VALUES,
  isStudentType,
  studentTypeLabel,
  studentTypeSchema,
} from "@/config/student-type";

/** Unit tests for the studentType single source of truth (values, labels, guard, schema). */

describe("value / label integrity", () => {
  it("has a Turkish label for every enum value", () => {
    for (const value of STUDENT_TYPE_VALUES) {
      expect(STUDENT_TYPE_LABELS[value]).toBeTruthy();
    }
  });

  it("builds one option per value with matching value/label pairs, in order", () => {
    expect(STUDENT_TYPE_OPTIONS).toHaveLength(STUDENT_TYPE_VALUES.length);
    expect(STUDENT_TYPE_OPTIONS.map((o) => o.value)).toEqual([...STUDENT_TYPE_VALUES]);
    for (const option of STUDENT_TYPE_OPTIONS) {
      expect(option.label).toBe(STUDENT_TYPE_LABELS[option.value]);
    }
  });
});

describe("isStudentType", () => {
  it("accepts known enum names", () => {
    expect(isStudentType("HighSchool")).toBe(true);
    expect(isStudentType("Other")).toBe(true);
  });

  it("rejects unknown or non-string values", () => {
    expect(isStudentType("Kindergarten")).toBe(false);
    expect(isStudentType("highschool")).toBe(false);
    expect(isStudentType(2)).toBe(false);
    expect(isStudentType(null)).toBe(false);
    expect(isStudentType(undefined)).toBe(false);
  });
});

describe("studentTypeLabel", () => {
  it("returns the Turkish label for a valid value", () => {
    expect(studentTypeLabel("University")).toBe("Üniversite");
    expect(studentTypeLabel("MiddleSchool")).toBe("Ortaokul");
  });

  it("returns undefined for unknown, null or undefined values", () => {
    expect(studentTypeLabel("Nope")).toBeUndefined();
    expect(studentTypeLabel(null)).toBeUndefined();
    expect(studentTypeLabel(undefined)).toBeUndefined();
  });
});

describe("studentTypeSchema", () => {
  it("parses a known value and rejects an unknown one with the Turkish message", () => {
    expect(studentTypeSchema.safeParse("Graduate").success).toBe(true);
    const bad = studentTypeSchema.safeParse("Preschool");
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message).toBe("Öğrenim durumunu seç.");
  });

  it("rejects numeric ids (the backend serialises by name)", () => {
    expect(studentTypeSchema.safeParse(2).success).toBe(false);
  });
});
