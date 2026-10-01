# agenten

Slack-bot drevet av Claude, bygget med Next.js og TypeScript. Snakk med den i DM eller ved å nevne den (`@agenten`) i en kanal. Den svarer i tråd og bruker trådhistorikken som kontekst.

## Oppsett

1. Opprett en Slack-app (api.slack.com/apps) med bot-scopes: `app_mentions:read`, `chat:write`, `im:history`, `channels:history`, `groups:history`.
2. Under *Event Subscriptions*, sett Request URL til `https://<ditt-domene>/api/slack/events` og abonner på bot-eventene `app_mention` og `message.im`.
3. Kopier `.env.example` til `.env.local` og fyll inn `ANTHROPIC_API_KEY`, `SLACK_BOT_TOKEN` og `SLACK_SIGNING_SECRET`.
4. `npm install && npm run dev` (bruk f.eks. ngrok for lokal testing), eller deploy til Vercel.
