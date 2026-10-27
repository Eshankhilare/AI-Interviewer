# Northflank Sandbox — the zero-ops free option

Northflank's **Sandbox** is free, needs no card, and is **always on** (no
sleeping): 2 services, 1 database, 2 cron jobs, up to **$20/month of resources**
on Northflank Cloud. That is enough for the Spring Boot backend, the FastAPI
service and MySQL if you size the containers carefully.

Trade-offs: the free plan is explicitly "not for production", the $20 cap is
tight for two JVMs, and the closest region is not India (check the region list
in the dashboard). Latency from India will be higher than the Oracle VM.

## 1. Create the project and database

1. Sign up at <https://app.northflank.com/signup>; the **Sandbox** plan is free.
2. Create a project, then **Addon → MySQL**. Pick the smallest plan.
3. Copy the internal host, port, database, user and password; use them in the
   backend's `SPRING_DATASOURCE_*`.
4. If the database addon pushes you near $20, use **TiDB Cloud Starter** free
   instead and delete the addon.

## 2. Backend service

1. **Create Service → Build from Git** → select this repository.
2. Build: Dockerfile, path `backend/Dockerfile`.
3. Port: HTTP **8080**; health check `/api/health`.
4. Resources: **0.5 vCPU / 768 MB** (roughly $10.6/month at current rates).
5. Variables (from `deploy/backend.env.example`):
   - `SPRING_PROFILES_ACTIVE=production`
   - `SPRING_DATASOURCE_URL` (internal MySQL or TiDB with TLS)
   - `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`, `AI_SERVICE_TOKEN`
   - `AI_SERVICE_URL`: the AI service internal address shown in the dashboard,
     usually `http://<ai-service>:8001`
   - `APP_CORS_ALLOWED_ORIGINS=https://<your-frontend>`
   - `FRONTEND_URL=https://<your-frontend>`
   - `JAVA_TOOL_OPTIONS=-Xmx512m`, `PORT=8080`
6. Expose the HTTP port publicly; copy the generated URL.

## 3. AI service

1. Second service, same repository, Dockerfile `ai-service/Dockerfile`.
2. Port: HTTP **8001**; health check `/health`.
3. Resources: **0.25 vCPU / 512 MB** (roughly $7.6/month).
4. Variables:
   - `LLM_PROVIDER=gemini`, `LLM_MODEL=gemini-3.5-flash-lite`, `LLM_API_KEY`
   - `AI_SERVICE_TOKEN` (same value as the backend)
   - `ALLOWED_ORIGINS=https://<your-frontend>`
   - `TTS_PROVIDER=edge`, `STT_PROVIDER=mock`, `PORT=8001`

## 4. Frontend

Use **Cloudflare Pages** (free, unlimited static bandwidth):

- Root `frontend`, build `npm ci && npm run build`, output `dist`
- `VITE_API_URL=https://<backend-public-url>` (no trailing `/api`)
- `_redirects` and `_headers` are already in `frontend/public`

## 5. Budget check

At Northflank's published rates (Oct 2026):

| Service | Size | Approx/month |
|---|---|---|
| Backend | 0.5 vCPU / 768 MB | $10.66 |
| AI | 0.25 vCPU / 512 MB | $7.63 |
| MySQL addon | smallest | remaining credit |

That is ~$18.3 before storage. If the dashboard shows you above $20, reduce the
AI service to 0.1 vCPU, or move the database to TiDB Cloud Starter (free) and
drop the addon. The Sandbox also allows one BYOC cluster, but your cloud bill
is then yours.

## 6. Verify

```bash
curl -s https://<backend-url>/api/health
curl -s https://<backend-url>/health      # AI service if exposed
```

Register, create a job description, run one interview, open the report. If the
backend returns 502 on the first request after a deploy, give it 20–30 s; the
JVM is still starting. Services do not sleep on Sandbox.

## 7. Why not Render free here

Render free gives 750 instance hours per workspace per month and sleeps after
15 idle minutes. Two always-on services (2 × ~730 h) exceed the allowance, and
the wake-up is about a minute. Northflank Sandbox is the better free no-ops
choice; Oracle is the better free performance choice.
