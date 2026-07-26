import { describe, expect, it } from "vitest";
import { z } from "zod";
import { forward, forwardQuery, problem, readJson } from "@/lib/api/route-helpers";
import type { BackendResponse } from "@/lib/api/types";

/**
 * Unit tests for the server-only route-handler helpers. These build the responses
 * every handler returns, so their branches (empty bodies, validation shaping,
 * query allow-listing) are the contract the whole BFF relies on.
 */

function req(url: string, init?: RequestInit) {
  return new Request(url, init);
}

describe("forwardQuery", () => {
  it("keeps only allow-listed keys and preserves their values", () => {
    const qs = forwardQuery(req("http://x/api/roles?tenantId=t1&evil=1&page=2"), ["tenantId", "page"]);
    expect(qs).toBe("?tenantId=t1&page=2");
  });

  it("drops keys that are absent or empty", () => {
    expect(forwardQuery(req("http://x/api/roles?tenantId="), ["tenantId"])).toBe("");
    expect(forwardQuery(req("http://x/api/roles"), ["tenantId"])).toBe("");
  });

  it("returns an empty string when no keys are requested", () => {
    expect(forwardQuery(req("http://x/api/roles?tenantId=t1"), [])).toBe("");
  });

  it("encodes special characters in the forwarded value", () => {
    const qs = forwardQuery(req("http://x/api/roles?tenantId=a%20b"), ["tenantId"]);
    expect(qs).toBe("?tenantId=a+b");
  });
});

describe("forward", () => {
  it("returns a 204-style empty body when data is null", async () => {
    const res = forward({ ok: true, status: 204, data: null } as BackendResponse);
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });

  it("returns an empty body when data is undefined", async () => {
    const res = forward({ ok: true, status: 200, data: undefined } as unknown as BackendResponse);
    expect(await res.text()).toBe("");
  });

  it("serialises the data as JSON and preserves the status", async () => {
    const res = forward({ ok: true, status: 201, data: { id: "r1" } } as BackendResponse);
    expect(res.status).toBe(201);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ id: "r1" });
  });

  it("forwards an error status together with its problem body", async () => {
    const res = forward({ ok: false, status: 400, data: { title: "Hata", status: 400 } } as BackendResponse);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ title: "Hata" });
  });

  it("forwards falsy-but-present data such as 0 and false", async () => {
    const zero = forward({ ok: true, status: 200, data: 0 } as unknown as BackendResponse);
    expect(await zero.json()).toBe(0);
    const bool = forward({ ok: true, status: 200, data: false } as unknown as BackendResponse);
    expect(await bool.json()).toBe(false);
  });
});

describe("problem", () => {
  it("builds a problem+json body with a default title", async () => {
    const res = problem(500, "Sunucu hatası.");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ status: 500, title: "Error", detail: "Sunucu hatası." });
  });

  it("lets extra fields override the title and add metadata", async () => {
    const res = problem(400, "Geçersiz.", { title: "Geçersiz istek", correlationId: "c1" });
    expect(await res.json()).toEqual({
      status: 400,
      title: "Geçersiz istek",
      detail: "Geçersiz.",
      correlationId: "c1",
    });
  });
});

describe("readJson", () => {
  const schema = z.object({ name: z.string().min(1, "Ad gerekli.") });

  it("returns the parsed data on a valid body", async () => {
    const request = req("http://x", { method: "POST", body: JSON.stringify({ name: "Ada" }) });
    const result = await readJson(request, schema);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ name: "Ada" });
  });

  it("returns a 400 problem when the body is not valid JSON", async () => {
    const request = req("http://x", { method: "POST", body: "{not json" });
    const result = await readJson(request, schema);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(400);
    const body = await result.error!.json();
    expect(body.title).toBe("Geçersiz istek");
  });

  it("shapes zod issues into an RFC 7807 field-keyed errors map", async () => {
    const request = req("http://x", { method: "POST", body: JSON.stringify({ name: "" }) });
    const result = await readJson(request, schema);
    expect(result.data).toBeNull();
    const body = await result.error!.json();
    expect(body.status).toBe(400);
    expect(body.title).toBe("Bir veya daha fazla doğrulama hatası oluştu.");
    expect(body.errors).toEqual({ name: ["Ad gerekli."] });
  });

  it("collects multiple messages for the same field", async () => {
    const multi = z.object({ code: z.string().min(3, "En az 3.").regex(/^\d+$/, "Sadece rakam.") });
    const request = req("http://x", { method: "POST", body: JSON.stringify({ code: "a" }) });
    const result = await readJson(request, multi);
    const body = await result.error!.json();
    expect(body.errors.code).toEqual(["En az 3.", "Sadece rakam."]);
  });

  it("keys a top-level (root) validation error under '_'", async () => {
    const rootSchema = z.string();
    const request = req("http://x", { method: "POST", body: JSON.stringify(123) });
    const result = await readJson(request, rootSchema);
    const body = await result.error!.json();
    expect(Object.keys(body.errors)).toContain("_");
  });
});
