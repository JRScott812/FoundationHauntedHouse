import { sendSms } from "@/api/sms";
import type { Group } from "@/types/group";

export function registrationSmsBody(group: Group): string {
  return (
    `You are in line for Foundation's open house!` +
    `\nGroup name: ${group.name}` +
    `\nGroup number: ${group.number}`
  );
}

export function nextInLineSmsBody(group: Group): string {
  return (
    `You are next in line for Foundation's open house! ` +
    `Please make your way to the Sammy lobby if you're not there already!` +
    `\n${group.name}` +
    `\nGroup number: ${group.number}`
  );
}

export async function notifyGroupBySms(
  group: Group,
  body: string,
  onResult?: (result: { ok: boolean; error?: string }) => void
): Promise<void> {
  if (!group.notifyByText || !group.phone) return;

  const result = await sendSms(group.phone, body);
  onResult?.(result);
}
