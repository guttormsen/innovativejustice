import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5";

const SYSTEM = `Du er «agenten», en autonom assistent som svarer i Slack.
Du har tilgang til nettsøk, nettsider (web fetch) og en egen datamaskin (sandkasse med bash og filsystem) der du kan kjøre kode, installere pakker og lage filer.
Bruk verktøyene aktivt når det gjør svaret bedre, i stedet for å gjette.
Svar på samme språk som brukeren (norsk som standard), kort og konkret.
Bruk Slack-formatering (*fet*, _kursiv_, \`kode\`), ikke Markdown-overskrifter.`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

const tools: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20250305", name: "web_search" },
  { type: "web_fetch_20250910", name: "web_fetch" },
  { type: "code_execution_20250825", name: "code_execution" },
];

// Samme "datamaskin" gjenbrukes i en tråd så lenge containeren lever (best effort, i minnet).
const containers = new Map<string, string>();

export async function respond(history: ChatMessage[], threadKey: string): Promise<string> {
  const messages: Anthropic.Messages.MessageParam[] = [...history];
  let text = "";

  for (let turn = 0; turn < 8; turn++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM,
      messages,
      tools,
      ...(containers.has(threadKey) ? { container: containers.get(threadKey)! } : {}),
    });
    if (res.container?.id) containers.set(threadKey, res.container.id);

    text += res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    if (res.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: res.content });
  }
  return text.trim();
}
