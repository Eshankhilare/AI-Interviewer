#!/usr/bin/env python3
"""Benchmark the answer evaluator against a labelled seed set.

Modes
  local  import the ai-service code and call EvaluationService directly
         (rubric evaluator when an LLM key is configured, heuristic otherwise)
  http   POST to a running AI service

Rows with an empty human_score are reported but excluded from the agreement
metrics. Nothing here invents a label: an unlabelled set prints "unlabelled"
and only the per-row scores.

Examples
  python bench/run.py --mode local
  python bench/run.py --mode http --url http://localhost:8001 --token "$AI_SERVICE_TOKEN"
  python bench/run.py --mode local --repeats 3 --out bench/RESULTS.md
"""

import argparse
import asyncio
import csv
import json
import os
import statistics
import sys
import urllib.error
import urllib.request
from pathlib import Path

BENCH_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = BENCH_DIR.parent / "ai-service"


def load_rows(path):
    with open(path, newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def rank(values):
    order = sorted(range(len(values)), key=lambda i: values[i])
    ranks = [0.0] * len(values)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and values[order[j + 1]] == values[order[i]]:
            j += 1
        average = (i + j) / 2 + 1
        for k in range(i, j + 1):
            ranks[order[k]] = average
        i = j + 1
    return ranks


def spearman(xs, ys):
    if len(xs) < 2:
        return None
    rx, ry = rank(xs), rank(ys)
    mx, my = statistics.mean(rx), statistics.mean(ry)
    numerator = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    denominator = (
        sum((a - mx) ** 2 for a in rx) ** 0.5 * sum((b - my) ** 2 for b in ry) ** 0.5
    )
    return numerator / denominator if denominator else None


class LocalEvaluator:
    label = "local EvaluationService"

    def __init__(self):
        sys.path.insert(0, str(AI_SERVICE_DIR))
        from app.services.evaluation_service import EvaluationService

        self.service = EvaluationService()
        self.mode = getattr(self.service, "mode", "unknown")
        self.has_key = bool(getattr(self.service, "api_key", ""))
        self.label = f"local EvaluationService (mode={self.mode}, llm_key={'yes' if self.has_key else 'no'})"

    async def evaluate(self, row):
        result = await self.service.evaluate(
            row["question"], row["answer"], row.get("expected_answer", ""))
        return int(result["score"]), result.get("evaluation_mode", self.mode)


class HttpEvaluator:
    def __init__(self, url, token):
        self.url = url.rstrip("/")
        self.token = token
        self.label = f"http {self.url}"

    async def evaluate(self, row):
        payload = json.dumps({
            "question": row["question"],
            "answer": row["answer"],
            "expected_answer": row.get("expected_answer", ""),
        }).encode()
        request = urllib.request.Request(
            self.url + "/ai/evaluate-answer",
            data=payload,
            headers={"Content-Type": "application/json",
                     **({"X-AI-Service-Token": self.token} if self.token else {})},
            method="POST",
        )
        loop = asyncio.get_running_loop()
        body = await loop.run_in_executor(None, self._send, request)
        result = json.loads(body)
        return int(result["score"]), result.get("evaluation_mode", "http")

    def _send(self, request):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read().decode()
        except urllib.error.HTTPError as error:
            raise RuntimeError(f"HTTP {error.code}: {error.read().decode()[:200]}")


async def run(rows, evaluator, repeats):
    results = []
    for row in rows:
        scores = []
        mode = None
        for _ in range(repeats):
            score, mode = await evaluator.evaluate(row)
            scores.append(score)
        human = row.get("human_score", "").strip()
        results.append({
            "id": row["id"],
            "scores": scores,
            "mean": round(statistics.mean(scores), 1),
            "spread": max(scores) - min(scores) if len(scores) > 1 else 0,
            "human": float(human) if human else None,
            "mode": mode,
        })
    return results


def summary(results, repeats):
    labelled = [r for r in results if r["human"] is not None]
    lines = []
    lines.append(f"- Answers evaluated: **{len(results)}**")
    lines.append(f"- Repeats per answer: **{repeats}**")
    lines.append(f"- Human-labelled answers: **{len(labelled)}** of {len(results)}")
    if repeats > 1:
        unstable = [r["id"] for r in results if r["spread"] > 0]
        lines.append(f"- Answers with a different score across repeats: **{len(unstable)}**"
                     + (f" ({', '.join(unstable)})" if unstable else ""))
    if not labelled:
        lines.append("")
        lines.append("> No human scores are filled in, so no agreement metric can be reported. "
                     "Fill `human_score` in `bench/answers.csv` and re-run.")
        return lines

    predicted = [r["mean"] for r in labelled]
    human = [r["human"] for r in labelled]
    mae = statistics.mean(abs(p - h) for p, h in zip(predicted, human))
    within_10 = 100 * sum(abs(p - h) <= 10 for p, h in zip(predicted, human)) / len(labelled)
    rho = spearman(predicted, human)
    lines.append("")
    lines.append("| Metric | Value |")
    lines.append("|---|---|")
    lines.append(f"| MAE (0-100 scale) | {mae:.1f} |")
    lines.append(f"| Within ±10 points | {within_10:.0f}% |")
    lines.append(f"| Spearman rank correlation | {rho:.2f} |" if rho is not None else "| Spearman | n/a |")
    return lines


def observations(rows, results):
    """Honest reading of what this run can and cannot show. Derived from the data."""
    lines = []
    modes = sorted({r["mode"] for r in results})
    scores = [r["mean"] for r in results]
    if scores:
        lines.append(f"- Score range across the set: **{min(scores)}–{max(scores)}** on a 0–100 scale.")
    words = {row["id"]: len(row.get("answer", "").split()) for row in rows}
    short = [r for r in results if words.get(r["id"], 999) < 20]
    if short:
        lines.append("- Short answers still scored well: " + ", ".join(
            f"`{r['id']}` {r['mean']} ({words[r['id']]} words)" for r in short)
            + ". Length is being rewarded, not correctness.")
    if modes == ["heuristic"]:
        lines.append("- Every score came from the **heuristic fallback**; no LLM key was configured, "
                     "so the rubric evaluator never ran. These numbers prove the pipeline works, "
                     "not that it grades like a human.")
        lines.append("- To benchmark the rubric path: set `LLM_API_KEY` (or `GEMINI_API_KEY`), "
                     "fill `human_score` in `bench/answers.csv`, then re-run.")
    elif "rubric" in modes:
        lines.append("- Scores came from the rubric evaluator: the model scores five criteria 0–10 "
                     "and the final number is computed in code.")
    if any(r.get("human") is None for r in results):
        lines.append("- Unlabelled answers are excluded from MAE, ±10 and Spearman, so no agreement "
                     "number is claimed for them.")
    return lines


def write_markdown(path, rows, results, evaluator, repeats):
    lines = [
        "# Evaluator benchmark results",
        "",
        f"- Evaluator: `{evaluator.label}`",
        f"- Seed set: `bench/answers.csv` ({len(rows)} answers)",
        f"- Generated by: `python bench/run.py --mode ... --repeats {repeats}`",
        "",
        "## Agreement",
        "",
    ]
    lines += summary(results, repeats)
    lines += ["", "## Per-answer scores", "",
              "| id | mean | repeats | spread | human | mode |", "|---|---|---|---|---|---|"]
    for r in results:
        human = "—" if r["human"] is None else f"{r['human']:.0f}"
        scores = ",".join(str(s) for s in r["scores"])
        lines.append(f"| {r['id']} | {r['mean']} | {scores} | {r['spread']} | {human} | {r['mode']} |")
    lines += ["", "## How to read this", ""]
    lines += observations(rows, results)
    lines.append("")
    Path(path).write_text("\n".join(lines), encoding="utf-8")


async def main_async(args):
    rows = load_rows(args.answers)
    if args.mode == "local":
        evaluator = LocalEvaluator()
    else:
        evaluator = HttpEvaluator(args.url, args.token or os.getenv("AI_SERVICE_TOKEN", ""))

    print(f"Evaluator: {evaluator.label}")
    results = await run(rows, evaluator, args.repeats)

    print(f"\n{'id':<20} {'mean':>5} {'spread':>6} {'human':>6}  mode")
    for r in results:
        human = "-" if r["human"] is None else f"{r['human']:.0f}"
        print(f"{r['id']:<20} {r['mean']:>5} {r['spread']:>6} {human:>6}  {r['mode']}")

    print("\nSummary")
    print("\n".join(summary(results, args.repeats)))

    if args.out:
        write_markdown(args.out, rows, results, evaluator, args.repeats)
        print(f"\nWrote {args.out}")
    if args.csv:
        with open(args.csv, "w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["id", "mean", "repeats", "spread", "human", "mode"])
            for r in results:
                writer.writerow([r["id"], r["mean"], " ".join(map(str, r["scores"])),
                                 r["spread"], r["human"] or "", r["mode"]])
        print(f"Wrote {args.csv}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--answers", default=str(BENCH_DIR / "answers.csv"))
    parser.add_argument("--mode", choices=["local", "http"], default="local")
    parser.add_argument("--url", default="http://localhost:8001")
    parser.add_argument("--token", default="")
    parser.add_argument("--repeats", type=int, default=1)
    parser.add_argument("--out", help="write a markdown report here")
    parser.add_argument("--csv", help="write per-answer scores here")
    args = parser.parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
