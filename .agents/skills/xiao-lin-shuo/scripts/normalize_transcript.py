#!/usr/bin/env python3
"""Normalize subtitle or transcript text for local corpus analysis."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


TIMESTAMP_RE = re.compile(
    r"^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}[\.,]\d{1,3}\s*-->\s*(?:\d{1,2}:)?\d{1,2}:\d{2}[\.,]\d{1,3}.*$"
)
SRT_INDEX_RE = re.compile(r"^\s*\d+\s*$")
TAG_RE = re.compile(r"<[^>]+>")
VTT_META_RE = re.compile(r"^\s*(WEBVTT|Kind:|Language:|NOTE\b|STYLE\b|REGION\b).*$", re.I)


def extract_text_from_json(value: Any) -> list[str]:
    if isinstance(value, dict) and isinstance(value.get("events"), list):
        lines: list[str] = []
        for event in value["events"]:
            if not isinstance(event, dict):
                continue
            segments = event.get("segs") or []
            text = "".join(
                segment.get("utf8", "")
                for segment in segments
                if isinstance(segment, dict)
            ).strip()
            if text:
                lines.append(text)
        return lines
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        lines: list[str] = []
        for item in value:
            lines.extend(extract_text_from_json(item))
        return lines
    if isinstance(value, dict):
        for key in ("text", "content", "line", "subtitle", "body"):
            if key in value:
                return extract_text_from_json(value[key])
        lines = []
        for item in value.values():
            lines.extend(extract_text_from_json(item))
        return lines
    return []


def read_input(path: Path) -> str:
    raw = path.read_text(encoding="utf-8-sig")
    if path.suffix.lower() in {".json", ".json3"}:
        try:
            return "\n".join(extract_text_from_json(json.loads(raw)))
        except json.JSONDecodeError:
            return raw
    return raw


def normalize_text(raw: str) -> str:
    lines: list[str] = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        if TIMESTAMP_RE.match(line) or SRT_INDEX_RE.match(line) or VTT_META_RE.match(line):
            continue
        line = TAG_RE.sub("", line)
        line = re.sub(r"\{\\.*?\}", "", line)
        line = re.sub(r"\s+", " ", line).strip()
        if line:
            lines.append(line)

    paragraphs: list[str] = []
    buffer = ""
    sentence_end = set("。！？!?；;")
    for line in lines:
        if not buffer:
            buffer = line
        elif buffer[-1] in sentence_end:
            paragraphs.append(buffer)
            buffer = line
        elif len(buffer) >= 90:
            paragraphs.append(buffer)
            buffer = line
        else:
            joiner = "" if re.search(r"[\u4e00-\u9fff]$", buffer) else " "
            buffer += joiner + line
    if buffer:
        paragraphs.append(buffer)

    text = "\n".join(paragraphs)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize local subtitle/transcript files.")
    parser.add_argument("input", type=Path, help="Input .srt, .vtt, .txt, .md, or .json file")
    parser.add_argument("-o", "--output", type=Path, help="Output text file; defaults to stdout")
    args = parser.parse_args()

    normalized = normalize_text(read_input(args.input))
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(normalized, encoding="utf-8")
    else:
        print(normalized, end="")


if __name__ == "__main__":
    main()
