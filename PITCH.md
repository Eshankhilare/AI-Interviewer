# AI Interviewer — Pitch

> **One line:** Most tools help you *practise answers*. This one shows you how a hiring panel *scores* them — with the evidence attached.

---

## 1. The opening (30–40 seconds)

> "Every candidate practises answers. Almost nobody practises being **evaluated**.
>
> ChatGPT will tell you your answer is great. A real interviewer will tell you it was vague, that you never named a trade-off, and that your 'result' had no number in it.
>
> We built the evaluator. It asks role-specific questions, pushes back with follow-ups, scores five criteria against a rubric, and refuses to award a point it cannot quote from your own answer. In the next few minutes you'll see a candidate answer, a score the model cannot invent, and a practice plan for the next attempt."

**Why this opening works for the rubric**

| Criterion | What it does |
|---|---|
| Clarity and impact (3) | One contrast: *practise answers* vs *practise being evaluated* |
| Idea and value (4) | Names the gap (vague AI praise) and the promise (evidence-grounded score) |
| Capture interest (3) | "A score the model cannot invent" is the hook the demo pays off |

---

## 2. The problem (60 seconds)

**For candidates:** feedback is the bottleneck, not access to questions. Free question lists are everywhere; honest, specific feedback is not. Generic AI chat rewards length and confidence, so candidates rehearse the wrong habits.

**For educators and placement cells:** mock interviews do not scale. A mentor can sit with ten students; a placement cell has hundreds, and the feedback quality depends on who is available that day.

**Target users, in priority order**

1. **Students and early-career engineers** — 0–3 years, preparing for the first or second technical interview.
2. **Career switchers** — need role-specific vocabulary and a structure for behavioural answers.
3. **Bootcamps, colleges, placement cells** — need a repeatable first pass before a human mock.
4. **Recruiters (later)** — the same rubric can pre-screen, but that is not the wedge: candidates are the users who feel the pain weekly.

**Why now:** rubric-shaped scoring is finally cheap enough to run per answer, and code execution is available as an API. A three-question interview costs cents and minutes, not a mentor's afternoon.

---

## 3. The solution

One flow, end to end:

```
Choose role  →  Add résumé + job description  →  Interview  →  Report  →  Practice plan
                  (role-fit check)              text / voice / code
```

**Six things that make it different**

1. **The score is computed, not generated.**
   The model returns five 0–10 criteria with a rationale and a verbatim quote per criterion. The 0–100 score, grade and radar are calculated from those. Technical depth and correctness weigh 30% each; relevance and clarity 15%; evidence 10%.
   If a quote does not appear in the answer, that criterion is capped at 5/10 and the report is flagged `ungrounded_evidence`. A fabricated justification cannot buy a score.

2. **It pushes back.**
   Each answer can trigger a follow-up, and the planner moves difficulty up or down from the score. A senior and a junior do not get the same interview.

3. **It is honest when it fails.**
   Provider errors are retried twice, then the request falls back to a clearly labelled keyword heuristic — still HTTP 200, never an invented 75/B. Quota exhaustion is a documented state, not a crash.

4. **It covers the whole loop.**
   Résumé/JD keyword fit, five-criterion evaluation, per-question review, expected answer and sample response, radar and category charts, PDF export, optional proctoring, and a Judge0 coding round with nine languages.

