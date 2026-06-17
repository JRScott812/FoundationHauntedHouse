import qs from "qs";
import axios from "axios";

const US_PHONE_REGEX = /^\+1\d{10}$/;

export function isValidSmsRecipient(phone: string): boolean {
  return US_PHONE_REGEX.test(phone);
}

function getTwilioConfig() {
  return {
    accountSid: process.env.TWILIO_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    twilioNumber: process.env.TWILIO_PHONE_NUMBER
  };
}

export async function sendTwilioSms(to: string, body: string): Promise<void> {
  const { accountSid, authToken, twilioNumber } = getTwilioConfig();

  if (!accountSid || !authToken || !twilioNumber) {
    throw new Error("Twilio credentials are not configured in .env");
  }

  if (!isValidSmsRecipient(to)) {
    throw new Error("Invalid US phone number format (+1##########)");
  }

  if (!body.trim()) {
    throw new Error("SMS body cannot be empty");
  }

  const payload = qs.stringify({
    Body: body,
    From: twilioNumber,
    To: to
  });

  await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    payload,
    {
      auth: {
        username: accountSid,
        password: authToken
      }
    }
  );
}
