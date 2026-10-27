# Deploy

The fast, low-ops path is **Cloudflare Pages + Railway (Singapore) + TiDB
Cloud Starter**. Fly.io and Render are kept as alternatives.

| Piece | Recommended | Why |
|---|---|---|
| Frontend | Cloudflare Pages | Static Vite build, unlimited static bandwidth, global edge, free |
| Backend | Railway, Singapore | Docker, always-on, no cold starts, close to India |
| AI service | Railway, same project, Singapore | Private network to the backend, 512 MB is enough |
| Database | TiDB Cloud Starter | MySQL-compatible, 5 GiB + 50M RU free per instance |

Estimated cost: **$0–10/month** (Pages and TiDB free; Railway Hobby starts at $5).

> Do not use Render's free plan for a demo: it sleeps after 15 minutes and the
> first request takes 30–60 s. `render.yaml` is still valid if you prefer Render,
> but run it on a paid instance.

---

## Architecture

```
Browser
  │  https://app.example.com      → Cloudflare Pages (static React)
  │  https://api.example.com      → Railway backend (Spring Boot)
  │
  └─ backend ── private http ──▶ AI service (FastAPI, Railway)
        │
        └── MySQL/TLS ──▶ TiDB Cloud Starter
```

The browser never calls the AI service directly. TTS and transcription go
through the backend proxy with `AI_SERVICE_TOKEN`.

---

## Option A — Cloudflare Pages + Railway + TiDB (recommended)

### 1. Database (TiDB Cloud Starter)

1. Create a **Starter** cluster at <https://tidbcloud.com> (free, no card).
2. In the SQL editor: `CREATE DATABASE ai_interviewer;`
3. Copy the host, port `4000`, user (`*.root`) and password.
4. The backend URL must include TLS:
   ```text
   jdbc:mysql://HOST:4000/ai_interviewer?useSSL=true&requireSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
   ```
5. `ddl-auto=update` creates the tables on first boot. Keep it for the first
   deploy, then move to Flyway when the schema stabilises.

### 2. Railway project (backend + AI service)

1. **New Project → Deploy from GitHub repo** and select this repository.
2. Service 1 (backend):
   - Settings → Source → **Root Directory**: `backend`
   - `backend/railway.toml` supplies the Dockerfile and `/api/health` check.
   - Variables: copy `deploy/backend.env.example`. Set:
     - `SPRING_PROFILES_ACTIVE=production`
     - `SPRING_DATASOURCE_*` from TiDB
     - `JWT_SECRET` (`openssl rand -base64 48`)
     - `AI_SERVICE_URL=http://ai-service.railway.internal:8001`
     - `AI_SERVICE_TOKEN=<random>`
     - `APP_CORS_ALLOWED_ORIGINS=https://app.example.com`
     - `FRONTEND_URL=https://app.example.com`
     - Google OAuth values if the button should work
   - 1 GB RAM; `JAVA_TOOL_OPTIONS=-Xmx512m`.
3. Service 2 (AI): same repo again, Root Directory `ai-service`:
   - `ai-service/railway.toml` supplies the Dockerfile and `/health` check.
   - Variables: copy `deploy/ai-service.env.example`.
     - `LLM_API_KEY`, `LLM_MODEL=gemini-3.5-flash-lite`
     - `AI_SERVICE_TOKEN` **same value** as the backend
     - `ALLOWED_ORIGINS=https://app.example.com`
   - 512 MB RAM.
4. Networking:
   - Generate a public domain for the backend (Railway Settings → Networking).
   - The AI service can stay private; the backend uses
     `http://<service-name>.railway.internal:8001`.
   - If you rename the AI service, update `AI_SERVICE_URL` to match.
5. Set the backend's custom domain to `api.example.com` (Railway → Networking →
   Custom Domain, then add the CNAME at Cloudflare).

`PORT=8080` / `PORT=8001` are set explicitly in the env examples so the private
URLs are predictable; both Dockerfiles honour `$PORT`.

### 3. Frontend (Cloudflare Pages)

1. Workers & Pages → **Create → Pages → Connect to Git**.
2. Build settings:
   - Root directory: `frontend`
   - Build command: `npm ci && npm run build`
   - Output directory: `dist`
   - `NODE_VERSION=20`
3. Environment variables: copy `deploy/frontend.env.example`.
   `VITE_API_URL=https://api.example.com` (no trailing `/api`).
4. The SPA fallback and headers are in `frontend/public/_redirects` and
   `frontend/public/_headers`; Vite copies them into `dist`.
5. Add the custom domain `app.example.com` (Cloudflare handles TLS).

Every push to `main` redeploys both Pages and Railway. The existing GitHub
Actions run the tests; `auto-deploy.yml` is only a placeholder.

### 4. Google sign-in (optional)

