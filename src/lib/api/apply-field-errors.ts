import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "./http-error";

/**
 * Maps a backend validation error (RFC 7807 `errors` map) onto react-hook-form
 * fields. Backend keys are camelCase and align with our schema field names.
 * Returns true if any field error was applied.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!isApiError(error)) return false;

  let applied = false;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    if (messages.length > 0) {
      const key = (field.charAt(0).toLowerCase() + field.slice(1)) as Path<T>;
      setError(key, { type: "server", message: messages[0] });
      applied = true;
    }
  }
  return applied;
}
