# PROJECTINFO.md — everything needed to build the ORBIT deck

> **Deck:** `ORBIT_Hackathon_Editable_Template.pptx` (8 slides, already in this folder)
> **Product:** AI Interviewer
> **Last updated:** 28 October 2026
> **How to use:** paste the **Slide copy** into the template, put the **Say** lines in the speaker notes, and drop the listed asset into the visual box.

---

## 0. Fact sheet (keep this open while designing)

| Field | Value |
|---|---|
| Project name | **AI Interviewer** |
| Tagline | **The mock interview that shows its evidence.** |
| Alternative tagline | Practice being evaluated, not just answering. |
| Domain | **AI/ML · EdTech** |
| Team name | **Campus Scope** *(the Google OAuth app uses this name — change it on slide 1 if your registered team name differs)* |
| Team members | **Eshan Khilare** — Co-Founder & AI Engineer · **Abhijit Kapure** — Co-Founder & Full-Stack Engineer · **Vishwesh Penkar** — Co-Founder & Product Designer |
| GitHub | https://github.com/vishweshpenkar06/AI-Interviewer |
| Live demo | Local/hosted demo only; do not print a public URL until it is deployed |
| One-liner | An AI mock interview that scores five criteria against a rubric, quotes the candidate's own words as evidence, and turns the result into a practice plan. |
| Core claim | **The model justifies; the code scores. A quote that is not in the answer cannot earn the point.** |
| Cover visual | `frontend/public/logo.jpeg` (or `LOGO.jpeg`) |

**20-second pitch (memorise):**
> "Every candidate practises answers. Almost nobody practises being evaluated. ChatGPT says 'great answer'; a real interviewer says 'you never named a trade-off, and your result had no number.' We built the evaluator: a role-specific mock interview with a five-criterion rubric, verbatim evidence, code execution and a practice plan."

---

## 1. The 8 slides in the ORBIT template

The template already defines the structure. Do not add slides unless the judges allow it; fill these.

### Slide 1 — Cover (01 / 08)

**Slide copy**

```
PROJECT NAME
AI Interviewer

TAGLINE
The mock interview that shows its evidence.

SELECTED DOMAIN
AI/ML · EdTech

TEAM NAME
Campus Scope

TEAM MEMBERS
Eshan Khilare · Abhijit Kapure · Vishwesh Penkar

PROJECT INTRODUCTION
AI Interviewer is a role-specific mock interview that scores answers against a
five-criterion rubric, quotes the candidate's own words as evidence, and turns
the report into a practice plan. It supports text, voice and code, and adapts
the next question to the answer.
```

**Visual:** logo at `frontend/public/logo.jpeg`; a thin strip of the three team photos (`frontend/public/team/*.jpg`) if the layout allows.

**Say (15–20 s):**
> "Most tools help you practise answers. This one shows you how a hiring panel scores them — with the evidence attached."

**Do not:** list every feature here. The cover should be one idea: evidence-backed evaluation.

---

### Slide 2 — Problem Statement (02 / 08)

**Slide copy**

```
THE PROBLEM
• Candidates get questions, not honest evaluation.
• Generic AI feedback rewards confidence and length, not correctness.
• Mentor mock interviews do not scale to a placement season.

TARGET USERS
• Students and early-career engineers (0–3 years)
• Career switchers preparing for a specific role
• Placement cells and bootcamps that need a first pass

WHY IT NEEDS TO BE SOLVED
• The interview is the bottleneck between a good engineer and a hired one.
• In our own test, a fluent but off-topic answer scored 16/100; a structured,
  on-topic answer scored 91/100. The difference is evidence, not confidence.
```

**Visual:** a simple two-answer comparison: “sounds confident → 16/100” vs “structured + evidence → 91/100” (a small typographic panel, not a chart).

**Say (30–35 s):**
> "Feedback is the bottleneck, not access to questions. A confident answer that misses the question should not score well — and in our evaluator it doesn't. We tested a fluent, off-topic answer: 16 out of 100. A structured, on-topic answer: 91. That gap is the product."

**Do not:** use an unverified market statistic. If you add one, put the source in the slide footer. The 16 vs 91 observation is ours and is enough.

---

### Slide 3 — Proposed Solution (03 / 08)

**Slide copy**