- Authorised JavaScript origin: `https://app.example.com`
- Authorised redirect URI: `https://api.example.com/api/auth/google/callback`
- Same values in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_REDIRECT_URI`, `FRONTEND_URL`.

### 5. Verify

```bash
curl -s https://api.example.com/api/health      # status UP, db UP, aiService UP
curl -s https://ai.example.com/health           # {"status":"healthy"} (if public)
```

Then in the browser: register → job description → interview → answer → report
→ PDF → practice question. Watch the console for CORS errors.

---

## Option B — Fly.io + Cloudflare Pages + TiDB

Fly has no Mumbai region; use **Singapore (`sin`)**. No cold starts if the
machines stay running.

```bash
fly auth login

# Backend
cd backend
# edit fly.toml: set a unique app name
fly apps create <backend-app-name>
fly secrets set \
  SPRING_PROFILES_ACTIVE=production \
  SPRING_DATASOURCE_URL='jdbc:mysql://HOST:4000/ai_interviewer?useSSL=true&requireSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true' \
  SPRING_DATASOURCE_USERNAME=... \
  SPRING_DATASOURCE_PASSWORD=... \
  JWT_SECRET=... \
  AI_SERVICE_URL=http://<ai-app-name>.internal:8001 \
  AI_SERVICE_TOKEN=... \
  APP_CORS_ALLOWED_ORIGINS=https://app.example.com \
  FRONTEND_URL=https://app.example.com
fly deploy

# AI service
cd ../ai-service
# edit fly.toml: unique app name
fly apps create <ai-app-name>
fly secrets set \
  LLM_API_KEY=... \
  LLM_MODEL=gemini-3.5-flash-lite \
  AI_SERVICE_TOKEN=... \
  ALLOWED_ORIGINS=https://app.example.com
fly deploy
```

Point `api.example.com` at the backend app (`fly certs add api.example.com` or
Cloudflare CNAME). Frontend stays on Cloudflare Pages.

Cost: 1 GB backend + 512 MB AI in Singapore is roughly **$13/month**; TiDB is
free. A `shared-cpu-1x` machine is not a dedicated core, so expect a few
hundred ms of extra CPU time under load.

---

## Option C — one VPS (lowest latency to India)

A single **DigitalOcean Bangalore (BLR1)** or **AWS ap-south-1** box with
Docker Compose and Coolify/Caddy runs all three services plus MySQL. Expect
10–30 ms from India instead of 50–80 ms via Singapore, at $12–24/month, but you
own backups, updates and TLS. Not scripted in this repo.

---

## Environment reference

| Variable | Service | Notes |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | backend | `production` |
| `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | backend | TiDB with TLS |
| `JWT_SECRET` | backend | 32+ bytes, required in production |
| `AI_SERVICE_URL` | backend | Railway private DNS or Fly `.internal` |
| `AI_SERVICE_TOKEN` | both | same random string; required |
| `APP_CORS_ALLOWED_ORIGINS` | backend | exact frontend origin, no `*` |
| `ALLOWED_ORIGINS` | AI | exact frontend origin |
| `FRONTEND_URL` | backend | OAuth return URL |
| `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` | backend | optional |
| `LLM_API_KEY` | AI | Gemini key; without it the heuristic runs |
| `LLM_MODEL` | AI | `gemini-3.5-flash-lite` |
| `TTS_PROVIDER` / `STT_PROVIDER` | AI | `edge` / `mock` |
| `VITE_API_URL` | Pages | build-time, no `/api` suffix |
| `VITE_CONTACT_EMAIL/PHONE` | Pages | legal pages |

Never commit `.env`. The files in `deploy/` are placeholders.

---

## Operational notes

- **Gemini free tier is 20 requests/day/model.** One three-question interview
  spends about nine. For a public URL, use a paid key or Vertex AI; otherwise
  most visitors silently get the keyword fallback.
- **Uploads are ephemeral.** Parsed resume text is stored in the database, but
  the original file is lost on redeploy. Add object storage (R2/S3) if download
  links matter.
- **`ddl-auto=update`** is the first-deploy shortcut. Move to Flyway before the
  schema has data you care about.
- **Rate limits** (`60/min` per IP) and the AI shared token are the abuse
  controls. Keep the AI service private where possible.
- **Background video** is an external CloudFront asset. If it is slow or
  blocked in your region, self-host a compressed version.
- **Health checks**: backend `/api/health`, AI `/health`.
- **Backups**: TiDB Starter has its own backup policy; export before a schema
  change.

## Costs (Oct 2026)

| Setup | Monthly |
|---|---|
| Cloudflare Pages + Railway Hobby + TiDB Starter | ~$5–10 |
| Fly.io (1 GB + 512 MB, Singapore) + TiDB | ~$13 |
| Render paid (two services) + TiDB | ~$14+ |
| DigitalOcean BLR1 2–4 GB VPS + Coolify | ~$12–24 |
| Render free | $0, but sleeps (not suitable for a live demo) |
