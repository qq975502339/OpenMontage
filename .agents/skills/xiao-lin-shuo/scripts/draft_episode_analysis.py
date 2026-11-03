#!/usr/bin/env python3
"""Create an episode-analysis scaffold from a local transcript."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


SECTION_MARKERS = [
    "咱们今天",
    "首先",
    "其次",
    "再有",
    "好",
    "所以",
    "问题",
    "关键",
    "总之",
]


def load_lines(path: Path) -> list[str]:
    return [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def find_marker_lines(lines: list[str]) -> list[tuple[int, str, str]]:
    matches: list[tuple[int, str, str]] = []
    for idx, line in enumerate(lines, start=1):
        for marker in SECTION_MARKERS:
            if marker in line:
                matches.append((idx, marker, line[:90]))
                break
    return matches[:18]


def count_terms(text: str, terms: list[str]) -> list[str]:
    counts = [(term, text.count(term)) for term in terms]
    return [f"{term}: {count}" for term, count in counts if count]


def main() -> None:
    parser = argparse.ArgumentParser(description="Draft a public-safe episode analysis scaffold.")
    parser.add_argument("transcript", type=Path)
    parser.add_argument("--title", default="")
    parser.add_argument("--url", default="")
    parser.add_argument("-o", "--output", type=Path)
    args = parser.parse_args()

    lines = load_lines(args.transcript)
    text = "\n".join(lines)
    question_count = text.count("吗") + text.count("为什么") + text.count("怎么")
    mechanism_terms = count_terms(text, ["因为", "所以", "但是", "如果", "导致", "问题", "其实", "指标", "风险", "激励"])
    cjk_count = len(re.findall(r"[\u4e00-\u9fff]", text))

    md = [
        f"# Episode Analysis: {args.title or args.transcript.stem}",
        "",
        f"Source: {args.url or 'user-provided/local transcript'}",
        "Rights status: analysis only; do not paste the full transcript into public skill resources.",
        "",
        "## Observed Metrics",
        f"- Transcript lines: {len(lines)}",
        f"- Approx Chinese characters: {cjk_count}",
        f"- Question-marker count: {question_count}",
        f"- Frequent mechanism terms: {', '.join(mechanism_terms) if mechanism_terms else 'none detected'}",
        "",
        "## Candidate Structure Markers",
    ]
    for idx, marker, snippet in find_marker_lines(lines):
        md.append(f"- Line {idx}: `{marker}` -> {snippet}")
    md.extend(
        [
            "",
            "## Fill These Fields",
            "- One-sentence promise:",
            "- Hook type:",
            "- Surface question:",
            "- Hidden variable:",
            "- Mechanism chain:",
            "- Evidence pattern:",
            "- Analogy or scene pattern:",
            "- Ending reversal:",
            "- Reusable lessons for rewriting user drafts:",
        ]
    )
    output = "\n".join(md) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")


if __name__ == "__main__":
    main()