```
YOUR SOLUTION
AI Interviewer runs a complete practice loop: role + job description → résumé →
adaptive interview (text, voice or code) → rubric report → practice plan. It is
built for candidates, not for recruiter shortlisting.

KEY FEATURES
• Evidence-grounded score — five criteria, a verbatim quote per criterion, and a
  cap when the quote is not in the answer.
• Adaptive, multi-modal interview — follow-ups, difficulty changes, code
  execution in nine languages, optional proctoring.
• Report to next step — radar, per-question review, expected/sample answers,
  delivery insights and a spaced-repetition practice queue.

WHY THIS WORKS
• One flow, no setup: sign in, pick a role, start answering.
• The score is computed from criteria, not generated as an opinion.
• It is honest when the model fails: retries, then a labelled fallback.
```

**Visual:** `frontend/public/studio-report.png` — the 91/100, A+, RECOMMENDED report. Crop to the top banner + rubric radar if the box is small.

**Say (40 s):**
> "The loop is simple. The important part is under the hood: the model does not give the score. It returns five criteria and a quote for each; our code checks the quote against the answer and computes the weighted score. If the quote isn't there, that criterion is capped. That's what makes the number defensible."

---

### Slide 4 — Methodology and Workflow (04 / 08)

**Slide copy**

```
HOW THE PROJECT WORKS
01 INPUT      Role + job description, résumé, and the candidate's answer
02 PROCESS    Question bank + adaptive planner, follow-up generation
03 ANALYSE    Five-criterion rubric, evidence quotes, grounding check,
              weighted score, grade + radar
04 OUTPUT     Report, per-question review, practice plan, PDF

USER WORKFLOW
1. Sign up with email, phone or Google, and choose a role.
2. Add a job description and a résumé; see the role-fit keyword overlap.
3. Answer by text, voice or code; get a follow-up when useful.
4. End the interview and receive the report and next drills.

METHOD / APPROACH
• The model justifies; the code scores.
• A quote that is not in the answer caps that criterion at 5/10.
• Retries twice, then a clearly labelled keyword fallback.
• Deterministic insights (filler rate, pace, STAR, repeats) need no model call.
```

**Visual:** the four-step horizontal strip (Input → Process → Analyse → Output), plus a small screenshot of `docs/screenshots/interview-studio.png`.

**Say (45 s):**
> "Input is the role, the résumé and the answer. The planner picks the next question and can ask a follow-up. The evaluator returns five criteria with quotes. We check every quote against the answer; a fabricated justification cannot buy a score. Output is a report and a practice plan."

**Key numbers for this slide:**
- 5 criteria; weights: technical depth 30, correctness 30, relevance 15, clarity 15, evidence 10.
- 3,200+ curated questions across 18 role banks; 20 role profiles in the UI.
- 9 Judge0 languages.
- Missing quote → criterion capped at **5/10**, confidence HIGH → MEDIUM, `ungrounded_evidence` flag.

---

### Slide 5 — Technology Stack and Architecture (05 / 08)

**Slide copy**

```
TECHNOLOGY STACK
• Languages: JavaScript/TypeScript, Java 21, Python 3.11
• Frameworks: React 18 + Vite, Spring Boot 3.4, FastAPI
• Libraries: Recharts, Monaco, @react-pdf/renderer, Framer Motion
• APIs/services: Gemini 3.5 Flash Lite, Judge0, edge-tts, Google OAuth;
  Deepgram optional
• Database: MySQL / TiDB; H2 for local runs
• Tools: Docker, Maven, Vitest, pytest, GitHub, Render-ready

BASIC SYSTEM ARCHITECTURE
USER → React (Vite) → Spring Boot (JWT, ownership, reports)
                         ├──→ FastAPI → Gemini rubric
                         ├──→ Judge0 (code execution)
                         └──→ MySQL / TiDB
Optional: edge-tts / Deepgram for voice; browser pose/proctoring stays on-device.
```

**Visual:** three boxes — Client (React), Application (Spring Boot + FastAPI), Data/Services (MySQL, Gemini, Judge0) — and a small note "no video leaves the browser for proctoring".

**Say (30 s):**
> "React for the product, Spring Boot for accounts and reports, FastAPI for the AI path, Gemini for the rubric, Judge0 for code, and MySQL/TiDB for storage. Everything runs in Docker; the free-tier deployment path is documented."

**Do not:** claim Kubernetes, microservices at scale, or a vector database. The app is two services and a database.

---

### Slide 6 — Implementation and Documentation (06 / 08)

**Slide copy**

