# 08 · 两档制作：基础档（0 积分）/ 增强档（按镜头挑）

用户定的原则：**能用代码做的都用代码做，生成模型只补代码做不好的镜头**（图用 `qwen-image-3.0` 0.18 元/张，视频用 H3 15s 工作流 0.05 元/秒）；配音一律用小米 MiMo（当前限免，不花钱）。
每期在确认 1（选题）时就问清楚做哪一档；增强档在确认 2 之前列出「增强镜头清单 + 预估金额」。

## 基础档 · 0 积分

| 层 | 用什么 |
|---|---|
| 旁白 | 小米 MiMo 克隆音色（用户本人，voice/host-ref.wav）+ voice_post.py 人声后期 |
| 画面主体 | **Opus 直接写 SVG 插画**（扁平矢量人物 / 建筑 / 器物 / 地图轮廓），用 `layers` 分远中近三层做视差推移；cine 的粒子、3D 镜头、着色器（Particles、Tunnel、Liquid…）做抽象概念 |
| 数据与信息 | know.js：counter、bars、spread、trail、vquote、keyword、chapter、foot |
| 配乐 | **默认：skill 自带 vibe-bgm**（`tools/fit_bgm.py <out.wav> --lesson <期目录>` 按片长按小节裁剪，两档通用）；需要换曲时才用 promo-video 曲库（`python3.12 ~/.claude/skills/promo-video/scripts/pick_music.py <out.wav> --mood … --seconds … --hit-at <片名秒>`，需要 numpy，用 python3.12 跑）；或 cine 的 bed.py 按 sections 合成 |
| 音效 | cine 内置（slam whoosh riser impact chime tick shutter card …，写进 sfx） |
| 素材 | 公有领域 / CC 素材（Wikimedia Commons 古画、古籍书影、NASA 图）可以用，署名写进片尾和 facts.md；不用来路不明的图 |

**基础档怎么做到精品**：
- 每个场景至少三层 SVG（远景剪影、中景主体、前景遮挡物），推移时有景深。
- 人物用「几何化无五官」造型（Iwanau 那种），Opus 画得稳、整期统一，也没有肖像风险。
- 每章一个「代码王炸」镜头：粒子聚字、光点变形、地图扩散、3D 镜头穿梭，代替增强档的动态镜头。
- 色板严格按视觉系统（03-visual-systems.md），颗粒和暗角统一由 `bg()` 控制。

## 增强档 · 按镜头挑，金额可控

**判断哪些镜头值得用生成模型**（满足任意一条）：
1. 写实场景代码画不出来：历史现场、自然现象（雷暴、洪水、星云）、真实材质（青铜、丝绸、古籍纸纹）。
2. 全片最需要被记住的 1–3 个时刻：冷开场、反转、高潮。
3. 需要真实运动：人群、水流、火、机械运转。

其余镜头（数据、地图、文字、图表、抽象概念、示意动画）**仍用代码**。

| 增强等级 | 内容 | 预估金额 |
|---|---|---|
| 轻 | 3–8 张 qwen-image-3.0 配图 + 代码音效（配乐用默认 BGM） | ≈ 0.6–1.5 元 |
| 标准 | 6–10 张配图 + 2 条 H3 15s 动态镜头（首帧用配图）+ 代码音效 | ≈ 2.6–3.3 元 |
| 旗舰 | 10–14 张配图 + 4 条 H3 15s 动态镜头 + 少量 ElevenLabs 音效 | ≈ 4.8–6 元 |

单价见 04-renoise.md（qwen-image-3.0 0.18 元/张、`minimax_h3_image_audio_to_video_v2_15s` 0.05 元/秒 = 15 秒 0.75 元、vibe-bgm 0 元）。
每次生成前照常报价、等用户确认；生成的图和视频优先放在已经用代码搭好的镜头里「替换底图」，不改镜头结构，这样增强档和基础档可以共用同一份 film.js（`const ENH = true` 时用 plate/vclip，否则用 layers）。

## 一份 film.js 两档通用的写法

```js
const ENH = false;   // 增强档改成 true（assets/ 里有对应文件）
const scene01 = (s) => ENH
  ? plate(s, { src: A("img/a01.jpg") })                                   // qwen-image-3.0 配图
  : layers(s, [{ svg: SVG_SKY, depth: 0.15 }, { svg: SVG_PALACE, depth: 0.5 }, { svg: SVG_FG, depth: 1 }]);   // Opus 手画三层
// render 里两者的 update 签名一样：x.update(t, t0, t1, { … })
```
