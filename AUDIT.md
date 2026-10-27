# AUDIT.md — AI-Interviewer

**Phase 0 recon and audit**
**Date:** 2026-10-27
**Branch:** `hackathon/polish` (created from `main` @ `68b00b7`)
**Auditor:** automated full-stack review (no source files changed in Phase 0)

> Status values below are the Phase 0 state: **OPEN**, **NOT AN ISSUE**, **CANNOT DETERMINE**.
> They are updated to **FIXED** / **DEFERRED** at the end of Phase 5. Every finding was checked
> against the actual file before being written down. Everything I ran is listed in
> [Verification log](#verification-log); nothing in this document is inferred from the prompt alone.

---

## 1. Executive summary

**Phase 0 finding.** The app built, booted and completed an interview end-to-end, but it was **not
safe to demo as-is**: any logged-in user could read and mutate another user's interview and report,
the answer key (`expectedAnswer`) was sent to the browser before the candidate answered,
double-submitting an answer skipped a question, and a completed interview still accepted answers.
The fallback report (AI service down) was a hard-coded **75 / B** that looked exactly like a real
result. Three sets of real credentials were committed to the repository.

**Final status (Phase 5).** P0 and P1 are closed. What remains open is listed as DEFERRED with the
reason, and none of it is a security hole in the demo path.

| Severity | Total | Fixed | Deferred |
|---|---|---|---|
| **P0** | 6 | 6 | 0 |
| **P1** | 14 | 14 | 0 |
| **P2** | 11 | 6 | 5 |
| **P3** | 5 | 3 | 2 |

Verification evidence for the fixed items is in [section 10](#10-phase-5-verification), not in a
claim: `mvn test` (11 tests), `pytest` (12 tests), `npm test` (15 tests), lint/build, a live HTTP
smoke test and the evaluator benchmark.

**Action still required from a human:** rotate the credentials that were committed before this
branch. Removing them from the tree does not make them secret. Details in §8.1.

---

## 2. Environment and build results

Local tools: Windows 11, JDK 25.0.3 (project targets Java 21), Maven 3.9.9 (downloaded to
`%TEMP%`, not installed), Node/npm from `C:\Program Files\nodejs`, Python 3.x venv at
`ai-service/.venv`.

| Service | Command | Result |
|---|---|---|
| Frontend | `npm install --no-audit --no-fund` | PASS — 626 packages |
| Frontend | `npm run build` | **PASS** — `index` 981.95 kB (284.68 kB gzip); lazy chunks `face-api` 1,328.15 kB, `PDFReportGenerator` 1,393.05 kB, `pose` 46.92 kB, `camera_utils` 8.18 kB |
| Frontend | `npm run lint` | **PASS with warnings** — 0 errors, 37 warnings (`no-unused-vars`, `react-hooks/exhaustive-deps`) |
| Frontend | `npm test` | **PASS** — 3 files, 15 tests (App, Layout, Profile) |
| Backend | `mvn -DskipTests compile` | **PASS** — `BUILD SUCCESS` |
| Backend | `mvn test` | **PASS** — but **0 tests**; `backend/src/test` does not exist |
| AI service | `pip install` (core deps) + `import main` | **PASS** |
| AI service | `TestClient(app).get("/health")` | **200** `{"status":"healthy","service":"ai-interviewer"}` |
| AI service | `POST /ai/evaluate-answer` (no LLM key) | **200**, heuristic `score=50`, `flags` absent |
| Backend runtime | `spring-boot:run -Dspring-boot.run.profiles=local` (H2, port 8082) | **STARTED**, smoke test below |

### Backend smoke test (live, `local` profile)

```
register A/B: ok (1, 2)
jd: 1
interview: 1 questions=3 sessions=3 expectedAnswerLeak=True
B reads A interview: 200 (IDOR CONFIRMED), got title=Phase0 smoke
begin: IN_PROGRESS
q1: What is database normalization and why is it used?...
answer1: score=(null) grade=(null)          <- AI service was not running
double-submit: 200 score=(null)
index after double submit: 2/3              <- one question skipped
end: COMPLETED
answer-after-complete: 200 (state machine NOT enforced)
report: score=75 grade=B radarType=String   <- fabricated values
B reads A report: 200 (IDOR CONFIRMED)
B reads resume 1: 403                       <- resume did not exist; code path still has no ownership check (see P0-3)
```

---

## 3. Scan results

### 3.1 Secrets

`gitleaks` / `trufflehog` were not available; the scan used regex over the tree plus
`git log --all -S <value>` and a history grep for private-key / `AIza…` / `sk-…` / `AKIA…` /
`ghp_…` patterns.

- **No API keys** (Gemini, Deepgram, ElevenLabs, Judge0) found in the working tree or history.
- **Confirmed committed credentials** (values intentionally not repeated here):
  - TiDB Cloud username/password in `render.yaml:14,16` — present at `HEAD`, even though commits
    `e1c032c` and `42fca6b` removed them; commit `bbbe6e4` re-added them.
  - Local MySQL password in `backend/src/main/resources/application.properties:7`.
  - Default JWT signing secret in `application.properties:16` (base64 of a readable phrase).
  - Admin e-mail/password posted by `.github/workflows/keep-alive.yml:20`.
- All four **must be rotated**. The TiDB password is the highest risk: it is in git history and in
  the Render blueprint.

### 3.2 Dependencies

| Tool | Result |
|---|---|
| `npm audit` (frontend) | **11 vulnerabilities: 3 critical, 5 high, 3 moderate.** Mostly dev/build tooling: `vitest`/`@vitest/mocker`/`tinypool` (critical), `vite`, `brace-expansion`, `follow-redirects`, `js-yaml`, `postcss-selector-parser`, `source-map-js`, and `dompurify` (via `monaco-editor`, which ships in the coding screen). |
| `pip-audit -r ai-service/requirements.txt` | **No known vulnerabilities.** |
| Maven | No dependency-check run (plugin would download the NVD database; time-boxed). Versions are pinned by Spring Boot 3.4 BOM. |

### 3.3 Code hygiene (counts)

| Pattern | Count |
|---|---|
| `console.log/error/warn` in `frontend/src` | 35 |
| `System.out.print*` in `backend/src` | 3 |
| `print(` in `ai-service/app` | 10 |
| `TODO` / `FIXME` | 0 |
| `aria-*` / `alt=` attributes in `frontend/src` | 2 |
| `expectedAnswer` references in frontend | 1 (`Report.jsx:533`) |

---

## 4. Hypothesis checklist (A–F)

### A. Configuration and docs

| ID | Status | Evidence |
|---|---|---|
| A1 | **CONFIRMED** | Real AI port is **8001**: `ai-service/main.py:38`, `ai-service/Dockerfile:8`, `README.md:15,157`, `application.properties:20`. `docs/API.md:281` says `http://localhost:8000/ai`; `ai-service/.env.example` ends with `PORT=8000`. Three sources disagree. |
| A2 | **CONFIRMED** | `docs/API.md:281-311` lists the six `/ai/*` endpoints with no request/response models; error example is dated `2024-01-15` (`docs/API.md:320`). |
| A3 | **PARTIALLY CONFIRMED** | Backend AI URL is a plain property with no env override: `ai.service.url=http://localhost:8001` (`application.properties:20`) while `render.yaml:17` declares `AI_SERVICE_URL` — that variable is never read. `render.yaml` has no `healthCheckPath`. `dockerfilePath: ./Dockerfile` is relative to `rootDir`, which works, but the AI Dockerfile hard-codes port 8001 instead of `$PORT`. |
| A4 | **CONFIRMED** | Only `ai-service/.env.example` exists. No `.env.example` for `backend/` or `frontend/`. The existing one documents `PORT=8000` (wrong) and omits `VITE_API_URL`, `VITE_AI_SERVICE_URL`, `JWT_SECRET`, `APP_CORS_ALLOWED_ORIGINS`. |
| A5 | **CONFIRMED (no secrets)** | `setup-plugins.sh` contains no secrets, but it writes to `$HOME/plugins` and `.claude/skills/**` is committed (~100 unrelated AI-skill files). `tools/*` are text files containing `/home/abhijitk20/plugins/...` — broken paths on any other machine. Confusing for a fresh clone. |

### B. Security

| ID | Status | Evidence |
|---|---|---|
| B1 | **CONFIRMED** | `InterviewController` never passes the caller id to the service: `begin` (33-37), `next-question` (39-43), `answer` (45-51), `end` (53-57), `get` (66-70). `ReportController` (22-57) likewise. Live proof: user B got `200` for A's interview and report. `ResumeController.getResume/deleteResume` (156-176) and `JobDescriptionController.get/delete` (40-50) also lack ownership checks. |
| B2 | **PARTIALLY CONFIRMED** | Secret comes from `${JWT_SECRET:…}` (`application.properties:16`) but the **default is committed and usable**, so a deployment that forgets the env var signs tokens with a public key. Expiry is enforced by jjwt (`JwtUtil.java:47-52,78-81`); algorithm is whichever jjwt infers from the key (HMAC), not fixed explicitly. Malformed tokens are caught and fall through to `Long.parseLong(authentication.getName())` (`InterviewController.java:83-84`) → possible 500/NumberFormatException instead of 401. |
| B3 | **PARTIALLY CONFIRMED** | BCrypt is used (`SecurityConfig.java:72-74`). Registration validates e-mail and `min=6` password (`RegisterRequest.java:11-17`) — weak (no upper length, no complexity; BCrypt truncates >72 bytes). No login rate limiting/lockout despite `app.rate-limit.*` config (`application.properties:40-42`) that nothing reads. |
| B4 | **CONFIRMED** | `render.yaml:22` sets `APP_CORS_ALLOWED_ORIGINS=*`; `SecurityConfig.java:79-86` converts `*` to `addAllowedOriginPattern("*")` **with** `allowCredentials(true)`. AI service does the same: `main.py:18-19`. |
| B5 | **CONFIRMED** | `ResumeController.upload` (44-103): no type/size allow-list, no content sniffing, raw `file.getOriginalFilename()` appended to the path (line 68 → path traversal on `../`), raw bytes decoded as text (line 74 → PDFs/DOCX become binary garbage), files written to `./uploads` (ephemeral on Render), and the text branch (61-63) never sets `filePath`. Multipart limit is only the global 10 MB property. |
| B6 | **CONFIRMED** | Answer and resume text are interpolated straight into prompts with no delimiters: `evaluation_service.py:40-65`, `llm_service.py` question/follow-up prompts. No injection pre-filter, no "data only" instruction. |
| B7 | **NOT AN ISSUE** | No provider key reaches the browser. Frontend uses the Web Speech API (`VoiceRecorder.jsx:26-79`) and calls backend/AI-service proxies (`VoicePlayer.jsx:128`, `Interview.jsx:41`). `@deepgram/sdk` is imported nowhere. |
| B8 | **CONFIRMED** | AI service has no auth on any route (`ai_router.py:66-176`); the backend sends no shared secret. Publicly reachable on Render → anyone can burn Gemini quota and use the TTS proxy. |
| B9 | **PARTIALLY CONFIRMED** | Security-header values exist only as unused properties (`application.properties:44-48`); no filter applies them. A `default-src 'self'` CSP would break the app (CloudFront video, Google fonts). No global exception handler → default Spring error body, and `ai_router.py:76-171` returns `detail=str(e)` to callers. |
| B10 | **CONFIRMED** | `AnswerSubmitRequest.answer` has only `@NotBlank` (no max length). `CodingController.executeCode` takes an untyped `Map` with no size limit (`CodingController.java:17-25`). `ResumeController.parse-text` takes a raw `Map` with no size limit (`ResumeController.java:106`). `InterviewStartRequest` has no bounds on `totalQuestions`/`durationMinutes`. |
| B11 | **NOT AN ISSUE** | All persistence is Spring Data JPA; no raw SQL/`@Query` with concatenation found. |
| B12 | **CONFIRMED (documented, not rewritten)** | Token in `localStorage` (`api.js:12`), so any XSS is a full account takeover. No httpOnly cookie. Recorded as an accepted risk; switching is non-trivial (Spring Security stateless). |

### C. AI service reliability and quality

| ID | Status | Evidence |
|---|---|---|
| C1 | **CONFIRMED** | Free-text JSON parsing everywhere: `json.loads(self._clean_json(...))` (`evaluation_service.py:79-81`), `json.loads` in `llm_service.py`. No Pydantic response model, no schema validation. |
| C2 | **CONFIRMED** | No timeout/retry/backoff on Gemini or Deepgram; a failed call is silently swallowed (`evaluation_service.py:104-106`) or replaced by mock/heuristic output. No 429 handling anywhere. |
| C3 | **CONFIRMED** | Temperature `0.3` (`evaluation_service.py:69`) and **three different prompts** per answer, so identical answers can score differently. `LLM_MODEL` env var is ignored — model is hard-coded as `gemini-3.5-flash-lite`. |
| C4 | **PARTIALLY CONFIRMED** | LLM path clamps the final integer (`evaluation_service.py:94`) but trusts each agent's `score`; missing keys default to 60. Heuristic path clamps at 100 but can return `20` for an empty answer as a "score". No NaN/null guard at the API boundary. |
| C5 | **PARTIALLY CONFIRMED** | Answer text is unbounded (B10) and full interview context is sent in `generate_report`. No token budget. |
| C6 | **CONFIRMED** | Prompts are inline f-strings in at least 19 places across `app/`; no `prompts/` module, no versioning. |
| C7 | **CONFIRMED** | `print(f"Multi-agent evaluation error: {e}")` (`evaluation_service.py:105`) plus 9 other `print()` calls; backend logging is set to WARN so normal flows are quiet, but answer text is not explicitly excluded from error paths. |
| C8 | **PARTIALLY CONFIRMED** | TTS failures return 500 (`ai_router.py:161-162`) and the frontend does not always degrade to text; voice service has a mock transcript fallback (`voice_service.py:63-64,88`) that could silently pretend to transcribe. |
| C9 | **CONFIRMED** | Question selection is a static role bank first (`InterviewService.java:88-106`) then "any active questions" (`:123-124`); no JD/resume targeting, no dedupe, no repeat tracking. |
| C10 | **PARTIALLY CONFIRMED** | The practice coding screen executes code through Judge0 with test cases (`CodingService.java:98-144`). The **interview** path does not: `handleCodingSubmit` serialises the result into the answer string (`Interview.jsx:98-100`), and the evaluator only sees JSON. Judge0 call has no explicit timeout (`RestTemplate` default = infinite) and any authenticated user can run arbitrary code on the public sandbox (`CodingController.java:17-25`). |

### D. Backend correctness

| ID | Status | Evidence |
|---|---|---|
| D1 | **CONFIRMED** | No transition checks. `startInterviewSession` always sets `IN_PROGRESS` (`InterviewService.java:127-137`); `submitAnswer` does not look at status (151-211); `endInterview` always sets `COMPLETED` (287-303). Live: answer after `COMPLETED` → 200. `begin` on a foreign/nonexistent id also works (IDOR). |
| D2 | **CONFIRMED** | `submitAnswer` never checks whether the session was already `ANSWERED`/`EVALUATED`; every retry saves another `Evaluation` and increments `currentQuestionIndex` (`:198-208`). Live: index went 0 → 2 on a double submit. |
| D3 | **PARTIALLY CONFIRMED** | The method is `@Transactional`, so a mid-AI failure should roll back — but all AI calls are wrapped in swallowing `try/catch`, so a failed evaluation leaves an `ANSWERED` session with no evaluation and still advances the index (`:203-208`). `totalQuestions` is taken from the request (1-1000, unvalidated) while sessions are created from the generated list, so they can disagree. |
| D4 | **CONFIRMED** | `ReportResponse` fields are all `String` (`ReportResponse.java:20-26`); frontend receives JSON text, e.g. `radarType=String` in the smoke test, and `Report.jsx:260-273` reconstructs values from `overallScore`. API contract is wrong. |
| D5 | **CONFIRMED** | No `Pageable` on `GET /interviews`, `/resumes`, `/job-descriptions`; `mapToInterviewResponse` touches `sessions` → per-row queries (N+1). `database/schema.sql` does declare `idx_candidate_id`/`idx_interview_id`/`idx_created_at`, but the entities carry no `@Index`, so tables created by `ddl-auto=update` (rather than by `schema.sql`) miss them. |
| D6 | **CONFIRMED** | `schema.sql` and JPA disagree (e.g. entity `@Lob @Column(columnDefinition="JSON")` vs MySQL DDL; UUID/timestamps; no `users` unique index in some paths). `ddl-auto=update` is on (`application.properties:11`), so Hibernate silently mutates production schema. No Flyway/Liquibase. |
| D7 | **CONFIRMED** | No `@ControllerAdvice`/`@ExceptionHandler` anywhere. Service throws `RuntimeException("…not found")` → default 500 (or 403 in some filter paths), inconsistent with `docs/API.md:315-341`. No 429/503 handling. |
| D8 | **CONFIRMED** | No `/health` or actuator in backend (`pom.xml` has no actuator; controller list has none). `keep-alive.yml` warms the backend by POSTing a login. |
| D9 | **CONFIRMED** | Zero backend tests (`backend/src/test` absent); no integration test for auth/ownership/flow. Frontend has 15 tests, none for the interview flow. AI service has no tests. |

### E. Frontend

| ID | Status | Evidence |
|---|---|---|
| E1 | **PARTIALLY CONFIRMED** | `VITE_API_URL` is used (`api.js:4`, `CodingEnvironment.jsx:221,256`, `VoiceRecorder.jsx:190`) but every call falls back to `http://localhost:8080`; two files hard-code the production AI-service URL instead of using `VITE_AI_SERVICE_URL` (`Interview.jsx:41`, `VoicePlayer.jsx:128`). A build without env vars ships localhost. |
| E2 | **NOT AN ISSUE** | `frontend/vercel.json:5-8` rewrites non-`api/` paths to `/index.html`. |
| E3 | **PARTIALLY CONFIRMED** | `ProtectedRoute` wraps the layout (`App.jsx:35-43`). Interceptor logs out on **any** 401/403 with an auth header (`api.js:26-31`), so a legitimate 403 (e.g. ownership denial after Phase 1) would log the user out. No 429/5xx messaging. |
| E4 | **CONFIRMED** | Only error boundary in the app is the PDF one (`Report.jsx:47,306`). No app-level boundary; avatar/camera components have none. `fetchInterview` swallows errors and leaves a blank screen (`Interview.jsx:63-67`). |
| E5 | **PARTIALLY CONFIRMED** | Refresh resumes at `currentQuestionIndex + 1` (`Interview.jsx:61`), which is correct only while index and sessions stay in sync — they don't after a double submit (D2). No explicit "resume where you left off" state. |
| E6 | **PARTIALLY CONFIRMED** | The client guard exists: the submit button is `disabled={submitting \|\| !answer.trim()}` and the voice recorder gets `disabled={submitting}` (`Interview.jsx:273,303`). It is not enough: `handleContinue` is only disabled while `submitting`, and the **server** accepts duplicates (D2), so a retry, refresh or second tab still corrupts the index. |
| E7 | **PARTIALLY CONFIRMED** | Mic denial is logged, not explained (`Interview.jsx:79-84`); there is no text-mode fallback prompt. `ProctoringMonitor` stops tracks and intervals on unmount (`:382-390`), but camera/face-api/MediaPipe resources are not consistently released in every analyzer. |
| E8 | **CONFIRMED (missing)** | No lite-mode toggle and no WebGL/FPS detection. `showAvatar/showBodyLanguage/showProctoring` flags exist (`Interview.jsx:25-27`) but nothing auto-suggests disabling them. |
| E9 | **CANNOT DETERMINE without a real browser** | TTS playback path (`VoicePlayer.jsx`) has no explicit `play()` rejection handling / play button fallback. Needs a Safari/mobile test. |
| E10 | **CONFIRMED** | Only 2 `aria-*`/`alt=` attributes in the whole app, no `aria-live`, no `prefers-reduced-motion` handling, no visible focus styles audit. Responsive classes exist but were not verified on a device. |
| E11 | **PARTIALLY CONFIRMED** | face-api and the PDF generator **are** already lazy chunks (build output). `three`/`@react-three/*` are only used by an unused `Scene3D` (`components/ui/effects/Scene3D.jsx`) and are not in the main chunk. Main bundle is 982 kB because of everything else (framer-motion, Recharts, icon set). |
| E12 | **CONFIRMED** | `index.html` has title + charset + viewport only: no description, OG tags, theme-color, `noscript`, splash. Favicon points to `/vite.svg`, which does not exist in `frontend/public` (404). |
| E13 | **CONFIRMED** | `console.*` ×35; unused deps `socket.io-client`, `shadergradient`, `wavesurfer.js`, `recordrtc` (0 imports); `Scene3D` unused. |
| E14 | **PARTIALLY CONFIRMED** | `Report.jsx:260-273` fabricates radar/category values when the report field is a string (`report.overallScore \|\| 75`). PDF export is wrapped in a boundary, so it fails visibly; long-text handling not verified. |
| E15 | **CONFIRMED** | Anti-cheat copy says “Warning: Cheating Detection Active” (`AntiCheatModal.jsx:64`); the consent modal is bypassed with `setAntiCheatAccepted(true)` (`Interview.jsx:44`). |

### F. Deployment and demo-day reliability

| ID | Status | Evidence |
|---|---|---|
| F1 | **PARTIALLY CONFIRMED** | Keep-alive workflow exists but warms via a login POST every 14 min and posts credentials; backend has no `/health`. No "waking up" UI or 60 s retry on the frontend. |
| F2 | **CONFIRMED (missing)** | No cache for generated question sets, no queue/concurrency limit, no rate-limit UI message. |
| F3 | **CONFIRMED** | Backend CI only `mvn clean compile`; frontend CI builds (lint warnings ignored); AI CI only `py_compile`; `unit-tests.yml` skips frontend tests with `echo` and ignores pytest failures (`pytest … \|\| true`); `code-format.yml` swallows every failure. |
| F4 | **CONFIRMED (missing)** | No demo account seeding, no pre-generated sample interview/report, no offline path. |

---

## 5. Extra findings (not in the checklist)

| ID | Severity | Finding |
|---|---|---|
| X1 | P1 | `InterviewResponse` has no `overallScore`, yet `Dashboard.jsx:25` averages `i.overallScore \|\| 75` → every dashboard shows **75** regardless of real scores. |
| X2 | P1 | `EvaluationResponse` omits `strengths`, `weaknesses`, `improvementSuggestions`, `communicationScore`, `technicalDepth` from `mapToSessionResponse` (`InterviewService.java:352-358`), while `Interview.jsx:118-122` reads exactly those fields → feedback panel shows `undefined`. |
| X3 | P1 | Admin seed hash in `database/schema.sql:252` does not match `password`, `admin123`, `admin`, `Password123` or `changeme` (verified with BCrypt). The password is unknown and the hash is public → offline-crack target if the account exists. README says no default credentials, which contradicts the seed. |
| X4 | P2 | `schema.sql` has `email … UNIQUE` (`:10`), but `AuthService` does check-then-insert, so a duplicate e-mail race surfaces as a 500 from the constraint instead of a clean 409. Registration is not atomic. |
| X5 | P2 | `@Data` on JPA entities with lazy relations (`Interview`, `InterviewSession`, `Evaluation`, `Report`) → generated `equals/hashCode/toString` can trigger `LazyInitializationException`/stack overflow. `InterviewService.mapToInterviewResponse` touches `interview.getSessions()` outside a transaction in read paths. |
| X6 | P2 | Judge0 `RestTemplate` has no connect/read timeout (`CodingService.java:20,78`); a hung Judge0 blocks a request thread forever. |
| X7 | P2 | `render.yaml` has no `healthCheckPath`, no `disk`, no `autoDeploy` policy; uploads and the H2-file profile would not survive a restart. |
| X8 | P3 | `frontend/package.json` includes `playwright` as a **runtime** dependency (1 import in `frontend/src`), bloating installs. Root `package.json` is a one-line stub. |
| X9 | P3 | `frontend/public/vantage-landing.html` and `talkingavatar.mp4` are committed assets with no clear owner; `tools/*` point at another machine's home directory. |
| X10 | P3 | `.claude/skills/**` (~100 files) is committed, unrelated to the product, and confuses first-time setup. |
| X11 | P3 | `ai-service/backend/src/main/resources/question-banks/` is a **tracked duplicate** of 10 backend question-bank JSON files (the real ones live in `backend/src/main/resources/question-banks/`). Nothing reads the AI-service copy; it is dead weight and confusing. |

---

## 6. Findings by severity (the fix list)

Statuses were rewritten in Phase 5. `FIXED` means the change is on
`hackathon/polish` with a test or a live check behind it; `DEFERRED` keeps the
reason in §8.

### P0 — security / data exposure

| ID | Finding | Location | Evidence | Status |
|---|---|---|---|---|
| **P0-1** | **IDOR on interviews** — read, begin, next-question, answer, end another user's interview | `InterviewController.java`; `InterviewService.requireOwnedInterview` | Live: user B `GET /api/interviews/{id}` → 404 | **FIXED** |
| **P0-2** | **IDOR on reports** — read and force-generate another user's report | `ReportController.java` | Live: user B `GET /api/reports/{id}` → 404 | **FIXED** |
| **P0-3** | **IDOR on resumes / job descriptions** — read extracted resume text, delete resources | `ResumeController.java`; `JobDescriptionController.java` | Owner resolved from the JWT; 404 for others; covered by integration tests | **FIXED** |
| **P0-4** | **Committed credentials + public default JWT secret** | `render.yaml`; `application.properties`; `keep-alive.yml` | Removed from the tree; `JwtUtil` refuses to boot in `production` without `JWT_SECRET`. **Rotation is still a human action** (§8.1) | **FIXED** (rotation pending) |
| **P0-5** | **CORS `*` with credentials** (backend and AI service) | `SecurityConfig.java`; `main.py` | Explicit origin lists from `APP_CORS_ALLOWED_ORIGINS` / `ALLOWED_ORIGINS` | **FIXED** |
| **P0-6** | **Answer key sent to the candidate** | `SessionResponse.java`; `InterviewService` | `@JsonInclude(NON_NULL)` + only mapped after `COMPLETED`; live check: field absent in flight | **FIXED** |

### P1 — broken behaviour / bad failure handling

| ID | Finding | Location | Evidence | Status |
|---|---|---|---|---|
| P1-1 | No state machine: answer/end/begin in any state; next-question before begin | `InterviewService` | Explicit transitions; wrong state → 409. `begin`/`end` are deliberately idempotent (retry-safe) and return current state | **FIXED** |
| P1-2 | Non-idempotent submit: duplicate evaluation + index jump | `InterviewService.submitAnswer` | Resubmitting a `sessionId` returns the stored evaluation; index advances once | **FIXED** |
| P1-3 | Fabricated report `75 / B` when AI is down; report generated as a GET side effect | `InterviewService`; `ReportController` | Score computed from real evaluations; `N/A` + `INSUFFICIENT_DATA` when none; report written on `end`, GET is read-only | **FIXED** |
| P1-4 | AI service publicly callable, no auth, no quotas; leaks exception text | `ai_router.py`; `main.py` | `X-AI-Service-Token` required when `AI_SERVICE_TOKEN` is set; generic 500 detail; length bounds per field | **FIXED** |
| P1-5 | Upload: path traversal, no type/size validation, binary decoded as text, ephemeral storage | `ResumeController.java` | 5 MB, `.txt`/`.md` only, sanitised name, canonical-path escape check, PDF/DOCX → 409. Real PDF parsing **DEFERRED** | **FIXED** (parsing deferred) |
| P1-6 | No global exception handler; wrong status codes; inconsistent error shape | `ApiExceptionHandler` | 400/401/403/404/405/409/413/500 with one body; live: wrong method → 405, unknown path → 404 (both were 500 before) | **FIXED** |
| P1-7 | Report DTO returns JSON **strings**; frontend re-derives values | `ReportResponse`; `Report.jsx` | Root cause was Hibernate 6 double-encoding `columnDefinition="JSON"`; columns are `TEXT`; live: real arrays | **FIXED** |
| P1-8 | Dashboard average hard-coded to 75 (missing `overallScore`) | `Dashboard.jsx` | Field present; dashboard shows the real average or says there is none | **FIXED** |
| P1-9 | Feedback panel shows `undefined` (DTO missing fields) | `EvaluationResponse`; `Interview.jsx` | DTO and panel aligned; missing evaluation is explained, not `0` | **FIXED** |
| P1-10 | Fragile LLM parsing, no schema validation, no retries, temperature 0.3, three prompts per answer | `rubric_evaluator.py` | Pydantic schema, temperature 0, two attempts, fails closed; one prompt instead of three | **FIXED** |
| P1-11 | No prompt-injection defence; untrusted text interpolated raw | `rubric_evaluator.py` | Delimited `<answer>` sections, injection patterns neutralised and flagged, tests | **FIXED** |
| P1-12 | Frontend swallows interview-load and submit errors; no app-level error boundary | `Interview.jsx`; `App.jsx` | Errors surfaced with retry; error boundary around analysis panels; only 401 logs out | **FIXED** |
| P1-13 | Rate-limit config is dead; no login throttling | `AuthRateLimitFilter` | 60/min per IP → 429 + `Retry-After`; unit test + live check | **FIXED** |
| P1-14 | Port/config drift (8000 vs 8001, `AI_SERVICE_URL` unused, AI Docker ignores `$PORT`) | `docs/API.md`; `application.properties`; `ai-service/Dockerfile` | One port (8001, `$PORT` honoured); `AI_SERVICE_TIMEOUT_MS` wired | **FIXED** |

### P2 — reliability / performance / UX

| ID | Finding | Location | Status |
|---|---|---|---|
| P2-1 | N+1 on interview list; no pagination; indexes exist only in `schema.sql`, not on the entities | `InterviewService`; `entity/*.java` | **DEFERRED** |
| P2-2 | `schema.sql` ↔ JPA drift; `ddl-auto=update`; no migrations | `application.properties` | **DEFERRED** (JSON→TEXT drift fixed) |
| P2-3 | No backend health endpoint; keep-alive uses login with credentials | `HealthController`; `keep-alive.yml` | **FIXED** |
| P2-4 | Bundle 984 kB main; unused deps; face-api/PDF already lazy | build output; `package.json` | **DEFERRED** |
| P2-5 | Accessibility: 2 aria/alt attributes total, no `aria-live`, no reduced-motion | `frontend/src` | **FIXED** (skip link, focus-visible, labelled icon buttons, `aria-current`, reduced motion; full audit deferred) |
| P2-6 | Favicon 404 (`/vite.svg` missing); no metadata/noscript/splash | `index.html`; `public/` | **FIXED** |
| P2-7 | Anti-cheat modal bypassed; “Cheating Detection Active” wording | `Interview.jsx`; `AntiCheatModal.jsx` | **FIXED** (modal deleted; consent banner states what is really checked) |
| P2-8 | No lite mode, no auto-fallback when camera/WebGL unavailable | `Interview.jsx` | **DEFERRED** (panels can be switched off, and a denied camera now says so) |
| P2-9 | CI swallows failures; tests skipped (`\|\| true`, `echo`); no backend tests | `.github/workflows/*` | **FIXED** (11 backend tests, real `npm test`/`pytest`, lint gates; audits marked advisory) |
| P2-10 | `@Data` on entities with lazy relations; read paths outside transactions | `entity/*.java`; `InterviewService` | **DEFERRED** |
| P2-11 | Judge0 has no HTTP timeout; untyped, unbounded code payloads | `CodingService`; `CodingController` | **FIXED** (5 s connect / 30 s read, payload validation) |

### P3 — polish / docs

| ID | Finding | Location | Status |
|---|---|---|---|
| P3-1 | `docs/API.md` stale: port 8000, 2024 samples, no AI schemas, no 429/503 | `docs/API.md` | **FIXED** (rewritten from the running API) |
| P3-2 | Missing `.env.example` for backend/frontend; AI one has the wrong port and omits keys | repo root | **FIXED** |
| P3-3 | No `DEMO.md`, no demo mode, no sample data | repo root | **FIXED** for `DEMO.md`; demo seed **DEFERRED** |
| P3-4 | Dead code/deps (`Scene3D`, `socket.io-client`, `shadergradient`, `wavesurfer.js`, `recordrtc`) | `frontend/src`, `package.json` | **DEFERRED** |
| P3-5 | Committed tooling: `.claude/skills/**`, `setup-plugins.sh`, `tools/*` with foreign absolute paths | repo root | **DEFERRED** (needs an owner decision) |

---

## 7. Questions for the team

1. **Rotate credentials now or after the hackathon?** I will remove them from the tree and add
   placeholders, but rotation must be done in TiDB Cloud / Render / Vercel by a human with access.
   The admin keep-alive password needs a new value in the GitHub secret store as well.
2. **Is the seeded admin account (`schema.sql:252`) supposed to work?** Its hash matches no common
   password. Safest default: keep the row but document that it is disabled/unknown, and do not rely
   on it for the demo. Tell me if you know the password and I will not touch it.
3. **Demo account:** may I seed a dedicated `demo@…` user plus one sample interview/report for
   demo mode (F4)? It is additive and does not touch existing data.
4. **Anonymous AI service:** I plan to require a shared secret header (`AI_SERVICE_TOKEN`) from the
   backend and reject unauthenticated calls. This changes the Render blueprint (one more env var) —
   confirm.
5. **Uploads on free tier:** Render free has an ephemeral disk. Do you want uploads disabled in
   production (paste-text only) or accepted with a “lost on restart” disclaimer? Safest default:
   keep uploads, store parsed text in the DB, document the limitation.
6. **`three` / `@react-three`**: only used by an unused component. Removing them is safe but
   reduces install size, not runtime. Delete, or keep for future avatar work?
7. **Benchmark human scores:** `bench/answers.csv` ships with blank `human_score_*` columns. Someone
   on the team must label the seed set; scripts will skip unlabeled rows and say so in
   `RESULTS.md`.

---

## 8. Deferred (with reasons)

These are real issues but exceed the Phase 1–3 time box or need a decision above.

| Item | Reason deferred |
|---|---|
| Flyway/Liquibase migration for `schema.sql` ↔ JPA drift | Risky data migration in a 24 h window; `ddl-auto=update` stays, drift documented |
| Pagination on list endpoints | Requires API contract change + frontend; low demo value |
| Replacing `localStorage` JWT with httpOnly cookies | Non-trivial Spring Security rewrite; documented risk (B12) |
| Real resume parsing (PDF/DOCX) | Adds a parser dependency and time; plan is content sniffing + reject binaries with a clear message |
| Full CSP | Needs a policy tailored to the CloudFront video and inline styles; added as report-only if time permits |
| Shareable report link with revocation | Phase 3 optional; only if Phases 1–2 finish |
| Fairness check (name/gender/college perturbation) | Optional 2–3 h; needs the benchmark running first |
| Secret scanning in CI (gitleaks) | Adds a third-party action; documented for the team to enable |
| Removing `.claude/skills/**` | User may rely on them; flagged as P3, ask before deleting |
| Demo seed (a `demo@…` user with one sample interview/report) | Additive but touches the schema story; `DEMO.md` works without it |
| Removing dead dependencies (`socket.io-client`, `shadergradient`, `wavesurfer.js`, `recordrtc`) | Install-time only; risk of breaking an unused-but-referenced import on demo day |
| Full accessibility audit (`aria-live` regions, focus traps, colour contrast) | The minimum (focus, labels, reduced motion, skip link) is shipped; a full pass is its own task |

---

## 8.2 Parked ideas (recorded, deliberately not built)

### Candidate difficulty tiers: BASIC / ADVANCED / EXPERT

A strong senior and a junior currently get near-identical questions, so the
interview does not separate them. The plan is a third tier above the existing
`experienceLevel` (JUNIOR/MID/SENIOR), chosen per interview:

| Tier | Intended candidate | Question shape |
|---|---|---|
| BASIC | 0–2 years | Definitions, one-hop reasoning, guided "what happens if…" |
| ADVANCED | 3–6 years | Trade-offs, failure modes, "why not the obvious design" |
| EXPERT | 7+ years | Ambiguous constraints, incident forensics, scale/cost judgement |

Where it would reach: `Question.difficulty` and the planner prompt already carry
a difficulty axis, so this is primarily a curated bank split plus a tier-aware
prompt and a label on `NewInterview`; scoring weights and the rubric stay as-is.
Blocked on: content for three banks and a decision on how the tier is chosen
(self-declared vs derived from the resume). No code written.

---

## 9. Phase plan derived from this audit

| Phase | Work | Findings |
|---|---|---|
| 1 | Secrets + default JWT + CORS allow-list | P0-4, P0-5, B2 |
| 1 | Ownership checks + tests on every id-scoped endpoint | P0-1, P0-2, P0-3 |
| 1 | Hide `expectedAnswer` until the interview is complete | P0-6 |
| 1 | Port/config/env consistency (`$PORT`, `AI_SERVICE_URL`, `.env.example`) | P1-14, A1, A3, A4, P3-2 |
| 1 | Global error handler, validation limits, upload hardening | P1-5, P1-6, B10, D7 |
| 1 | Structured LLM output + retries + fallback honesty | P1-10, P1-11, C1–C4 |
| 1 | State machine + idempotency + report truthfulness | P1-1, P1-2, P1-3, D1–D3 |
| 1 | Frontend error boundary, submit guard, DTO field fixes | P1-8, P1-9, P1-12, E4, E6 |
| 2 | Rubric evaluator, adaptive planner, injection filter, `bench/` | C1–C6, C9, B6 |
| 3 | Health/warm-up, rate-limit UX, caching, demo mode, lite mode, a11y, metadata | F1, F2, F4, E8, E10, E12 |
| 4 | README, API docs, `.env.example`, `DEMO.md` | P3-1–P3-3 |
| 5 | Full verification + status rewrite | all |

---

## Verification log

Commands actually executed for this audit (working directory inside the repo unless noted):

```powershell
# frontend
cd frontend
npm install --no-audit --no-fund
npm run build
npm run lint
npm test
npm audit --json

# backend (Maven unpacked to %TEMP%\apache-maven-3.9.9)
cd backend
& "$env:TEMP\apache-maven-3.9.9\bin\mvn.cmd" -DskipTests compile
& "$env:TEMP\apache-maven-3.9.9\bin\mvn.cmd" test
& "$env:TEMP\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=local
# + PowerShell smoke script: register A/B, create JD, start interview, begin,
#   next-question, answer, double-submit, end, answer-after-complete, report, cross-user reads

# ai-service
cd ai-service
python -m venv .venv
.\.venv\Scripts\python -m pip install fastapi "uvicorn[standard]" pydantic python-dotenv python-multipart httpx edge-tts pytest
.\.venv\Scripts\python -c "import fastapi, main; print('imports OK')"
.\.venv\Scripts\python -c "from fastapi.testclient import TestClient; from main import app; c=TestClient(app); ..."
.\.venv\Scripts\python -m pip_audit -r requirements.txt

# secrets / history
git log --all -p | Select-String -Pattern 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AIza[0-9A-Za-z_\-]{35}|sk_live_|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}'
git log --all --oneline -S '<redacted TiDB password>' -- render.yaml
git log --all --oneline -S '<redacted local DB password>' -- backend/src/main/resources/application.properties
```

Not executed (manual follow-up): Safari/iOS autoplay, real camera/microphone on the demo device,
Render cold start, TiDB connection from this machine, `mvn dependency-check` (NVD download),
live Gemini/Deepgram calls (no keys in this environment).

---

## 8.1 Credentials that still need rotating

Removing a value from the tree does not un-leak it. These were committed and must
be treated as public:

| Credential | Where it was committed | Action |
|---|---|---|
| TiDB user + password | `render.yaml` (history, re-added in `bbbe6e4`) | rotate in TiDB Cloud, update the Render env var |
| Local MySQL password | `backend/src/main/resources/application.properties` (history) | rotate if that instance is reachable |
| Default JWT secret | `application.properties` (history) | set a fresh `JWT_SECRET` in every deployed environment; old tokens are already invalid there |
| Admin keep-alive password | `.github/workflows/keep-alive.yml` (history) | change the GitHub secret; the workflow now uses `/api/health` and no credentials |

## 10. Phase 5 verification

Everything below was run on `hackathon/polish` after the fixes.

| Check | Command | Result |
|---|---|---|
| Backend unit + integration | `mvn test` | **11 passed** (2 rate-limit, 9 security/state/report/adaptive) |
| AI service | `python -m pytest` | **14 passed** (rubric arithmetic, grounding, injection, retries, router auth/limits, resume parser) |
| Frontend unit | `npm test` | **15 passed**, 3 files |
| Frontend lint | `npm run lint` | **0 errors**, 32 warnings (unused vars, hook deps) |
| Frontend build | `npm run build` | **PASS**, main chunk 955.96 kB (PDF chunk 1,223.76 kB, lazy-loaded) |
| Benchmark self-check | `python bench/test_bench.py` | **PASS** |
| Benchmark run | `python bench/run.py --mode local --repeats 2` | 12 answers scored by the **heuristic** fallback; no agreement metric claimed (no labels, no key) |
| TTS proxy | `POST /api/voice/synthesize` with a token | **200**, `audio/mpeg`, 14,544 bytes with an MP3 frame header (`FF F3`); no token → **401** |
| TTS proxy with `AI_SERVICE_TOKEN` set on both services | same call | **200**, `audio/mpeg`, 20,448 bytes; direct AI-service call without or with a wrong token → **401**, with the right one → **200** |
| Rubric path, real Gemini key | interview answered through the backend | matching strong answer → **91/100 A+**, all five evidence quotes grounded, radar from the rubric; off-topic answers → 16–58 with the evaluator naming the mismatch |
| Quota exhaustion | after the free-tier limit | two retries, then the heuristic fallback; the request still returns 200 and the score is not invented |
| PDF export | click "Download PDF Report" | **4,549-byte PDF**, 1 page, `%PDF-` header, browser console clean. `@react-pdf/renderer` 4.9.0; 4.8.1 threw `Standard font "Helvetica" is not registered` and silently fell back to `window.print()` |
| Coding round | `/api/coding/execute` + the Monaco panel | Judge0 **Accepted**, stdout `[1, 2, 3]`, 0.019 s; editor renders, Run shows the result in the UI |
| Voice | `/api/voice/synthesize`, `/api/voice/transcribe` | **200**, 13,248-byte `audio/mpeg`; mock transcript (`STT_PROVIDER=mock`, no Deepgram key provided) |
| Resume upload | `/api/resumes/upload` with a PDF | **409** with "Only text resumes can be parsed right now"; the picker now offers `.txt/.md` and says so instead of advertising PDF/DOCX |
| Feature sweep | coding languages/problems, voice voices, resume parse-text, unauthenticated GET | 200 / 200 / 200 / 200 / **401** |
| Browser walkthrough | Playwright over every route, desktop + mobile | **0 console errors**, 0 failed API calls; remaining request failure is the external CloudFront background video |

Live HTTP smoke test (backend on the `local` profile, port 8082, no AI service):

```
PASS register returns a token
PASS login returns a token
PASS job description created
PASS interview created as SCHEDULED
PASS scheduled interview has no answer key
PASS begin moves it to IN_PROGRESS
PASS begin again is idempotent (200, no re-transition)
PASS answer key is hidden in flight
PASS answer accepted (evaluation null without the AI service)
PASS duplicate answer returns the same evaluation
PASS another user gets 404, not 403
PASS report is owner-only (404)
PASS missing token is 401
PASS report returns arrays, not JSON strings (grade N/A, radar [])
PASS end completes the interview
PASS end again is idempotent (200)
PASS auth rate limit answers 429
```

Two bugs were found by this smoke test and fixed in the same branch: an unknown
path returned **500** instead of 404, and the wrong HTTP method returned **500**
instead of 405 (`ApiExceptionHandler` now maps `NoResourceFoundException` and
`HttpRequestMethodNotSupportedException`).

The browser no longer talks to the AI service at all: playback goes through
`POST /api/voice/synthesize`, which needs the same JWT as the rest of the API and
keeps `AI_SERVICE_TOKEN` server-side. The hard-coded Render URL and the unused
`VITE_AI_SERVICE_URL` variable are gone.

Known gaps left on purpose, each with its reason in §8: pagination and entity
indexes, migrations, bundle splitting, lite-mode auto-fallback, `@Data` on
entities, dead dependencies, committed tooling, and a seeded demo dataset.
