import { env } from "@/env";
import twilio from "twilio";

const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function createMessage(message: string, to: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(result.body);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to send verification code');
  }
}
