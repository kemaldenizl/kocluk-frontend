import { isApiError } from "./http-error";

/** Human-readable message for any thrown error, with a friendly note for rate limits. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isRateLimited) return "Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar dene.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Bir şeyler ters gitti. Lütfen tekrar dene.";
}
