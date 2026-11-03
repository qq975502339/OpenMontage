# Corpus Building

Use this when the user asks how to find, organize, or analyze original Xiao Lin Shuo scripts, subtitles, or reference materials.

## Policy

For public Skillhub or GitHub distribution, do not bundle unauthorized full scripts, subtitles, or long excerpts. Store only:

- Source index rows: title, URL, platform, date, topic, status, notes.
- High-level episode analysis: hook type, hidden variable, mechanism chain, evidence pattern, ending move.
- Short, legally safe excerpts only when necessary and allowed.

For a private local corpus, the user may provide files they are allowed to use. Analyze those files locally and avoid redistributing them.

## Source Tiers

1. Official or creator-controlled text, such as public posts from the Xiao Lin Shuo account or related official channels.
2. Platform-provided subtitles, downloaded according to platform rules and the user's access rights.
3. User-provided transcripts or notes.
4. Third-party reposts or fan transcripts. Treat as lower reliability and do not redistribute.

## Suggested Source Search

- 微信内搜索: `小Lin说的公众号` plus the exact video title.
- Web search: `小Lin说 视频标题 文稿`
- Web search: `site:mp.weixin.qq.com 小Lin说 视频标题`
- Bilibili search: `小Lin说 视频标题`
- YouTube search: `小Lin说 视频标题`

## Useful Projects and Tools

- `yt-dlp`: can list and download available subtitles from supported video sites.
  - Project: https://github.com/yt-dlp/yt-dlp
  - Typical command: `yt-dlp --list-subs URL`
  - Typical subtitle export: `yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "zh.*,en.*" --convert-subs srt URL`
- `youtube-transcript-api`: Python library for retrieving available YouTube transcripts.
  - Project: https://github.com/jdepoix/youtube-transcript-api
- `bilibili-API-collect`: community documentation for Bilibili APIs, including video/player data and subtitle-related fields.
  - Project: https://github.com/SocialSisterYi/bilibili-API-collect
- `bilibili-api`: Python package for Bilibili API experimentation when the user has a compliant authenticated workflow.
  - Project: https://github.com/Nemo2011/bilibili-api

## Local Corpus Layout

```text
corpus/
  raw/
    youtube/
    bilibili/
    wechat/
    user-provided/
  normalized/
  analyses/
  corpus-index.csv
```

## Corpus Index Columns

```csv
id,title,platform,url,date,topic,source_type,rights_status,has_subtitle,has_article,local_file,analysis_file,notes
```

Use `rights_status` values:

- `official_public_link`
- `platform_subtitle_user_access`
- `user_provided`
- `permission_granted`
- `unknown_do_not_redistribute`

## Episode Analysis Schema

```markdown
# Episode: <title>

Source: <URL>
Rights status: <status>

## One-Sentence Promise
## Hook Type
## Surface Question
## Hidden Variable
## Mechanism Chain
## Evidence Pattern
## Analogies or Scenes
## Ending Reversal
## Reusable Lessons
```

## Workflow

1. Build `corpus-index.csv` before collecting files.
2. Store raw files separately from normalized text.
3. Run `scripts/normalize_transcript.py` on subtitles or transcripts.
4. Run `scripts/analyze_explainer_text.py` to get rough metrics.
5. Run `scripts/draft_episode_analysis.py` to create a public-safe analysis scaffold.
6. Write a human-readable episode analysis. Do not paste full scripts into public references.
7. Update the skill's style profile only with generalized patterns observed across multiple episodes.

## YouTube Metadata Workflow

Use `yt-dlp` to create a starter source index without downloading videos:

```bash
yt-dlp --flat-playlist --dump-single-json "https://www.youtube.com/@xiao_lin_shuo/videos" > xiaolin-youtube-flat.json
python3 scripts/build_corpus_index.py xiaolin-youtube-flat.json -o references/corpus-index.csv
```

Then check subtitles episode by episode:

```bash
yt-dlp --list-subs "https://www.youtube.com/watch?v=<id>"
yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "zh.*,en.*" --sub-format json3 "https://www.youtube.com/watch?v=<id>"
python3 scripts/normalize_transcript.py "<id>.zh.json3" -o "normalized/<id>.txt"
python3 scripts/draft_episode_analysis.py "normalized/<id>.txt" --title "<title>" --url "https://www.youtube.com/watch?v=<id>"
```

## Bilibili Workflow

Bilibili source work has more variability because subtitle availability and API responses may depend on login, cookies, and platform changes.

Recommended path:

1. Search Bilibili for the exact title.
2. Save the video URL, BV id, title, uploader, and date in `corpus-index.csv`.
3. If platform subtitles are available through the player, export them according to the user's account permissions and platform rules.
4. If no subtitle is available, index the source and leave `has_subtitle=false`.
5. Do not scrape comments or account-gated content into a public skill.

## WeChat Text Workflow

WeChat public account posts may be closest to original graphic/text editions, but redistribution is sensitive.

Recommended path:

1. Search inside WeChat for `小Lin说的公众号` plus the exact episode title.
2. Save the public post link and title in `corpus-index.csv`.
3. If the user has permission, save the article in a private local corpus.
4. Public skill resources should keep only your analysis and a source pointer.
