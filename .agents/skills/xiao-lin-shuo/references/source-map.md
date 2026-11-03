# Source Map

Use this file to locate lawful source material and choose the right acquisition path. This reference is about finding and organizing sources, not about copying full scripts into the public skill.

## Official and Quasi-Official Paths

1. Xiao Lin Shuo podcast pages on Xiaoyuzhou provide episode descriptions, chapter markers, and repeated guidance: watch video on Bilibili by searching `小Lin说`, and find graphic/text versions by searching WeChat public account `小Lin说的公众号`.
2. The YouTube channel `@xiao_lin_shuo` is useful for public metadata, subtitles, and cross-platform title matching.
3. WeChat public posts are the strongest candidate for original graphic/text versions, but access and redistribution are separate questions. Index links and analyze privately; do not package full post text in this public skill.
4. Bilibili is the preferred video search path for Chinese users and may expose subtitles through platform/player data depending on login and availability.

## Search Recipes

Use exact titles whenever possible:

```text
小Lin说的公众号 <视频标题>
site:mp.weixin.qq.com 小Lin说 <视频标题>
site:bilibili.com/video 小Lin说 <视频标题>
site:youtube.com/watch 小Lin说 <视频标题>
小Lin说 <视频标题> 逐字稿
小Lin说 <视频标题> 文稿
小Lin说 图文版
```

## GitHub Projects and Tools

- `yt-dlp` for public metadata and subtitle discovery/export. Prefer `--skip-download` for corpus work.
  - Metadata: `yt-dlp --flat-playlist --dump-single-json "https://www.youtube.com/@xiao_lin_shuo/videos"`
  - Subtitles: `yt-dlp --list-subs URL`
  - Subtitle export: `yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "zh.*,en.*" --sub-format json3 URL`
- `youtube-transcript-api` for available YouTube transcripts without a browser.
- `SocialSisterYi/bilibili-API-collect` for Bilibili API field references.
- `Nemo2011/bilibili-api` for Python-side Bilibili API experimentation when the user has a compliant authenticated workflow.

## Rights Status Rules

- `official_public_link`: keep title, URL, metadata, and your own analysis.
- `platform_subtitle_user_access`: use for local analysis; do not redistribute full subtitle text.
- `user_provided`: analyze in the current task; ask before saving to a reusable corpus.
- `permission_granted`: can be packaged only if permission terms allow it.
- `unknown_do_not_redistribute`: index lightly or skip.

## Current Public Index

See `references/corpus-index.csv`. It contains a starter YouTube metadata index generated from the official channel with `scripts/build_corpus_index.py`. Update it regularly instead of hardcoding source lists in `SKILL.md`.
