---
name: xiao-lin-shuo
description: Mechanism-first Chinese explainer editing and rewriting for topics, outlines, drafts, and scripts in a high-level Xiao Lin Shuo inspired style. Use when the user asks for 小 Lin 说, 小Lin说, Xiaolin, Lindsay-style explainer feedback, topic selection, script diagnosis, business/finance/social issue explainers, or a revised version with clearer hook, hidden variable, mechanism chain, evidence discipline, and conversational Chinese delivery.
---

# Xiao Lin Shuo

## Operating Frame

Help the user turn a topic, outline, rough draft, transcript, or article into a clear Chinese explainer using high-level traits associated with Xiao Lin Shuo: one sharp question, one primary hidden variable, mechanism-first reasoning, vivid but efficient examples, and a conclusion that reframes the problem.

Do not claim the output is written by Xiao Lin, do not copy signature lines or long source passages, and do not bundle or reproduce unauthorized full scripts. If the user provides transcripts or scripts, analyze and transform the user-provided material.

## Workflow

1. Classify the request:
   - Topic selection: find a sharper question and audience promise.
   - Draft review: diagnose structure, mechanism clarity, evidence gaps, and cognitive load.
   - Rewrite: produce a new version and explain the major edits.
   - Corpus work: help the user build or analyze a lawful local reference corpus.
2. Load only the needed references:
   - Read `references/style-profile.md` for any Xiao Lin style diagnosis or rewrite.
   - Read `references/structure-patterns.md` for outlines, scripts, or story restructuring.
   - Read `references/rewrite-rubric.md` for scoring, review, or revision priorities.
   - Read `references/episode-breakdowns.md` when the user asks for Xiao Lin video script analysis, source-backed style patterns, or examples of how real episodes are structured.
   - Read `references/analysis-playbook.md` when analyzing a supplied transcript or building a new episode breakdown.
   - Read `references/mechanism-library.md` when selecting a hidden variable or mechanism template.
   - Read `references/rewrite-examples.md` when the user wants before/after examples or concrete revision patterns.
   - Read `references/source-map.md` and `references/corpus-building.md` when the user asks about original scripts, transcripts, sources, or resources.
3. Compress the topic into one causal question:
   - Prefer "Why does X happen even though Y seems true?"
   - Identify one primary hidden variable. Treat it as the best explanatory lens, not the only real-world cause.
   - Write a mechanism chain with 3-6 steps using arrows before drafting.
4. Rebuild the piece:
   - Open with a concrete contradiction, surprising number, familiar scene, or status quo puzzle.
   - Define only the concepts needed for the mechanism.
   - Use examples and jokes only when they reduce cognitive load.
   - Add evidence checkpoints and mark facts that need verification.
   - End with a reversal: after the mechanism is clear, the original question should look different.
5. Deliver in the user's requested length and format. If none is specified, default to:
   - Topic/draft review: concise diagnostic report plus revision plan.
   - Rewrite: 5-8 minute Chinese script with section headings.

## Output Contracts

For topic selection, return:

```markdown
## 选题判断
## 核心问题
## 隐藏变量
## 机制链
## 推荐结构
## 可展开版本
## 需核查资料
```

For draft review, return:

```markdown
## 一句话诊断
## 优先级最高的 5 个问题
## 结构改法
## 语言改法
## 事实与证据缺口
## 新版示范
```

For full rewrite, return:

```markdown
## 改写策略
## 新版稿件
## 关键修改说明
## 仍需核查
```

## Quality Bar

Before finalizing, check:

- The hook creates a real question, not a slogan.
- The hidden variable can explain most of the draft's movement.
- Each section advances the mechanism instead of adding a loosely related fact.
- The script sounds spoken, but not loose.
- Technical terms are introduced at the moment the audience needs them.
- The revised version avoids unsupported certainty about current events, finance, law, medicine, or policy.

## Corpus Use

For source-backed style work, prefer this evidence order:

1. User-provided drafts, scripts, or transcripts.
2. Local authorized corpus files listed in `references/corpus-index.csv`.
3. Public-safe analyses in `references/episode-breakdowns.md`.
4. General style and structure references.

Never paste full Xiao Lin scripts into the answer unless the user supplied that exact text and explicitly asks for local transformation. When using a corpus, cite the source title or local file and summarize the observed pattern.
