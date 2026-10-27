"""Self-check for the benchmark's ranking maths. Run: python bench/test_bench.py"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from run import observations, rank, spearman  # noqa: E402


def test_rank_uses_ties_average():
    assert rank([10, 20, 20, 30]) == [1.0, 2.5, 2.5, 4.0]


def test_spearman_on_perfect_and_inverse_order():
    assert round(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 6) == 1.0
    assert round(spearman([1, 2, 3, 4], [40, 30, 20, 10]), 6) == -1.0
    assert spearman([1], [1]) is None


def test_short_heuristic_answers_are_called_out():
    rows = [{"id": "a", "answer": "I am not sure."}, {"id": "b", "answer": "x " * 40}]
    results = [{"id": "a", "mean": 50, "mode": "heuristic"},
               {"id": "b", "mean": 80, "mode": "heuristic"}]
    text = "\n".join(observations(rows, results))
    assert "`a` 50 (4 words)" in text
    assert "heuristic fallback" in text
    assert "50–80" in text


if __name__ == "__main__":
    test_rank_uses_ties_average()
    test_spearman_on_perfect_and_inverse_order()
    test_short_heuristic_answers_are_called_out()
    print("bench self-check ok")
