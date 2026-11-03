#!/usr/bin/env python3
"""Build a public-safe corpus index from yt-dlp flat playlist JSON."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any


FIELDS = [
    "id",
    "title",
    "platform",
    "url",
    "duration_seconds",
    "topic",
    "source_type",
    "rights_status",
    "has_subtitle",
    "has_article",
    "local_file",
    "analysis_file",
    "notes",
]


def topic_from_title(title: str) -> str:
    title_lower = title.lower()
    rules = [
        ("gdp", "macro-indicator"),
        ("stable", "crypto-finance"),
        ("期货", "financial-instrument"),
        ("上市", "capital-market"),
        ("ipo", "capital-market"),
        ("伊朗", "country-economy"),
        ("金融危机", "financial-crisis"),
        ("gold", "commodities"),
        ("silver", "commodities"),
        ("energy", "energy-geopolitics"),
        ("war", "geopolitics"),
        ("robot", "technology-economy"),
        ("betting", "behavioral-economy"),
    ]
    for marker, topic in rules:
        if marker in title_lower or marker in title:
            return topic
    return "to-classify"


def row_from_entry(entry: dict[str, Any]) -> dict[str, str]:
    video_id = str(entry.get("id") or "")
    url = entry.get("webpage_url") or entry.get("url") or ""
    if video_id and not str(url).startswith("http"):
        url = f"https://www.youtube.com/watch?v={video_id}"
    title = str(entry.get("title") or "").strip()
    return {
        "id": video_id,
        "title": title,
        "platform": "youtube",
        "url": str(url),
        "duration_seconds": str(int(entry.get("duration") or 0) or ""),
        "topic": topic_from_title(title),
        "source_type": "official_channel_metadata",
        "rights_status": "official_public_link",
        "has_subtitle": "unknown",
        "has_article": "unknown",
        "local_file": "",
        "analysis_file": "",
        "notes": "Populate subtitle/article status after source checks.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build corpus-index.csv from yt-dlp flat playlist JSON.")
    parser.add_argument("input_json", type=Path, help="yt-dlp --flat-playlist --dump-single-json output")
    parser.add_argument("-o", "--output", type=Path, required=True, help="Output CSV path")
    args = parser.parse_args()

    data = json.loads(args.input_json.read_text(encoding="utf-8"))
    rows = [row_from_entry(entry) for entry in data.get("entries", []) if isinstance(entry, dict)]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
