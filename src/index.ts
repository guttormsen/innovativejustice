import { App } from "@slack/bolt";
import { respond, type ChatMessage } from "./lib/agent.js";

for (const key of ["SLACK_BOT_TOKEN", "SLACK_APP_TOKEN", "ANTHROPIC_API_KEY"]) {
  if (!process.env[key]) throw new Error(`Mangler miljøvariabel ${key}`);
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

type Msg = { user?: string; bot_id?: string; text?: string };

async function answer(client: typeof app.client, channel: string, threadTs: string, botUserId: string) {
  const replies = await client.conversations.replies({ channel, ts: threadTs, limit: 30 });
  const mention = new RegExp(`<@${botUserId}>`, "g");

  const history: ChatMessage[] = [];
  for (const m of (replies.messages ?? []) as Msg[]) {
    const role = m.user === botUserId || m.bot_id ? "assistant" : "user";
    const content = (m.text ?? "").replace(mention, "").trim();
    if (!content) continue;
    const last = history[history.length - 1];
    if (last && last.role === role) last.content += "\n" + content;
    else history.push({ role, content });
  }
  if (history.length === 0 || history[0].role !== "user") return;

  try {
    const text = await respond(history, `${channel}:${threadTs}`);
    await client.chat.postMessage({ channel, thread_ts: threadTs, text: text || "(tomt svar)" });
  } catch (err) {
    console.error("agenten feilet", err);
    await client.chat.postMessage({ channel, thread_ts: threadTs, text: "Noe gikk galt, prøv igjen." });
  }
}

app.event("app_mention", async ({ event, client, context }) => {
  await answer(client, event.channel, event.thread_ts ?? event.ts, context.botUserId!);
});

app.message(async ({ message, client, context }) => {
  const m = message as { channel_type?: string; subtype?: string; bot_id?: string; channel: string; ts: string; thread_ts?: string };
  if (m.channel_type !== "im" || m.subtype || m.bot_id) return;
  await answer(client, m.channel, m.thread_ts ?? m.ts, context.botUserId!);
});

await app.start();
console.log("agenten kjører (Socket Mode)");
