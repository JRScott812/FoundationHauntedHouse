// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { isValidSmsRecipient, sendTwilioSms } from "./sms.js";

vi.mock("axios", () => ({
  default: {
    post: vi.fn()
  }
}));

describe("server sms", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("validates US E.164 phone numbers", () => {
    expect(isValidSmsRecipient("+15555550123")).toBe(true);
    expect(isValidSmsRecipient("5555550123")).toBe(false);
    expect(isValidSmsRecipient("+1555555012")).toBe(false);
  });

  it("rejects sends when Twilio env vars are missing", async () => {
    await expect(sendTwilioSms("+15555550123", "hello")).rejects.toThrow(
      "Twilio credentials are not configured in .env"
    );
  });

  it("rejects invalid phone numbers before calling Twilio", async () => {
    vi.stubEnv("TWILIO_SID", "sid");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "token");
    vi.stubEnv("TWILIO_PHONE_NUMBER", "+15555550999");

    await expect(sendTwilioSms("invalid", "hello")).rejects.toThrow(
      "Invalid US phone number format (+1##########)"
    );
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("rejects empty message bodies", async () => {
    vi.stubEnv("TWILIO_SID", "sid");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "token");
    vi.stubEnv("TWILIO_PHONE_NUMBER", "+15555550999");

    await expect(sendTwilioSms("+15555550123", "   ")).rejects.toThrow("SMS body cannot be empty");
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("calls Twilio when credentials and payload are valid", async () => {
    vi.stubEnv("TWILIO_SID", "sid");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "token");
    vi.stubEnv("TWILIO_PHONE_NUMBER", "+15555550999");
    vi.mocked(axios.post).mockResolvedValue({ data: { sid: "SM123" } });

    await sendTwilioSms("+15555550123", "You are next in line");

    expect(axios.post).toHaveBeenCalledOnce();
    const [url, body, config] = vi.mocked(axios.post).mock.calls[0];
    expect(url).toBe("https://api.twilio.com/2010-04-01/Accounts/sid/Messages.json");
    expect(body).toContain("Body=");
    expect(body).toMatch(/You(\+|%20)are(\+|%20)next(\+|%20)in(\+|%20)line/);
    expect(body).toContain("To=%2B15555550123");
    expect(config).toMatchObject({ auth: { username: "sid", password: "token" } });
  });
});
