---
name: person-life-story
description: 制作以大头剪贴讲述人物一生、适时插入第一人称人物片段及数字主持人首尾的竖屏视频。
---

# 人物一生故事

视频采用 9:16 竖屏：主持人开场提出问题；大头剪贴作为贯穿人物一生的叙事主线；在适合人物亲自表达的关键时刻插入第一人称人物片段，再回到剪贴故事继续讲述；最后由主持人收尾。第一人称片段可以插入一次或多次，位置和长度根据故事决定，不按固定间隔切换。每次插入必须对应主线中的具体事件、人生阶段和人物处境，承接前一段并在结束后回到相应故事节点。主持人开场与收尾使用同一形象和声音，出镜时长由内容决定，不设固定比例。

建议按人物一生的重要阶段规划画面与台词，明确每次第一人称片段的插入点、返回主线的位置及目的；完整视频时长依题目和用户要求安排。遵循项目的视频制作流程。

## 人物图片与配音

阅读 [Token Plan 图片与配音](references/token-plan-media.md)。使用 Token Plan 的 `token_plan_image`（`qwen-image-3.0-pro`）准备人物图，使用 `token_plan_tts`（`qwen-audio-3.0-tts-plus`）制作配音。主持人口播及大头剪贴主线旁白默认使用 `longanlingxin`；第一人称人物的音色按角色和当次制作需要决定。用户提供录音或明确指定其他配音时按用户要求执行。分别检查图片和声音，再按实际可访问性准备 H3 输入；用户另有明确要求时优先遵循。

## 数字主持人

主持人开场与收尾默认先用 Vidu S2 非实时版；只有 Vidu 不可用、积分不足（低于 45 分）、用户明确指定 AutoDL，或需要逐镜约束镜头与人体时才改用 AutoDL H3，切换前告知用户并记录原因：

- **默认路径：Vidu S2 非实时版**：`vidu_s2_avatar`（`VIDU_API_KEY`），一张单人角色图加音频或文本，不需要写提示词。先读 [Vidu 数字主持人](references/vidu-presenter.md)。
- **备用路径：AutoDL H3**：`autodl_comfyui_video` 的 `minimax_h3_image_audio_to_video_v2_15s` 工作流，每段 5–15 秒，可逐段约束镜头与人体。先读 [数字主持人生成](references/autodl-presenter.md)。

两条路径都要求固定人物形象与声音，主持人出镜时长由开场、收尾内容决定，不设固定比例。走 AutoDL 路径时，每次编写或修改提示词前阅读项目的 `.agents/skills/h3-prompt-writing/SKILL.md` 和对应输入模式参考资料；Vidu 路径不使用提示词，不适用该要求。逐段检查口型、人物一致性、镜头及颈部等部位的变形；不合格则调整或重生成。用户的明确要求优先。

## 大头剪贴故事

阅读 [故事模式](references/story-mode.md) 和 `vendor/bighead-collage/SKILL.md`，保留人物剪纸、小舞台、道具、动作、镜头和转场。运行 `node scripts/create-story.mjs <新工程目录>` 创建竖屏工程。素材应符合故事内容并核实来源和授权。生图默认调用项目已实现的 QIANWEN 生图 `token_plan_image`（`qwen-image-3.0-pro`），主角照片通过 `image` 或 `images` 传入作参考，按 `gen/` 的目标文件名保存后再抠图；内置 `vendor/bighead-collage/scripts/gen_image.py` 只在用户明确指定 codex/OpenAI 或 QIANWEN 不可用时使用。

## 人物第一人称故事

阅读 [第一人称故事](references/selfie-story.md)。第一人称人物片段只走 AutoDL H3：使用 `autodl_comfyui_video` 的 `minimax_h3_image_audio_to_video_v2_15s` 工作流，每个生成片段 5–15 秒，不使用 Vidu S2。先按角色和该段故事准备人物图与配音，固定同一角色可辨认的形象特征与选定声音，允许年龄和服饰按时间线合理变化。每次编写或修改 H3 提示词前，读取 `.agents/skills/h3-prompt-writing/SKILL.md` 及对应输入模式参考。逐段检查口型、人物一致性、镜头、颈部和身体等部位的变形；不合格则调整或重生成。镜头依故事选择，不套用主持人固定镜头约束；人物音色按制作时确定的角色需要选择。用户明确要求优先。

## 合成与检查

分别生成主持人、各段大头剪贴和第一人称片段，按分镜中的插入位置编排、渲染后，可按故事模式中的合成清单运行 `node scripts/assemble-story.mjs <清单.json> <新文件.mp4>`。该脚本硬切片段、混合指定音轨，不保留输入视频音频，不自动生成字幕或对齐旁白；核对最终音画同步、字幕和画幅。生成服务、参考素材访问和依赖是否可用需实际检查。
