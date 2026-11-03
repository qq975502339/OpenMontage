#!/usr/bin/env python3
"""Produce rough local metrics for an explainer draft or transcript."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


CONNECTORS = ["但是", "所以", "因为", "如果", "一旦", "结果", "反过来", "问题是", "关键是", "换句话说"]
MECHANISM_MARKERS = ["导致", "使得", "变成", "推动", "约束", "激励", "压力", "反馈", "成本", "风险", "信任", "指标"]
SPOKEN_MARKERS = ["你会发现", "你看", "其实", "简单说", "举个例子", "我们先", "别急", "说白了"]


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[。！？!?；;])\s*", text)
    sentences = [part.strip() for part in parts if part.strip()]
    if len(sentences) <= 1:
        return [line.strip() for line in text.splitlines() if line.strip()]
    return sentences


def count_terms(text: str, terms: list[str]) -> dict[str, int]:
    return {term: text.count(term) for term in terms if text.count(term)}


def analyze(text: str) -> dict[str, object]:
    sentences = split_sentences(text)
    cjk_chars = re.findall(r"[\u4e00-\u9fff]", text)
    question_count = len(re.findall(r"[？?]", text))
    paragraphs = [p for p in re.split(r"\n\s*\n|\n", text) if p.strip()]
    avg_sentence_chars = round(len(cjk_chars) / max(len(sentences), 1), 1)
    return {
        "char_count_cjk": len(cjk_chars),
        "paragraph_count": len(paragraphs),
        "sentence_count": len(sentences),
        "avg_sentence_chars": avg_sentence_chars,
        "question_count": question_count,
        "connector_counts": count_terms(text, CONNECTORS),
        "mechanism_marker_counts": count_terms(text, MECHANISM_MARKERS),
        "spoken_marker_counts": count_terms(text, SPOKEN_MARKERS),
        "heuristic_notes": [
            "If question_count is 0, the hook may not create enough curiosity.",
            "If mechanism markers are sparse, rebuild the causal chain before polishing voice.",
            "If avg_sentence_chars is high, split spoken delivery into shorter units.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze a local explainer draft/transcript.")
    parser.add_argument("input", type=Path, help="Input text file")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of Markdown")
    args = parser.parse_args()

    result = analyze(args.input.read_text(encoding="utf-8"))
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return

    print("# Explainer Text Metrics\n")
    for key, value in result.items():
        if key == "heuristic_notes":
            continue
        print(f"- {key}: {value}")
    print("\n## Heuristic Notes")
    for note in result["heuristic_notes"]:
        print(f"- {note}")


if __name__ == "__main__":
    main()
