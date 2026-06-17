import { describe, expect, it } from "vitest";
import { isValidUsPhone, normalizePhone } from "@/utils/phone";

describe("phone utils", () => {
  it("validates anchored US phone numbers", () => {
    expect(isValidUsPhone("+15555550123")).toBe(true);
    expect(isValidUsPhone("5555550123")).toBe(false);
    expect(isValidUsPhone("abc1234567890xyz")).toBe(false);
  });

  it("normalizes 10-digit numbers to +1 prefix", () => {
    expect(normalizePhone("5555550123", true)).toBe("+15555550123");
  });

  it("returns null when SMS is disabled and phone is invalid", () => {
    expect(normalizePhone("invalid", false)).toBe(null);
  });
});
