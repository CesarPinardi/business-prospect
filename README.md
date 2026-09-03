# Prospect

Prospect is a local-first workspace for finding, organizing, and following up with local business prospects.

The workspace is local-first. Profile settings are validated before persistence and stored in a browser-local SQLite database serialized to `localStorage`; Demo mode does not require a Google credential, hosted database, authentication, or paid service.

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app starts in Demo mode automatically.

Open Settings to configure the profile used for future outreach. Values stay on this device.

## Checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```
