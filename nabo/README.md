# Nabo application

The Next.js application for Nabo. Run it from this directory:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

The scripted demo works without credentials. AI blocks require `ANTHROPIC_API_KEY`; live advertising actions additionally require the explicitly configured MCP integration described in the repository root [README](../README.md).
