import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 15000
});

export interface SmsResult {
  ok: boolean;
  error?: string;
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  try {
    await api.post("/api/sms", { to, body });
    return { ok: true };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: string } | undefined)?.error ?? error.message;
      return { ok: false, error: message };
    }
    return { ok: false, error: "Failed to send SMS" };
  }
}
