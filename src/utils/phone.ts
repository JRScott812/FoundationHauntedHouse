const US_PHONE_REGEX = /^\+1\d{10}$/;
const DIGITS_REGEX = /(\+1)?[0-9]{10}/;

export function isValidUsPhone(phone: string): boolean {
  return US_PHONE_REGEX.test(phone);
}

export function normalizePhone(phone: string, notifyByText: boolean): string | null {
  if (!phone) {
    return notifyByText ? null : null;
  }

  let normalized = phone.trim();
  if (DIGITS_REGEX.test(normalized) && !normalized.startsWith("+1")) {
    const digits = normalized.replace(/\D/g, "").slice(-10);
    normalized = `+1${digits}`;
  }

  if (!notifyByText && !isValidUsPhone(normalized)) {
    return null;
  }

  return normalized;
}

export function formatPhoneForDisplay(phone: string | null): string {
  if (!phone) return "—";
  return phone;
}
