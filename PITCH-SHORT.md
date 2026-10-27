# AI Interviewer — Short Pitch

> **One line:** A mock interview that scores your answers the way a hiring panel does — and shows the exact words it used as evidence.

---

## A. Pitch — 10 marks

**Opening (say this, ~20 seconds):**

> "Everyone practises answers. Almost nobody practises being evaluated. ChatGPT says 'great answer'; a real interviewer says 'you never named a trade-off, and your result had no number'. We built the evaluator."

**The idea in one sentence:**
Choose a role, answer questions by text, voice or code, and get a rubric score, the evidence behind it, and a practice plan for the next attempt.

**Why it captures interest:**
The model is not allowed to give the score. It only supplies five criteria and five quotes; the score is calculated in code, and a quote that is not in your answer caps that criterion. **A score the model cannot invent.**

---

## B. Problem — 10 marks

**The problem (3 lines):**
- Questions are everywhere; honest, specific feedback is not.
- Generic AI rewards long, confident answers, so people rehearse the wrong habits.
- A mentor can mock-interview ten students; a placement cell has hundreds.

**Who it is for:**
1. Students and early-career engineers preparing for a first technical interview.
2. Career switchers who need role-specific language and behavioural structure.
3. Colleges, bootcamps and placement cells that need a repeatable first pass.

**Why it matters now:**
Rubric-shaped scoring and code execution are finally cheap enough to run per answer — cents and seconds instead of a mentor's afternoon.

---

## C. Presentation and demo — 10 marks

**3-minute demo (speak while clicking):**

| Time | Do | Say |
|---:|---|---|
| 0:00 | Dashboard | "One workspace: interviews, scores, proof." |
| 0:15 | New interview → role + résumé | "The job description drives the questions and the role-fit check." |
| 0:35 | Answer Q1, submit | "The model is writing five reasons and five quotes; the score comes after." |
| 1:20 | Feedback + Answer insights | "Filler words, pace, repeated words, STAR — counted locally, no second model call." |
| 1:40 | End → Report | "Radar and categories are computed from the five criteria, not written by the model." |
| 2:20 | Open one question | "Here is my answer, the review, and the expected answer." |
| 2:40 | Practice plan + PDF | "Weakest answer, weakest criterion, next session. One click for a real PDF." |
| 2:55 | Close | "Same rubric for everyone; evidence or no points." |

**Time management:**
- If Gemini takes ~25 s, talk through the rubric while it runs — never wait in silence.
- If the quota is out, open the pre-generated report and say: "It retries twice, then labels the heuristic. It never fakes a score."
- Have a screen recording as backup.

**Three Q&A one-liners:**
- *Is this just ChatGPT?* "No — the model justifies, the code scores, and fake quotes are capped."
- *What if the API is down?* "Two retries, then a labelled fallback; HTTP 200, no invented grade."
- *How is this different from Google Warmup or Yoodli?* "They coach delivery; we score substance, ask follow-ups, and run code."

---

## D. Overall project — 20 marks

**What actually works (one flow):**
Register → job description → résumé → interview (text / voice / code) → adaptive follow-ups → rubric evaluation → report (radar, categories, expected answer, sample response) → practice plan → PDF.

**What is original:**
1. **Evidence-grounded scoring** — five 0–10 criteria with verbatim quotes; missing quote = capped at 5/10 and flagged. The score is computed, not generated.
2. **Adaptive interview** — follow-ups and difficulty react to the answer, so a junior and a senior do not get the same questions.
3. **Honest degradation** — retries, then a clearly labelled keyword heuristic; never an invented 75/B.
4. **Whole loop, not just Q&A** — role fit, code execution (Judge0, 9 languages), optional proctoring, answer insights, practice plan, PDF.
5. **Insights without another model call** — filler rate, pace, most-used words, talking points, STAR coverage, all counted from the candidate's own words.

**How the score works (4 steps):**
1. The model returns five criteria, each with a rationale and a quote from the answer.
2. Each quote is checked against the answer text.
3. Weights are applied in code: technical depth 30, correctness 30, relevance 15, clarity 15, evidence 10.
4. The backend stores the evaluation and rebuilds the radar, chart and question review from stored rows.

**Technical execution (say the numbers):**
- React 18 + Vite → Spring Boot 3.4 (Java 21) → FastAPI → Gemini 3.5 Flash Lite; Judge0; edge-tts.
- **25 frontend, 11 backend, 14 AI-service tests pass**; 0 lint errors; production build passes.
- Real Gemini run: matching answer **91/100 A+**, all five quotes grounded; wrong-topic answers **16–58** with the mismatch named.
- Coding round: Judge0 **Accepted**; PDF export: real **4,549-byte** file.
- Browser walkthrough of the classic UI, desktop + mobile: **0 console errors**, 0 failed API calls.

**Content and scope:**
- ~3,200 curated questions across 18 role banks; 20 role profiles in the UI.
- Parked next step: **BASIC / ADVANCED / EXPERT** tiers, so experience level changes the question difficulty (`AUDIT.md` §8.2).

**Honest limits (say one, it builds trust):**
Free-tier quota is ~20 requests/model/day; without a Deepgram key transcription is mocked; résumé insights are English keyword heuristics.

---

## Chalkboard summary

```
Problem   feedback is scarce and vague
Solution  rubric-scored mock interview with evidence
Proof     91/A+ real run · 25/11/14 tests · 0 console errors
Moat      model justifies, code scores, fake quotes capped
Next      BASIC / ADVANCED / EXPERT tiers
```
