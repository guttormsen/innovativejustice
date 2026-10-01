import { createHmac, timingSafeEqual } from "node:crypto";
import { WebClient } from "@slack/web-api";

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export function verifySlackSignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  const ts = headers.get("x-slack-request-timestamp");
  const sig = headers.get("x-slack-signature");
  if (!secret || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const expected = "v0=" + createHmac("sha256", secret).update(`v0:${ts}:${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}