```
IMPLEMENTED FEATURES / COMPLETED MODULES
• Auth: email/password, phone identifier, Google OAuth, legal pages
• Role + JD + résumé parsing (PDF/DOCX/TXT/MD), role-fit keyword overlap
• Interview: adaptive questions, follow-ups, text/voice/code, drafts, timer,
  live answer hints, optional proctoring
• Evaluation: five-criterion rubric, evidence grounding, honest fallback
• Report: radar, categories, strengths/weaknesses, expected/sample answers,
  score delta, practice plan, spaced-repetition queue, PDF

SCREENSHOT 1 — Live session
docs/screenshots/interview-studio.png
Caption: "Question 1 of 3, with the session map and the scoring contract visible."

SCREENSHOT 2 — Report
frontend/public/studio-report.png
Caption: "91/100, A+, RECOMMENDED; the radar is computed from the rubric."

DOCUMENTATION / DEMO NOTES
README (setup), DEMO (runbook + quota), AUDIT (findings and evidence),
PITCH (deck script), docs/API.md (endpoints). 24 backend, 52 frontend and
14 AI-service tests; production build passes.
```

**Visual:** the two screenshots side by side. Crop the report screenshot to the banner + radar so the text is readable.

**Say (50 s):**
> "This is the working app, not a mock-up. On the left, a live interview with the question, session map and scoring contract. On the right, the report: 91 out of 100, A+, with the radar computed from the five criteria. The same code includes code execution, voice, proctoring, PDF export and a practice queue."

**Evidence you can quote:**
- Real Gemini run: **91/100 A+**, all five quotes grounded.
- Off-topic run: **16–58**, with the mismatch named.
- Judge0: **Accepted**, `[1, 2, 3]`, 0.019 s.
- PDF export: **4,549-byte**, one-page file.
- Quota fallback: two retries → labelled heuristic → HTTP 200.
- Browser walkthrough: **0 console errors** on the classic routes; studio live capture clean.

**Do not:** show the 16/100 report as the hero screenshot. Use the 91/A+ report; mention the 16 only in the problem slide.

---

### Slide 7 — Innovation, Impact and Feasibility (07 / 08)

**Slide copy**

```
INNOVATION
• The model may justify, never award: five criteria, five quotes, a cap when a
  quote is not in the answer.
• Adaptive interview + follow-ups + real code execution, not a chat wrapper.
• Deterministic answer insights and a practice plan derived from the scores.
• Honest degraded mode: retries, then a labelled keyword fallback.

IMPACT
• Candidates get specific next steps, not "great answer".
• Placement cells can give every student a first pass before a human mock.
• The report makes progress visible: score, weakest criterion, next drill.

FEASIBILITY
• Two Docker services + MySQL; free-tier deployment path documented.
• Gemini free tier ≈ 20 requests/model/day; a 3-question interview ≈ 9 calls.
• Limits: English keyword insights, mock STT without a Deepgram key, quota.

KEY TAKEAWAY: A score you can defend, and a next step you can act on.
```

**Optional competitor strip (notes, not the slide):**

| | ChatGPT mock | Google Warmup | Yoodli | Interviewer.AI | **AI Interviewer** |
|---|---|---|---|---|---|
| Rubric-scored substance | vague | no grading | delivery only | yes | **yes, 5 criteria** |
| Verified evidence quotes | no | no | no | not public | **yes, capped if fake** |
| Adaptive + code | prompt-dependent | no | no | limited | **yes** |
| Honest fallback | no | n/a | n/a | n/a | **yes** |

**Say (40 s):**
> "The novelty is the scoring contract. ChatGPT returns an opinion; we return criteria and quotes, and the code computes the score. That makes the result explainable to a candidate and defensible to a judge. It is also feasible: two services, a database, and a free-tier model budget."

**Do not:** claim measured learning outcomes or user traction. Say "designed to" and "in our tests".

---

### Slide 8 — Conclusion and Future Scope (08 / 08)

**Slide copy**

```
PROJECT SUMMARY
AI Interviewer turns interview practice into a rubric-scored loop with evidence:
role → résumé → adaptive interview → report → practice plan → next attempt.

FUTURE SCOPE
• BASIC / ADVANCED / EXPERT question tiers, so a junior and a senior stop
  getting the same interview.
• Deepgram speech-to-text for real voice practice.
• Shareable reports with revocation; cohort analytics for placement cells.
• More role banks and languages; a paid model tier for longer sessions.

CLOSING
Practice the evaluation, not just the answer.

THANK YOU · QUESTIONS & ANSWERS
```

**Say (20 s):**
> "The next step is difficulty tiers: a junior and a senior should not get the same questions. Then real speech-to-text and shareable reports. The product is already a complete loop; these make it sharper."

---

## 2. Timing

### 5-minute version

