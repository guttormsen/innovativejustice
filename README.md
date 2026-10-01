# agenten

Slack-bot drevet av Claude, bygget med Next.js og TypeScript. Snakk med den i DM eller ved å nevne den (`@agenten`) i en kanal. Den svarer i tråd og bruker trådhistorikken som kontekst.

## Oppsett

1. Opprett Slack-appen fra `slack-app-manifest.yaml` (api.slack.com/apps → Create New App → From a manifest). Husk å bytte ut `request_url` med ditt eget domene. Manifestet gir boten et bredt sett bot-scopes.
2. Kopier `.env.example` til `.env.local` og fyll inn `ANTHROPIC_API_KEY`, `SLACK_BOT_TOKEN` og `SLACK_SIGNING_SECRET`.
3. `npm install && npm run dev` (bruk f.eks. ngrok for lokal testing), eller deploy til Vercel.

## Verktøy

Agenten har Claudes innebygde verktøy: nettsøk (`web_search`), nettsider (`web_fetch`) og kodekjøring i en egen sandkasse (`code_execution`, bash og filsystem). Sandkassen gjenbrukes i samme tråd så lenge containeren lever.
