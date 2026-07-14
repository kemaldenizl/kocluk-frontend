import { z } from "zod";

/**
 * Öğrenim durumu (studentType) — backend enum. The API serializes it by **name**
 * (a string like "HighSchool"), not by its numeric id, so the frontend works with
 * those name strings everywhere. One source of truth for the values, their Turkish
 * labels, and the option list used by select inputs.
 */

/** Enum member names as sent/received by the backend, in display order. */
export const STUDENT_TYPE_VALUES = [
  "MiddleSchool",
  "HighSchool",
  "University",
  "Graduate",
  "Other",
] as const;

export type StudentType = (typeof STUDENT_TYPE_VALUES)[number];

/** Turkish labels shown wherever a student type is displayed. */
export const STUDENT_TYPE_LABELS: Record<StudentType, string> = {
  MiddleSchool: "Ortaokul",
  HighSchool: "Lise",
  University: "Üniversite",
  Graduate: "Mezun",
  Other: "Diğer",
};

/** Ready-to-render `<option>` data for select inputs (value = enum name). */
export const STUDENT_TYPE_OPTIONS = STUDENT_TYPE_VALUES.map((value) => ({
  value,
  label: STUDENT_TYPE_LABELS[value],
}));

/** Type guard for narrowing an unknown value to a valid {@link StudentType}. */
export function isStudentType(value: unknown): value is StudentType {
  return typeof value === "string" && (STUDENT_TYPE_VALUES as readonly string[]).includes(value);
}

/** Safe label lookup — returns undefined for unknown/absent values. */
export function studentTypeLabel(value: string | null | undefined): string | undefined {
  return isStudentType(value) ? STUDENT_TYPE_LABELS[value] : undefined;
}

/** Shared zod validator: accepts only a known enum name. */
export const studentTypeSchema = z.enum(STUDENT_TYPE_VALUES, { error: "Öğrenim durumunu seç." });
