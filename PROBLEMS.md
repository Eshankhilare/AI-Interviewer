# 28 real problems this project can solve

The product is a **candidate practice tool**, not a recruiter ATS. Every item
below is a real failure mode reported by candidates or visible in mock-interview
tools; the status says whether this repo already handles it.

Legend: **Shipped** = implemented and exercised in this repo, **Earlier** =
already present before this pass, **Planned** = clear design, deliberately not
built yet.

| # | Real problem | What this project does about it | Status |
|---|---|---|---|
| 1 | Candidates freeze because practice is not realistic | Timed sessions from a 200-question bank across 25+ roles, with adaptive difficulty | Earlier |
| 2 | A score with no explanation is useless | Five-criterion rubric; every criterion carries a rationale and a verbatim evidence quote | Earlier |
| 3 | "Good answer" feedback does not tell you what to change | Per-question review with strengths, weaknesses, improvement suggestions, expected and sample answers | Earlier |
| 4 | Candidates answer a different question than the one asked | Live **question coverage** meter: how many question terms the answer actually uses | **Shipped** |
| 5 | Answers ramble or stop too short | Live length target by question type (40–180 technical, 80–220 behavioural) and a flag for sentences over 28 words | **Shipped** |
| 6 | Filler words and weak language undermine confidence | Live and post-answer filler count/rate (3% guideline) plus weak-word detection ("very", "really", "just", "stuff") | **Shipped** |
| 7 | Behavioural answers miss the STAR structure | Live STAR parts (Situation/Task/Action/Result) and a post-answer coverage strip | **Shipped** |
| 8 | Candidates speak too fast or too slow | Pace in words per minute for voice answers, with the 130–170 comfortable band | **Shipped** |
| 9 | The same words repeat without the candidate noticing | Most-used words (3+ repeats), live while typing and in the report | **Shipped** |
| 10 | The resume does not match the job description | Role-fit card: keyword overlap and the terms the resume never mentions | **Shipped** |
| 11 | One practice session is forgotten by the next day | Spaced-repetition queue: Again 10 min, Hard 1 day, Good 2 days then growing, Easy longer | **Shipped** |
| 12 | Candidates practise random questions instead of their weak spots | Practice plan derived from the lowest-scoring question and the two weakest criteria | **Shipped** |
| 13 | A refresh or crash loses the answer being typed | Draft autosave per user/interview/question in `localStorage`, restored on reload | **Shipped** |
| 14 | No sense of how long the interview is taking | Live session timer on the classic interview (the studio already had a countdown) | **Shipped** |
| 15 | Submitting takes a mouse trip and breaks flow | Ctrl/⌘ + Enter submits the answer from the textarea | **Shipped** |
| 16 | Practice is not a habit, so progress stalls | Day streak and sessions-this-week on the dashboard | **Shipped** |
| 17 | A score means nothing without a baseline | Report shows the delta against the previous completed interview | **Shipped** |
| 18 | A practice schedule trapped in one browser is fragile | Export/import JSON, reset, and a server-side copy that follows the account | **Shipped** |
| 19 | Technical screens need real code execution, not whiteboarding | Monaco editor backed by Judge0 (run/submit, language switch, stdin) | Earlier |
| 20 | Candidates cannot practise spoken answers | Browser speech-to-text, TTS questions, transcript-driven insights | Earlier (STT mock without a Deepgram key) |
| 21 | Webcam presence and posture matter in video interviews | Optional on-device pose panel: presence, posture, engagement, fidgeting | Earlier |
| 22 | Mock interviews do not rehearse integrity rules | Optional proctoring: tab switches, clipboard, face count, repeated alerts end the session | Earlier |
| 23 | Uploading a resume is high-friction | PDF, DOCX, TXT and MD uploads; PDFBox text extraction; scanned PDFs rejected with a clear message | **Shipped** |
| 24 | Writing a job description from scratch is slow | 25+ role templates, custom JDs, and JD analysis | Earlier |
| 25 | Model quotas and outages break a demo | Two retries then an honest keyword fallback; the request still succeeds and the report says the mode | Earlier |
| 26 | Feedback cannot be shared with a mentor | One-click PDF report with the score, radar, review and plan | Earlier |
| 27 | Accessibility is an afterthought | Automated WCAG 2 A/AA pass on six key pages: **0 violations**; skip link, focus, labels, reduced motion fixed | **Shipped** (manual screen-reader pass still planned) |
| 28 | Practice data should not leave the device by default | Self-graded schedule syncs to the account; unsent drafts stay local; no third-party analytics | **Shipped** |

## Problems this project deliberately does **not** solve

- **Live interview copilots** that feed answers during a real interview. That is
  cheating, and it conflicts with the proctoring this app rehearses.
- **Recruiter stack-ranking / ATS rejection.** This is a single-candidate
  practice tool; the role-fit card is labelled keyword overlap, not a hiring
  prediction.
- **Audio/video ML that claims to measure honesty or emotion.** The pose panel
  is optional and reports only what it can count.

## Where the new work lives

| Concern | Files |
|---|---|
| Live hints (coverage, length, STAR, fillers) | `frontend/src/components/interview/LiveAnswerHints.jsx`, `utils/answerInsights.js`, `utils/roleMatch.js` |
| Draft autosave | `frontend/src/utils/drafts.js`, wired in `pages/Interview.jsx` |
| Timer and keyboard submit | `frontend/src/pages/Interview.jsx` |
| Streak and weekly activity | `frontend/src/utils/progressStats.js`, `pages/Dashboard.jsx` |
| Score delta | `frontend/src/pages/Report.jsx` |
| Queue export/import/reset | `frontend/src/utils/spacedRepetition.js`, `pages/Practice.jsx` |
| Server-side queue | `PracticeItem`, `PracticeItemRepository`, `PracticeScheduler`, `PracticeController`; sync in `pages/Practice.jsx` and both dashboards |
| PDF/DOCX resumes | `ResumeTextExtractor` (PDFBox + DOCX zip reader), `ResumeController`, `pages/Resumes.jsx` |
| Calendar and email reminders | `frontend/src/utils/reminders.js`, `pages/Practice.jsx` |
| WCAG pass | `Profile.jsx` labels, `VoicePlayer.jsx` names, report contrast tokens, interview mode contrast |
| Tests | `utils/answerInsights.test.js`, `drafts.test.js`, `progressStats.test.js`, `spacedRepetition.test.js` |

## Next, in order of real-world value

1. **Streaming rubric feedback** so the 20–30 s evaluation becomes progressive.
   This needs token streaming from the AI provider plus an SSE proxy in the
   backend; the current call is bounded and already shows a pending state.
2. **Server-side email delivery** (the current reminder opens the user's mail
   client; calendar export is the reliable path without SMTP credentials).
3. **A manual screen-reader pass** and contrast tokens shared across the studio
   and classic shells (the automated WCAG A/AA run is clean on six key pages).
4. **Question-level adaptive drills** that pull the exact past question into a
   new session, instead of practising it from the report snapshot.
5. **A real benchmark with labelled answers** so the rubric can be compared to
   human raters instead of only checked for internal consistency.
