import { after } from "next/server";
import { respond, type ChatMessage } from "@/lib/agent";
import { slack, verifySlackSignature } from "@/lib/slack";

export const maxDuration = 60;

type SlackEvent = {
  type: string;
  user?: string;
  bot_id?: string;
  subtype?: string;
  text?: string;
  channel: string;
  channel_type?: string;
  ts: string;
  thread_ts?: string;
};

async function handle(event: SlackEvent, botUserId: string) {
  const threadTs = event.thread_ts ?? event.ts;
  const replies = await slack.conversations.replies({ channel: event.channel, ts: threadTs, limit: 30 });
  const mention = new RegExp(`<@${botUserId}>`, "g");

  const history: ChatMessage[] = [];
  for (const m of replies.messages ?? []) {
    const role = m.user === botUserId || m.bot_id ? "assistant" : "user";
    const content = (m.text ?? "").replace(mention, "").trim();
    if (!content) continue;
    const last = history[history.length - 1];
    if (last && last.role === role) last.content += "\n" + content;
    else history.push({ role, content });
  }
  if (history.length === 0 || history[0].role !== "user") return;

  const text = await respond(history);
  await slack.chat.postMessage({ channel: event.channel, thread_ts: threadTs, text: text || "(tomt svar)" });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySlackSignature(raw, req.headers)) return new Response("invalid signature", { status: 401 });
  if (req.headers.get("x-slack-retry-num")) return new Response("ok");

  const body = JSON.parse(raw);
  if (body.type === "url_verification") return Response.json({ challenge: body.challenge });

  if (body.type === "event_callback") {
    const event: SlackEvent = body.event;
    const botUserId: string = body.authorizations?.[0]?.user_id;
    const isDm = event.type === "message" && event.channel_type === "im";
    const isMention = event.type === "app_mention";
    const ignore = event.bot_id || event.subtype || event.user === botUserId;
    if ((isDm || isMention) && !ignore) {
      after(() =>
        handle(event, botUserId).catch((err) => {
          console.error("agenten feilet", err);
          return slack.chat.postMessage({
            channel: event.channel,
            thread_ts: event.thread_ts ?? event.ts,
            text: "Noe gikk galt, prøv igjen.",
          });
        }),
      );
    }
  }
  return new Response("ok");
}
