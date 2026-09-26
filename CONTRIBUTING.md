# Contributing to Nabo

## Safety first

The scripted journey must remain synthetic. Do not commit advertising credentials, account identifiers, customer lists, client conversations, or campaign exports. New live actions must require explicit configuration and preserve demo mode as the default.

## Development

```bash
cd nabo
npm ci
npm run lint
npm run build
```

Open an issue before changing the note model or adding a new external write integration. Pull requests should explain the user-visible workflow and how accidental live execution is prevented.