| Slide | Time | Focus |
|---|---:|---|
| 1 Cover | 0:00–0:20 | Hook + team |
| 2 Problem | 0:20–1:00 | Feedback gap + 16 vs 91 |
| 3 Solution | 1:00–1:45 | The loop + three features |
| 4 Method | 1:45–2:30 | Input → output + scoring contract |
| 5 Tech | 2:30–3:10 | Architecture, no buzzwords |
| 6 Implementation | 3:10–4:00 | Two real screenshots + numbers |
| 7 Innovation/Impact/Feasibility | 4:00–4:40 | Why it is different and buildable |
| 8 Conclusion | 4:40–5:00 | Summary, next, close |

### 3-minute cut

Cover 10 s → Problem 30 s → Solution 30 s → Method 30 s → Tech 20 s → Implementation 40 s → Innovation/Impact 30 s → Close 20 s.

### 60-second elevator

Problem 15 s → "rubric + evidence" 15 s → report screenshot 20 s → "91/A+ real run, 24/52/14 tests, free-tier deployable" 10 s.

---

## 3. Demo runbook (if you demo live)

**Before the room**
- [ ] Backend on `:8082` (`/api/health` = `status=UP db=UP ai=UP`), AI on `:8001`, frontend on `:5173`.
- [ ] Account registered **after** the last backend restart (local H2 is in-memory).
- [ ] One job description and one résumé already saved.
- [ ] One completed report open in a second tab as a fallback.
- [ ] PDF export tested.
- [ ] Gemini quota available, or the pre-generated report ready.
- [ ] Google sign-in tested if you plan to show it; the consent screen is “Campus Scope”.

**Fast path (no waiting)**
1. Dashboard → open the completed report.
2. Show the 91/A+ banner, the radar, one question’s evidence, the practice plan.
3. Click **Download PDF Report**.
4. If time: start a new interview and answer one question live; narrate the rubric while it scores (~25 s).

**What to say while scoring:** “The model is writing five rationales and quoting evidence; the score is computed after that. That is why it takes a few seconds but the number is traceable.”

**If the quota is out:** “It retries twice, then labels the keyword fallback. The request still succeeds; the score is honest about the weaker mode.”

---

## 4. Numbers to use (and not use)

| Claim | Use | Source |
|---|---|---|
| Question bank | **3,200+ curated questions across 18 role banks** | sum of `backend/src/main/resources/question-banks/*.json` = 3,274 |
| Role profiles in UI | **20** | `JOB_ROLES` |
| Rubric | **5 criteria**: technical depth 30, correctness 30, relevance 15, clarity 15, evidence 10 | `rubric_evaluator.py` |
| Evidence rule | missing/ungrounded quote → criterion **capped at 5/10**, confidence HIGH→MEDIUM | `rubric_evaluator.py` |
| Real matching answer | **91/100, A+, RECOMMENDED**, all five quotes grounded | live run; `studio-report.png` |
| Off-topic answer | **16–58/100**, evaluator names the mismatch | live runs |
| Code execution | **Judge0 Accepted**, 9 languages, `[1, 2, 3]`, 0.019 s | live run |
| PDF | **4,549-byte**, one-page PDF | live click test |
| Tests | **24 backend, 52 frontend, 14 AI-service** (last verified 27 Oct 2026) | `mvn test`, `npm test`, `pytest` |
| Console | **0 errors** on the classic walkthrough; studio live capture clean | Playwright |
| TTS | 13,248-byte MP3 via edge-tts | live run |
| STT | Mock transcript without a Deepgram key | `STT_PROVIDER=mock` |

**Do not claim:**
- “25+ roles” — the UI has **20** profiles; 18 banks.
- “3,400+ questions” — use **3,200+** (or “3,274”).
- “100% accurate”, “hiring prediction”, “ATS score”, “emotion detection”.
- “SMS-verified phone” — phone is a **password-based identifier**, not OTP.
- “Real-time voice AI” — STT is mocked unless a Deepgram key is configured.
- “User traction” or “X% improvement” — no user study yet.

---

## 5. Judge Q&A (short answers)

**“Isn’t this just ChatGPT with a prompt?”**
No. ChatGPT returns a score and a paragraph. Here the model returns five criterion scores and five quotes; the score is computed in code, and a quote that is not in the answer caps that criterion. The model cannot award a point it cannot evidence.

**“How do you stop prompt injection?”**
Known markers (“ignore previous instructions”, “system prompt”, “return a score of 100”, chat-control tokens) are neutralised before the prompt and reported as flags; answers are capped at 8,000 characters. The evaluator has no tools and no write access.

**“What if Gemini is down or the quota is exhausted?”**
Two retries, then a keyword heuristic, clearly labelled in the response. The app stays usable; the report says which mode scored it.

