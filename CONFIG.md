PHR Frontend — Configuration Guide

Purpose
- Document Vite env usage and standard scripts for the PHR frontend.

Env files
- `.env.example` — template (committed)
- `.env` — local defaults
- `.env.local` — developer overrides (gitignored)
- `.env.development` / `.env.production` — optional mode-specific files

Precedence (highest → lowest)
1. Process environment variables
2. `.env.local`
3. `.env.development` / `.env.production`
4. `.env`

Key env vars in this project
- `VITE_API_URL` — backend API base URL used by `src/api/client.ts`
- `VITE_REALTIME_POLL_MS` — poll interval fallback when sockets are unavailable
- `VITE_APP_VERSION` — build-time app version string
- `VITE_GOOGLE_CLIENT_ID` — optional Google OAuth client ID

Standard scripts (in `package.json`)
- `npm run dev` — development hot-reload
- `npm run build` — build production bundle
- `npm run start` — preview built bundle
- `npm run prod` — build + preview using prod mode

Notes
- Vite exposes env vars via `import.meta.env`.
- For Docker/compose runs, set `VITE_API_URL` to the container-accessible API host (e.g., `http://phr-backend:8000`).
- Avoid committing secrets to the repo; use `.env.local` for personal testing only.
