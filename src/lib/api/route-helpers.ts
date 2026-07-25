import "server-only";

import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import type { BackendResponse, ProblemDetails } from "./types";

/**
 * Rebuilds a `?key=value` query string from selected params of an incoming request,
 * dropping absent ones. Used to pass tenant-scoping params (e.g. `tenantId`) straight
 * through to the backend without letting arbitrary query keys leak.
 */
export function forwardQuery(request: Request, keys: readonly string[]): string {
  const source = new URL(request.url).searchParams;
  const out = new URLSearchParams();
  for (const key of keys) {
    const value = source.get(key);
    if (value) out.set(key, value);
  }
  const qs = out.toString();
  return qs ? `?${qs}` : "";
}

/** Forwards a backend response to the browser, preserving status and (204) empty bodies. */
export function forward<T>(res: BackendResponse<T>): NextResponse {
  if (res.data === null || res.data === undefined) {
    return new NextResponse(null, { status: res.status });
  }
  return NextResponse.json(res.data, { status: res.status });
}

/** Builds a problem+json error response from within a route handler. */
export function problem(status: number, detail: string, extra: Partial<ProblemDetails> = {}): NextResponse {
  const body: ProblemDetails = { status, title: extra.title ?? "Error", detail, ...extra };
  return NextResponse.json(body, { status });
}

/**
 * Reads and validates a JSON request body against a zod schema.
 * Returns either the parsed value or a 400 problem+json response ready to return.
 */
export async function readJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { data: null, error: problem(400, "İstek gövdesi geçerli bir JSON olmalı.", { title: "Geçersiz istek" }) };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_";
      (errors[key] ??= []).push(issue.message);
    }
    return {
      data: null,
      error: NextResponse.json(
        { title: "Bir veya daha fazla doğrulama hatası oluştu.", status: 400, errors } satisfies ProblemDetails,
        { status: 400 },
      ),
    };
  }

  return { data: result.data, error: null };
}
