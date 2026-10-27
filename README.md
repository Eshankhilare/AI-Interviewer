# AI Interviewer System

A comprehensive AI-powered technical interview platform that conducts realistic interviews, adapts questions based on candidate responses, evaluates answers, and generates detailed performance reports.

## Live Demo

🔗 [**https://ai-interviewer-rho-hazel.vercel.app**](https://ai-interviewer-rho-hazel.vercel.app)

## Architecture

```
Browser (React + Tailwind, 5173)
        |  REST + JWT
        v
Spring Boot backend (8080)  --->  Python FastAPI AI service (8001)
        |  JPA                            |  Gemini, Edge-TTS, Deepgram
        v                                 v
  MySQL / TiDB (H2 with the local profile)   outbound provider calls
```

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (for reports)
- Axios
- Three.js (3D avatar)
- MediaPipe (body language analysis)
- face-api.js (proctoring)

### Backend
- Java 21 + Spring Boot 3.4
- Spring Security + JWT
- Spring Data JPA
- MySQL Connector

### AI Service
- Python 3.11+
- FastAPI
- LangChain
- Gemini 2.5 Flash (free tier)
- Edge-TTS (neural voice)
- Deepgram (speech-to-text)

### Database
- TiDB Cloud (free tier) / MySQL 8.0+

## Project Structure

```
ai-interviewer/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/interviewer/
│   │   ├── config/         # Security, CORS config
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── entity/         # JPA entities
│   │   ├── repository/     # Data repositories
│   │   ├── security/       # JWT utilities
│   │   └── service/        # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── ai-service/             # Python FastAPI AI service
│   ├── app/
│   │   ├── routers/        # API routes
│   │   └── services/       # AI services
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── data/           # Static data (job roles)
│   │   └── context/        # React context
│   ├── DESIGN.md           # Design system
│   └── package.json
├── database/               # Database schema
│   └── schema.sql
├── render.yaml             # Render deployment config
└── docs/                   # Documentation
```

## Features

### Core Features
- User authentication with JWT
- Resume upload and parsing (paste text or upload `.txt` / `.md`)
- Job description management with 20 predefined job roles
- AI-powered question generation (Gemini 2.5 Flash)
- Adaptive interview flow: a strong answer (>= 80) pulls the next question to HARD, a weak one (<= 50) to EASY
- Answer evaluation with a five-criterion rubric; the final score is computed in code, not by the model
- Performance reports with radar charts and PDF export, built from real per-answer scores
- Text, voice, and coding interview modes

### Scoring

Each answer is scored 0-10 on relevance, technical depth, correctness, clarity and
evidence. The model may only return those criteria plus a verbatim quote from the
answer for each one; the 0-100 score, grade and recommendation level are derived
from them in code. A quote that cannot be found in the answer caps that criterion,
and an unusable model response fails closed instead of defaulting to a middling
score. See [bench/RESULTS.md](bench/RESULTS.md) for what the evaluator is measured
against and [docs/API.md](docs/API.md) for the wire format.

### Camera & Analysis Features
- **Proctoring Monitor** — optional, consent-gated; face presence, gaze and blink
  detection run in the browser and no video is uploaded
- **Body Language Analyzer** — posture, engagement, eye contact, fidgeting detection
- **Speech Emotion Analyzer** — pitch, energy, speaking rate analysis
- **Digital Avatar** — 3D animated interviewer with lip sync

### Voice Features
- Text-to-Speech (Edge-TTS neural voices, free)
- Speech-to-Text (Deepgram)
- Auto-speaking avatar
- Play/pause/mute controls

## Configuration

All configuration is environment-driven; the committed examples list every
variable with a safe default.

| File | Copy to | Notes |
|---|---|---|
| `backend/.env.example` | `backend/.env` or your shell | `JWT_SECRET` is required in production (32+ bytes). Empty locally means a random key per boot. `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` enable Google sign-in (free); without them the button is hidden. Set `GOOGLE_REDIRECT_URI` to the backend callback and `FRONTEND_URL` to the browser origin. |
| `ai-service/.env.example` | `ai-service/.env` | `LLM_API_KEY` (or `GEMINI_API_KEY`) enables the rubric evaluator; without it the heuristic fallback runs. The free tier allows about 20 requests per model per day, which is roughly two three-question interviews. `AI_SERVICE_TOKEN` must match the backend. |
| `frontend/.env.example` | `frontend/.env.local` | `VITE_API_URL` only; the browser never talks to the AI service directly. `VITE_CONTACT_EMAIL` and `VITE_CONTACT_PHONE` fill the contact box on the legal pages (the phone is hidden when empty). |

### Optional Upstash Redis cache

The AI service caches **identical** rubric evaluations (7 days) and follow-up
questions (24 hours). Without Redis it keeps that cache in process memory; add
the two REST values to share it across restarts and instances:

```sh
# ai-service/.env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token
```

Copy them from the Upstash console → your Redis database → **REST API**, not the
Redis protocol URL. The cache fails open: if Upstash is unreachable the service
continues normally. It only speeds up repeated identical requests; a new answer
still takes the full evaluation time, and first page load is frontend assets,
not Redis. Cached values are derived evaluation text, never raw resumes.

Nothing in the repository contains a real credential. If you deployed from an
earlier commit, rotate the TiDB password, the local MySQL password, the JWT
secret and the admin keep-alive password — they were committed and must be
considered public.

## Deployment

**Zero-cost:** Oracle Cloud Always Free (one VM, `docker-compose.free.yml`) or
Northflank Sandbox (2 services + MySQL, always on). Both use Cloudflare Pages
for the frontend. See [DEPLOY.md](DEPLOY.md) and
[`deploy/oracle/README.md`](deploy/oracle/README.md).

**Managed (~$5–10/month):** Cloudflare Pages + Railway (Singapore) + TiDB Cloud
Starter. Full steps and variables are in [DEPLOY.md](DEPLOY.md).

- **Frontend:** Cloudflare Pages, root `frontend`, `npm ci && npm run build`,
  output `dist`, `VITE_API_URL=https://api.example.com`.
- **Backend + AI service:** two Railway services from this repo, root
  directories `backend` and `ai-service`; both have `railway.toml`.
- **Database:** TiDB Cloud Starter (MySQL compatible, free tier).
- **Alternative:** `render.yaml` still works for Render, but the free plan
  sleeps after 15 minutes; use a paid instance for a live demo.

## Default Credentials

Register a new account at the app. No default credentials are provided for security.
`database/schema.sql` still contains an unused bcrypt admin hash from an earlier
version whose password is unknown; do not assume it works.

## Documentation

| Document | What it covers |
|---|---|
| [docs/API.md](docs/API.md) | Every endpoint, error shape, auth rules |
| [AUDIT.md](AUDIT.md) | Findings from the audit, with status and evidence |
| [bench/RESULTS.md](bench/RESULTS.md) | Evaluator benchmark and its limits |
| [DEMO.md](DEMO.md) | Two-minute walkthrough for a demo or judging session |
| [DEPLOY.md](DEPLOY.md) | Cloudflare Pages + Railway + TiDB, Fly.io alternative, env reference |

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

## Development

### Running Locally

```bash
# 1. AI service (port 8001)
cd ai-service
python -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# 2. Backend (port 8082 with the in-memory profile, no MySQL needed)
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local

# or against MySQL/TiDB:
mysql -u root -p < database/schema.sql
mvn spring-boot:run

# 3. Frontend (port 5173)
cd frontend
npm install
# the local profile runs on 8082, so point the frontend at it once:
echo "VITE_API_URL=http://localhost:8082" > .env.local
npm run dev
```

The `local` profile starts H2 in memory on port 8082 and needs no database. It
drops everything on restart and uses a random JWT key, so register again after
each restart.

### Tests and checks

```bash
cd backend  && mvn test                  # 11 tests: security, state machine, reports, rate limit
cd ai-service && python -m pytest        # 12 tests: rubric scoring, injection, grounding, auth
cd frontend && npm test && npm run lint && npm run build
python bench/test_bench.py               # benchmark self-check
```

### Evaluator benchmark

```bash
# heuristic fallback (no API key) - proves the plumbing, not the accuracy
python bench/run.py --mode local --repeats 2 --out bench/RESULTS.md

# rubric evaluator, scored against your own labels
# (set LLM_API_KEY and fill human_score in bench/answers.csv first)
python bench/run.py --mode local --repeats 3 --out bench/RESULTS.md
```

`bench/RESULTS.md` records what the last run could and could not show, including
the per-answer scores that the heuristic gets wrong.

### Building for Production

```bash
# Backend
cd backend
mvn clean package

# Frontend
cd frontend
npm run build
```

## License

MIT License
