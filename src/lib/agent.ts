import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5";

const SYSTEM = `Du er «agenten», en hjelpsom assistent som svarer i Slack.
Svar på samme språk som brukeren (norsk som standard), kort og konkret.
Bruk Slack-formatering (*fet*, _kursiv_, \`kode\`), ikke Markdown-overskrifter.`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function respond(history: ChatMessage[]): Promise<string> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM,
    messages: history,
  });
  return res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
}