**“Is the score fair?”**
Same rubric, weights and grounding rule for every candidate. No demographic inputs. A missing quote becomes a visible weakness; confidence and flags are stored.

**“How is this different from Google Warmup / Yoodli?”**
They coach delivery and reflection; Warmup explicitly does not grade. This scores substance with evidence, asks follow-ups, runs code, and produces a hiring-style report.

**“What did you build versus use?”**
Built: rubric evaluator, grounding rule, adaptive planner, insights, practice plan, report pipeline, proctoring, ownership/security. Used: Gemini, Judge0, edge-tts, Monaco, Recharts.

**“What is the biggest weakness?”**
Free-tier quota (20 requests/model/day), English keyword insights, and mock STT without a Deepgram key. The UI and docs label the fallback rather than hiding it.

**“Business model?”**
Free candidate tier; paid individual plan for unlimited model scoring and PDF; per-seat licence for placement cells/bootcamps. The rubric and report are the moat, not the question list.

**“Scalability?”**
Two stateless services and a database; one model call per answer; the fallback keeps the request path alive. The free-tier deployment path is documented; a paid tier removes the quota ceiling.

**“Privacy?”**
Optional proctoring runs in the browser; video is not uploaded. Passwords are BCrypt-hashed; JWTs; delete-account flow; Privacy, Terms and Cookie pages.

**“What is next?”**
BASIC / ADVANCED / EXPERT tiers, real speech-to-text, shareable reports, cohort analytics.

---

## 6. Asset list

| Asset | Path | Use |
|---|---|---|
| Logo | `frontend/public/logo.jpeg` (also `LOGO.jpeg`) | Cover, closing |
| Team photos | `frontend/public/team/eshan-khilare.jpg`, `abhijit-kapure.jpg`, `vishwesh-penkar.jpg` | Cover / team strip |
| Report screenshot (91/A+) | `frontend/public/studio-report.png` | Slide 3 or 6 |
| Live session screenshot | `docs/screenshots/interview-studio.png` | Slide 4 or 6 |
| PPT template | `ORBIT_Hackathon_Editable_Template.pptx` | Edit this file |
| Source photos | `IMG 1.jpeg`, `IMG 2.jpeg`, `IMG 3.jpeg` | Duplicates of the team photos |

**Screenshot caption tips**
- Report: “Rubric-computed radar; 91/100 A+; evidence quotes are checked against the answer.”
- Live: “Question 1 of 3, with the session map and the scoring contract in view.”

**If you need one more screenshot:** open a completed report → scroll to **Your practice plan** or **Question Review**, capture the plan + one question. Or open the coding round and capture the Monaco editor with an Accepted result.

---

## 7. Design notes for the deck

- Keep the ORBIT template's layout; replace the placeholder text, do not restyle the whole deck.
- Use **one dark product screenshot per slide**, not five small ones.
- Accent colours from the product: indigo `#6366f1`, violet `#8b5cf6`, amber `#fbbf24`.
- Font: keep the template's typography; the product uses Geist/Fraunces.
- Every number on the slide must have a source in this file.
- One idea per slide; the speaker says the detail.
- Do not put the GitHub URL on every slide; once on the cover/closing is enough.

---

## 8. Submission checklist

- [ ] Slide 1 has the real team name and all three members.
- [ ] Slide 2 uses the 16 vs 91 observation, not an unsourced market stat.
- [ ] Slide 3 has one product screenshot, not a feature collage.
- [ ] Slide 4 explains the scoring contract in one line.
- [ ] Slide 5 lists only technologies actually used.
- [ ] Slide 6 has two labelled, real screenshots and the test numbers.
- [ ] Slide 7 names one limitation (quota or mock STT) — it builds trust.
- [ ] Slide 8 has a concrete next step (tiers, STT, shareable reports).
- [ ] The demo account/report is ready; quota checked; PDF tested.
- [ ] GitHub repo is public: `github.com/vishweshpenkar06/AI-Interviewer`.

---

## 9. Sources and further context

- `README.md` — setup, stack, environment variables.
- `DEMO.md` — runbook and Gemini quota maths.
- `AUDIT.md` — findings, fixes, live evidence, parked BASIC/ADVANCED/EXPERT tiers (§8.2).
- `PITCH.md` / `PITCH-SHORT.md` — longer pitch and marks-mapped version.
- `CONCEPTS.md` — which product concepts were borrowed and what was deliberately not copied.
- `PROBLEMS.md` — 28 real candidate problems and their status.
- `docs/API.md` — endpoint reference.
- `frontend/public/studio-report.png` — the 91/A+ report shown in the deck.
