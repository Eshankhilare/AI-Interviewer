# Demo Guide

A three-minute run-through that shows the parts of this project that are actually
finished, and says out loud where the limits are. Nothing here is faked.

## Before you present

```bash
# terminal 1 - AI service
cd ai-service && uvicorn main:app --port 8001

# terminal 2 - backend, in-memory DB, no MySQL needed
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local

# terminal 3 - frontend
cd frontend && npm run dev
```

Open `http://localhost:5173`, register an account (the `local` profile drops its
database on restart, so register again after each restart).

> The `local` profile runs on **8082**, so `frontend/.env.local` must contain
> `VITE_API_URL=http://localhost:8082`. Without it the frontend calls 8080 and
> every request fails. This file is gitignored; create it once.

Optional but recommended: put a Gemini key in `ai-service/.env` as `LLM_API_KEY`.
Without it the app still runs end to end, but every answer is scored by the
keyword heuristic, which is exactly what `bench/RESULTS.md` warns about.

**Gemini free tier: 20 requests per day per model.** One three-question interview
spends about six — a follow-up and an evaluation per answer — plus one to three
on the report, so the free tier covers roughly two demo interviews per model per
day. When it runs out, the evaluator retries twice, then falls back to the
heuristic and the request still succeeds; the score just gets lenient. Use a
paid key for a longer session, or point `LLM_MODEL` at another model, since each
model has its own daily allowance.

**Repeated answers are cached.** The AI service caches identical rubric
evaluations for 7 days and follow-ups for 24 hours. Locally the cache is
process memory; to share it across restarts or demo instances, add
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the Upstash REST
API. This makes a repeated demo answer instant but does not make a new answer
faster, and it does not affect first page load.

First request after a cold start is slow on a free tier. The backend reports the
AI service state at `GET /api/health`, so you can check readiness before
presenting:

```bash
curl http://localhost:8082/api/health
```

## The three-minute script

1. **Create a job description** (Job Descriptions -> New). Use the
   `Backend Developer` title so the bundled question bank has questions for it.
2. **Start an interview** (New Interview), pick the job description, 3 questions.
3. **The integrity notice appears.** Point at it: proctoring is optional, the
   face checks run in the browser, no video is uploaded. Choose "Continue without
   it" if you want to skip the camera permission prompt.
4. **Answer question 1 with a deliberately weak answer** ("An index makes it
   faster because it's a shortcut"). Submit. Show the per-criterion feedback and
   the score. Mention that the score is computed in code from the rubric, not
   written by the model.
5. **Answer question 2 well** — mention selectivity, covering indexes and write
   cost. If the evaluator is running, the next question should be **HARD**: that
   is the adaptive step, visible in the difficulty badge.
6. **End the interview.** On the report, show that the radar chart has the five
   rubric axes and the category chart uses real question types. Open the browser
   console? No need: ask them to reload the report — the charts still come from
   the database.
7. **Open a second account in a private window** and paste the first account's
   report URL. It returns 404, not 403: the API does not even admit the report
   exists.

## Things worth saying out loud

- **The score is not the model's opinion.** The model returns five 0-10 criteria
  and a quote per criterion; the 0-100 number, grade and radar are computed from
  those. A quote that does not appear in the answer is capped and flagged.
- **Scoring takes 20-30 seconds per answer** with Gemini 2.5 Flash: the model
  writes five rationales and a paragraph of feedback. The submit button shows a
  spinner; the request timeout is 120 s.
- **When nothing was evaluated, the report says `N/A` / `INSUFFICIENT_DATA`.**
  No invented 75/B.
- **The answer key is not sent to the browser** until the interview is completed.
- **The heuristic fallback is not good.** `bench/RESULTS.md` shows it scoring a
  ten-word "I am not sure" at 50/100. That is why the rubric path exists and why
  the benchmark reports its own limits instead of a fake accuracy number.
- **Proctoring is a browser-side signal, not an invigilator.** It flags tab
  switches and missing faces; it cannot detect a phone off-camera, and it says so.

## If something is not running

| Symptom | Cause | What to do |
|---|---|---|
| Report shows `N/A` | AI service down or no `LLM_API_KEY` | start the AI service, or accept the heuristic score; the UI explains it |
| `429` on login | more than 60 attempts in a minute | wait 60 seconds |
| Interview 409 | begin/end/answer called in the wrong order | reload the interview page; it resumes at the current question |
| Login works, then everything is 401 | backend restarted with the `local` profile (random JWT key) | log in again |
| Camera never starts | permission denied, or proctoring declined | the interview continues without it |
