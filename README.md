# agenten

Slack-bot drevet av Claude (Socket Mode, TypeScript). Snakk med den i DM eller ved å nevne den (`@agenten`) i en kanal. Den svarer i tråd og bruker trådhistorikken som kontekst.

## Oppsett

1. Opprett Slack-appen fra `slack-app-manifest.yaml` (api.slack.com/apps → Create New App → From a manifest) og installer den i workspacet.
2. Lag et app-level token med scope `connections:write` under *Basic Information* → *App-Level Tokens* (`xapp-…`).
3. Kopier `.env.example` til `.env.local` og fyll inn `ANTHROPIC_API_KEY`, `SLACK_BOT_TOKEN` (`xoxb-…`) og `SLACK_APP_TOKEN`.
4. `npm install && node --env-file=.env.local node_modules/.bin/tsx src/index.ts` (eller `npm run start` hvis variablene er satt i miljøet).

Boten må kjøre som en prosess som alltid er oppe (egen server, VPS eller PC).

## Verktøy

Agenten har Claudes innebygde verktøy: nettsøk (`web_search`), nettsider (`web_fetch`) og kodekjøring i en egen sandkasse (`code_execution`, bash og filsystem). Sandkassen gjenbrukes i samme tråd så lenge containeren lever.
