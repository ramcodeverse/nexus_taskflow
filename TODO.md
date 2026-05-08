# Deployment TODO (Live / Railway)

- [x] Add production start script(s) to run built assets + Express API (`server.ts`).
- [x] Add `Procfile` for Railway (web process) to start the server in production.
- [x] Add `.env.example` and update README with Railway deployment steps + required env vars.

- [x] Ensure `server.ts` only serves SPA from `dist/` in production and uses `PORT` env var if provided.

- [x] Add basic health endpoint and verify routes under production build.

- [x] Run local production build + start to validate (`npm run build` + `npm run start:prod`).


