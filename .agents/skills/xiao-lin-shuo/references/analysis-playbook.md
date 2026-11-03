# Episode Analysis Playbook

Use this when analyzing a supplied Xiao Lin Shuo transcript, subtitle, article, or a user's own explainer draft.

## Public-Safe Rule

The reusable resource should contain analysis, not the full source. Keep:

- Source title and link.
- Rights status.
- Topic, hook type, hidden variable, mechanism chain.
- Section map, evidence pattern, analogy pattern, ending move.
- Transferable lessons for rewriting user drafts.

Do not keep long excerpts, full subtitles, or full article text in public resources.

## Step-by-Step Workflow

1. Normalize the transcript:

```bash
python3 scripts/normalize_transcript.py raw-subtitle.json3 -o normalized/title.txt
```

2. Generate rough metrics:

```bash
python3 scripts/analyze_explainer_text.py normalized/title.txt --json
```

3. Draft a scaffold:

```bash
python3 scripts/draft_episode_analysis.py normalized/title.txt --title "..." --url "..." -o analysis/title.md
```

4. Fill the high-value fields manually:
   - One-sentence promise: what the viewer will understand.
   - Hook type: contradiction, current event pile-up, founder scene, historical mystery, or market accident.
   - Surface question: what the audience thinks the video answers.
   - Hidden variable: the causal lens that reorganizes the topic.
   - Mechanism chain: 3-7 linked steps.
   - Evidence pattern: data chart, timeline, cases, institutional rules, interview, or comparison.
   - Analogy pattern: everyday scene used to lower cognitive load.
   - Ending reversal: what the opening question becomes after the mechanism is known.
   - Reusable lessons: what to copy structurally, not verbally.

## Analysis Template

```markdown
# <Episode Title>

Source:
Corpus status:

## One-Sentence Promise
## Hook Type
## Surface Question
## Hidden Variable
## Mechanism Chain
## Section Map
## Evidence Pattern
## Analogy or Scene Pattern
## Ending Reversal
## Reusable Lessons
## What Not to Copy
```

## Pattern Checklist

- Does the opening create a puzzle within 30-90 seconds?
- Does the topic move from a visible symptom to a hidden mechanism?
- Does each concept arrive after a need has been created?
- Are examples doing explanatory work rather than decorating?
- Does the ending reframe the starting question?
- Is uncertainty marked when the evidence is estimated, contested, or current?
