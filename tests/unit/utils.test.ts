import { describe, expect, it } from "vitest";
import { cn, formatDateTime } from "@/lib/utils";

/** Unit tests for the shared class-composition and date-formatting primitives. */

describe("cn", () => {
  it("joins truthy class names and skips falsy ones", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("resolves conflicting tailwind utilities with the last one winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("supports conditional object and array syntax from clsx", () => {
    expect(cn(["p-2", { hidden: false, block: true }])).toBe("p-2 block");
  });

  it("returns an empty string for no meaningful input", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("formatDateTime", () => {
  it("returns an em dash for null, undefined or empty input", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime("")).toBe("—");
  });

  it("returns an em dash for an unparseable date string", () => {
    expect(formatDateTime("not-a-date")).toBe("—");
  });

  it("formats a valid ISO timestamp into a non-empty localized string", () => {
    const formatted = formatDateTime("2026-07-26T14:30:00.000Z");
    expect(formatted).not.toBe("—");
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
    // Should contain the year regardless of tr-TR ordering.
    expect(formatted).toContain("2026");
  });
});