5. **Answer insights without another model call.**
   After every answer: filler-word count and rate (Yoodli's 3% guideline), pace in words per minute when the answer was spoken, most-used words (3+ repeats), talking points covered (experience, skills, results, lessons, goals), and STAR coverage for behavioural questions. Every number is a count over the candidate's own words.

6. **A practice plan, not just a grade.**
   The report rebuilds the weakest answer first, drills the weakest rubric criterion with a concrete instruction, and sets the next session. It is derived from scores already in the report.

---

## 4. Judging criteria → where this document answers them

| Marks | Criterion | Answer in this pitch |
|---:|---|---|
| 3 | Clarity and impact of the opening | §1 opening script |
| 4 | Communication of idea and value | §1, §3, §6 |
| 3 | Ability to capture interest | §1 hook, §5 demo |
| 4 | Clear definition of the problem | §2 |
| 3 | Relevance and significance | §2 "why now", target users |
| 3 | Understanding of target users | §2 user list, §7 |
| 3 | Logical flow and clarity | This section + §5 time budget |
| 4 | Quality of demonstration | §5 script + pre-flight |
| 3 | Time management and Q&A | §5 timings, §9 Q&A |
| 7 | Functionality and working implementation | §6 evidence table |
| 5 | Innovation and originality | §7 |
| 5 | Effectiveness of the solution | §3, §6 |
| 3 | Technical execution and completeness | §5 architecture, §8 limits |

---

## 5. Live demo — 5 minutes

**Pre-flight (do this 10 minutes before)**

- [ ] `http://localhost:5173` loads; backend `/api/health` shows `status=UP db=UP ai=UP`.
- [ ] One account registered **after** the last backend restart (the local H2 DB is in-memory).
- [ ] One job description and one parsed résumé already saved.
- [ ] One **completed** interview with a real Gemini report open in a second tab as fallback.
- [ ] PDF export works (one click, one file).
- [ ] Pick the UI shell and stick to it: classic (`?ui=classic`) is the fully verified path; verify the Studio shell before demoing it.
- [ ] Open one answer and one report: **Answer insights**, **Role fit** and **Practice plan** each render once.
- [ ] Have a screen recording of the same flow as a backup.

**Timed script**

| Time | Action | Say |
|---:|---|---|
| 0:00 | Dashboard | "This is the candidate's workspace: interviews, scores, proof." |
| 0:20 | New interview → role + résumé | "The job description drives the question bank and the role-fit check." |
| 0:50 | Start, answer Q1 aloud or type | "Watch the follow-up: it reacts to what I actually said, not to a script." |
| 1:50 | Submit | "Scoring takes ~25 seconds with Gemini. The model is writing five rationales and quoting evidence; the score is computed after that." |
| 2:20 | Feedback + Answer insights | "Filler rate, pace, most-used words, STAR — counted locally, no second model call." |
| 2:50 | Continue Q2, end interview | "Three questions is a full loop." |
| 3:10 | Report | "Radar is computed from the five criteria. Category chart from question types. Every number traces to an evaluation." |
| 3:40 | Open a question | "Here is my answer, the review, and the expected answer. Nothing hidden." |
| 4:10 | Practice plan | "Rebuild the weakest answer, drill the weakest criterion, next session." |
| 4:30 | PDF | "One click, real PDF." |
| 4:40 | Close | "Same rubric for every candidate; evidence or no points." |

**If the model is slow or the quota is out:** do not wait in silence. Open the pre-generated report, show the evidence quotes, then use the live interview only for the first question. The fallback is part of the story: "the app retries twice, then labels the heuristic — it never invents a score."

**3-minute cut:** dashboard (10s) → report (60s: radar, one question, practice plan) → live Q1 + insights (60s) → PDF + close (30s).

**60-second elevator:** problem (15s) → rubric-scored promise (15s) → one report screenshot (20s) → evidence/close (10s).

---

## 6. How it works

```
React 18 + Vite  ──HTTP/JWT──►  Spring Boot 3.4 (Java 21)  ──shared token──►  FastAPI
   Recharts, Monaco, PDF          H2 locally / MySQL          rubric evaluator
   MediaPipe (optional)           ownership + rate limits     Gemini 3.5 Flash Lite
                                        │
                                        ├── Judge0 (code execution, 9 languages)
                                        └── edge-tts (free TTS)
```

**The scoring pipeline**

1. The question, answer, and expected answer are sanitised (8,000-char cap, prompt-injection markers neutralised and flagged).
2. Gemini returns strict JSON: five criteria (0–10), a rationale and a verbatim evidence quote each, plus strengths, weaknesses, suggestions and a sample response.
3. Each quote is checked against the answer text. Missing quote → criterion capped at 5/10, confidence HIGH→MEDIUM, `ungrounded_evidence` flag.
4. The weighted score is computed in code; grade bands A+ ≥90 … F <30.
5. The backend stores the evaluation and rebuilds the radar, category chart and question breakdown from stored rows — not from model prose.

**Integrity and safety**

- Every id-scoped endpoint checks ownership; cross-user reads return 404.
- JWT required; `JWT_SECRET` is mandatory in production.
- 60 requests/minute per IP on auth; CORS allow-list; upload size/type limits.
- Proctoring is opt-in: face presence, tab switches, copy/paste. Three repeated alerts end the session. No video is uploaded.

---

## 7. What was verified (not asserted)

| Check | Result |
|---|---|
| Frontend tests | **25 passed**, 6 files |
| Backend tests | **11 passed** (`BUILD SUCCESS`) |
| AI-service tests | **14 passed** |
| Lint / build | **0 errors**; production build passes |
| Real Gemini, matching answer | **91/100, A+, RECOMMENDED**, all five quotes grounded |
| Real Gemini, wrong-topic answer | **16–58**, evaluator names the mismatch |
| Quota exhaustion | two retries → labelled heuristic → **HTTP 200**, no invented score |
| Coding round | Judge0 **Accepted**, stdout `[1, 2, 3]`, 0.019 s; Monaco UI shows the result |
| PDF export | **4,549-byte**, one-page PDF, console clean (4.8.1 crashed; upgraded to 4.9.0) |
| TTS / STT | 13,248-byte MP3; mock transcript (no Deepgram key) |
| Browser walkthrough | classic UI, every route, desktop + mobile: **0 console errors**, 0 failed API calls |
| Unauthenticated API | **401** |

**Four bugs this pass, as proof of execution:** every white CTA was invisible (a global CSS reset erased backgrounds); the PDF button silently fell back to print; the coding editor collapsed to zero height; reports said "No answer provided" for answered questions. All fixed, all verified in the browser.

---

## 8. Innovation and originality

| | Generic ChatGPT mock | Google Interview Warmup | Yoodli | Interviewer.AI | **This project** |
|---|---|---|---|---|---|
| Scores substance against a rubric | Vague | No grading | Delivery only | Yes | **Yes, 5 weighted criteria** |
| Evidence quotes verified | No | No | No | Not public | **Yes, capped if fabricated** |
| Adaptive difficulty + follow-ups | Prompt-dependent | No | No | Limited | **Yes** |
| Code execution | No | No | No | No | **Judge0, 9 languages** |
| Answer insights without a model call | No | Insights, no score | Delivery metrics | Analytics | **Both, deterministic** |
| Honest degraded mode | No | N/A | N/A | N/A | **Labelled heuristic** |
| Open, local-first | No | No | No | No | **Yes** |

The original contribution is the **scoring contract**: the model may only justify, never award. That single rule turns an LLM from an opinion into a rubric engine, and it is what makes the report defensible to a candidate.

---

## 9. Judge Q&A — short answers

**"Isn't this just ChatGPT with a prompt?"**
No. ChatGPT returns a score and a paragraph. Here the model returns five criterion scores and five quotes; the score is computed in Python/Java, and a quote that is not in the answer caps that criterion. The model cannot award a point it cannot evidence.

**"How do you stop prompt injection in the answer?"**
Known markers ("ignore previous instructions", "system prompt", "return a score of 100", chat-control tokens) are neutralised before the prompt and reported as flags; answers are capped at 8,000 chars. The evaluator has no tools and no write access.

**"Is the score fair?"**
Every candidate gets the same rubric, the same weights and the same grounding rule. Demographics are never sent. A quote that is not in the answer becomes a visible weakness in the report, and each stored evaluation keeps its confidence and flags, so a weak score is visibly weak rather than hidden.

**"What if Gemini is down or the quota runs out?"**
Two retries, then the keyword heuristic, clearly labelled in the response. The app stays usable; the report says which mode scored it.

**"Why not use a bigger model?"**
The contract matters more than the model. `LLM_MODEL` is a config value; the rubric, grounding and fallback are model-independent.

**"How is this different from Google Warmup / Yoodli?"**
They coach delivery and reflection; Warmup explicitly does not grade. This scores substance with evidence, asks follow-ups, runs code, and produces a hiring-style report.

**"What is the business model?"**
Free candidate tier (daily interviews), paid individual plan for unlimited model scoring and PDF, and a per-seat licence for placement cells/bootcamps. The rubric and report are the moat, not the question list.

**"What is the biggest weakness?"**
The free-tier quota (20 requests/model/day) and the heuristic fallback are visibly weaker. Without a Deepgram key, transcription is mocked. PDF/DOCX résumé parsing is deferred; the UI now says text-only instead of pretending.

**"What would you build next?"**
The parked **BASIC / ADVANCED / EXPERT** tiers (`AUDIT.md` §8.2): the same rubric, three question banks and a tier-aware planner, so a junior and a senior stop getting the same interview. Then shareable reports with revocation, and real résumé parsing.

**"What did you build versus use?"**
Built: rubric evaluator, grounding rule, adaptive planner, insights, practice plan, report pipeline, proctoring, ownership/security layer. Used: Gemini, Judge0, edge-tts, MediaPipe, Monaco, Recharts.

---

## 10. Honest limits (say them before a judge finds them)

- **Free-tier quota:** ~20 requests per model per day; a three-question interview spends ~9. Budget two demo interviews per model; keep a paid key or a pre-generated report.
- **Heuristic fallback is lenient:** it is labelled and it never pretends to be the rubric.
- **STT is mock without a Deepgram key:** the UI labels it; TTS is free edge-tts.
- **Insights are English keyword heuristics:** good enough for filler rate, pace, repeats and STAR signals; not a semantic NLP model.
- **Local H2 is in-memory:** every backend restart wipes accounts. Production uses MySQL/TiDB.
- **Proctoring is browser-side:** presence and tab/copy events, not surveillance; it is optional and does not change the score.

---

## 11. Roadmap

| Now | Next | Later |
|---|---|---|
| Rubric scoring, adaptive interview, code round, report, PDF, insights, practice plan | BASIC/ADVANCED/EXPERT tiers; Deepgram STT; PDF/DOCX parsing | Shareable reports; cohort analytics; recruiter shortlists; fairness audit |

---

## 12. Appendix — run it and find things

```powershell
# AI service — http://localhost:8001
cd ai-service; .\.venv\Scripts\python.exe -m uvicorn main:app --port 8001

# Backend — http://localhost:8082 (local profile, H2)
cd backend; & "$env:TEMP\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run "-Dspring-boot.run.profiles=local"

# Frontend — http://localhost:5173
cd frontend; npm run dev
```

`frontend/.env.local` must contain `VITE_API_URL=http://localhost:8082`. Register after every backend restart.

| Where | What |
|---|---|
| `README.md` | setup, stack, env vars |
| `DEMO.md` | demo runbook + quota maths |
| `AUDIT.md` | findings, fixes, evidence, parked tiers |
| `bench/` | scoring benchmark + heuristic warnings |
| `ai-service/app/services/rubric_evaluator.py` | rubric, grounding, retries |
| `frontend/src/utils/answerInsights.js` | filler / pace / STAR / talking points |
| `frontend/src/utils/practicePlan.js` | report → next steps |
| `frontend/src/utils/roleMatch.js` | résumé ↔ JD keyword overlap |

**Rubric weights:** technical depth 30 · correctness 30 · relevance 15 · clarity 15 · evidence 10.
**Grade bands:** A+ ≥90 · A ≥80 · B+ ≥70 · B ≥60 · C+ ≥50 · C ≥40 · D ≥30 · F <30.
**Question banks:** ~3,200 curated questions across 18 role banks; 20 role profiles in the UI.
