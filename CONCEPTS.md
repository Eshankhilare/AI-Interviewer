# Concepts borrowed from other interview tools

Research pass over public AI-interview products and open-source projects. Each
row is a concept that was actually implemented here, not a feature list copied
for its own sake.

| Source | Concept that mattered | Where it lives here |
|---|---|---|
| [Google Interview Warmup](https://grow.google/interview-warmup) | Most-used words (3+ repeats), talking points covered, job-related terms | `frontend/src/utils/answerInsights.js`; shown after an answer and in the report |
| [Yoodli](https://yoodli.ai/platform/ai-feedback) | Filler-word rate (3% guideline), speaking pace (130–170 wpm), clarity/structure | Same util: filler chips + pace band; pace only when a voice-clip duration exists |
| [InterviewStar AI](https://interviewstar-ai.com/) | STAR structure guidance for behavioural answers | STAR chips (Situation/Task/Action/Result) when the question is behavioural |
| [Interviewer.AI](https://interviewer.ai/how-it-works) / [Jobscan](https://www.jobscan.co/) | Resume ↔ job-description match with the terms the resume never mentions | `frontend/src/utils/roleMatch.js`; “Role fit” card on the resume step |
| [AI Interview Buddy](https://aiinterviewbuddy.com/) | Structured feedback on every answer, not just a final score | Existing rubric + per-question review; now also delivery insights per answer |
| [interviewKata](https://github.com/sdeonvacation/interviewKata) | A concrete next drill instead of a generic summary | “Your practice plan” on the report, derived from the weakest question and criteria |

## Deliberately not copied

- **Real-time answer copilots** (overlay tools that feed answers during a live
  interview). They are cheating aids, not practice, and would undermine the
  proctoring this app already does.
- **Opaque ATS/match scores presented as hiring probability.** The role-fit
  card is labelled keyword overlap and does not feed the interview score.
- **Audio/video ML for eye contact or emotion.** The deterministic counts here
  cannot be wrong; the existing browser-side pose panel remains optional.
- **Candidate stack-ranking.** This is a single-candidate practice tool, not a
  recruiter shortlist product.

## Ceilings

The insights are English keyword heuristics, not NLP. Filler detection omits
ambiguous words such as “like” and “right”; talking points are signals, not
judgements. The rule is the same as the rest of the app: show the count, never
invent a verdict.
