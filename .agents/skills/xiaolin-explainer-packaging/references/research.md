# 资料检索

包装画面上的数字、图表、原文、照片都要先查到、存进事实文件，再写分镜。查不到的东西不上屏。

## 什么时候查

1. 规划场景时，场景表加一列"需要的资料"（按下表填）。
2. 写分镜前，按这一列逐条查，结果写进事实文件（模板 `templates/facts_template.md`）。
3. 回改场景表：找不到逐字原文，就不用 `docpage`；凑不齐同口径数据，就不用 `paper`，改用 `bignum` 或 `wall`。
4. 台词里说到的数字也要在事实文件里。台词和画面的数字必须一致。

## 每种版式要查什么

| 版式 | 要查到的资料 | 最低要求 |
|---|---|---|
| `bignum` | 1 个关键数字、单位、口径、年份 | 一手来源或权威转述。推算值上屏写"约"或"推算" |
| `paper` | 3–8 个数据点（时间序列或横向对比） | 同一来源、同一口径、同一单位。`src` 行写来源 |
| `docpage` | 原文 2–6 句，包含要高亮的句子 | 逐字复制，不改写。记文件名、章节或条款、发布日期。外文原文直接上外文，中文放字幕 |
| `ent6` | 每个实体的中英文名和 1 个标签事实 | 国旗只有 `cl` `cn` `de` `fr` `jp` `us` |
| `formula6` `ui` | 计算规则和输入值 | 规则来自正式文件（如计发办法）。算例自己算，算式写进事实文件 |
| `photo`、`dark` 照片底 | 人物、历史场景、地点照片 | 公有领域、CC0、CC BY、CC BY-SA。用 `scripts/commons_photo.py` |
| `broll` | 氛围画面 | 优先用 AI 生成。不要生成真实事件或真实人物的"证据照片" |
| `comment` `bubble` | 观众的典型想法 | 不搬真实用户的昵称、头像和原话。用虚构昵称和概括的说法 |
| `titlecard` 章节卡 | 不需要 | — |

## 来源分级

| 级别 | 例子 | 能否上屏 |
|---|---|---|
| 一手 | 统计公报和年鉴、政府文件原文、法律条文、央行和监管机构报告、公司财报和公告、国际组织数据库 | 能 |
| 权威转述 | 新华网、人民网、经济日报、Reuters、Bloomberg、FT 引用的一手数据 | 能，事实文件标"权威转述"。能找到一手来源时换成一手 |
| 推算 | 用一手数据自己算出的值（人均、比值、复利） | 能，上屏写"约"或"推算"，算式写进事实文件 |
| 线索 | 自媒体、百科、论坛、AI 回答 | 不能。只用来找一手来源；找不到就标"未验证"，不上屏 |

## 去哪里查

- 中国：国家统计局（统计公报、年鉴）、各部委年度统计公报、中国政府网政策文件库、国家法律法规数据库、人民银行和证监会网站、上交所和港交所公告。
- 部委网站打不开或 PDF 链接是裸 IP 时，搜文件全名，地方政府网站常有全文转载。转载页要核对文号和发布日期。
- 海外：各国统计局和官方报告（例：美国社保受托人报告的 Highlights 页）、World Bank、IMF、OECD 数据和报告、SEC EDGAR 财报。
- 如果环境里有 `data-api` skill，World Bank 指标、股价和公司财务、SEC 文件优先用它，不要抓网页。题目大、要查的东西多时，如果环境里有 `deep-research` skill，按它的方法查。
- 先搜索，再打开原页面或 PDF 读原文。不要只看搜索摘要。

## 规则

- 上屏数字和原文数字一致。万、亿、百分点的换算写进事实文件。
- 先确认有没有更新年份的数据，用最新已发布的。还没发布的数据不说（例：截至 10 月未公布的年度调整幅度，台词不提）。
- 事实文件记两个日期：来源的发布日期和查阅日期。
- `docpage` 只放逐字原文。摘录可以从句子中间截断，但不能改字、不能拼接不同段落。来源是网页时，优先用 `webshot` 真实截图；`docpage` 留给 PDF、纸质文件和截图看不清的长文。
- 为了演示版式而用的假数据，`src` 行必须写"示意数据"或"演示数据"。
- 不同来源数字冲突时，用一手来源，并在事实文件写明差异。

## 真实素材：网页截图和 Logo

小Lin说的画面里，报道、报告、产品页面都是真实截图，品牌用真实 Logo。来源是网页时，按下面的方法拿真实画面，不要自己重排。

**网页截图**（`scripts/web_shot.mjs`，用 Remotion 自带的无头 Chrome，不需要另装）：

```bash
node <skill>/scripts/web_shot.mjs "<url>" public/shots/<名字>.png --w 1440 --h 1500 --wait 9 \
     --boxes "要高亮的原文短语||另一句||css:img.chart"          # 写出 <png>.boxes.json，供 add_web 的 marks 用
# 常用选项：--full 3600（往下多拍，整页长图）  --scroll "text:某句原文"（把这句滚到视窗中间）
#          --blur "article img, figure img"（模糊图片社照片）  --hide "<css>"  --port 9353（并行拍时各用一个端口）
```

- `--boxes` 里的短语要和页面原文逐字一致（引号、空格容错）。拍完看输出的 `box` 行，`MISSING` 就换短语或换截图位置。
- 有的页面正文在内部滚动容器里（如安天报告页），`--full` 不生效，用 `--scroll "text:…"` 把要用的段落滚进视窗。
- 时点要对：台词说的是某个时间的数字（例："2800 多个"），去拍当时的版本。GitHub 用历史提交的 blob 页面（`/blob/<提交>/README.md`，用 API 列出该文件的提交，逐个取 raw 文件找到那个数字）；其他网站用 Wayback（`web.archive.org/web/<时间戳>if_/<url>`）。单页应用（React 等）的 Wayback 存档常常是空白，拍出来空白就放弃截图，换别的画法。
- 截图里的新闻图片社照片（图注写 Getty、AP、Reuters、视觉中国等）用 `--blur` 模糊，只用页面文字。作者小头像、网站自己的界面可以保留。
- 事实文件写：页面地址、拍摄日期、历史版本号或存档时间戳、高亮的原文。

**视频**（实拍、录屏、产品演示）：

- 可以用：Wikimedia Commons 的视频（`filetype:video`，许可同照片的规则）；美国联邦政府机构（NASA 等）的公有领域视频；用户自己的录屏和实拍；明确写了可以转载的官方素材。放进 `public/broll/`，用 `broll` 背景或画中画。
- 不能用：YouTube、X、B 站等平台上别人的视频，包括产品官方的演示视频，除非页面写明了许可。
- 找不到可以用的视频时，用 `webshot` 加 `sy` 滚动关键帧，做出"翻阅真实页面"的录屏感，并在交付说明里写明没有放视频的原因。

**Logo**（`scripts/commons_logo.py`，从 Wikimedia Commons 取，SVG 由 Commons 渲染成 PNG，许可写进 `CREDITS.txt`）：

```bash
python3 <skill>/scripts/commons_logo.py public/logos "WhatsApp=File:WhatsApp.svg" "Slack=File:Slack icon 2019.svg" "Teams=Microsoft Teams"
```

- 写 `File:` 精确标题最稳；只写名称时按名称搜索，结果要目检（可能拿到白色字标、旧版 Logo 或粗糙的简化版）。
- Commons 上没有合适的，用 Simple Icons（CC0 品牌图标库）：`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/<名字>.svg` 是单色路径，填上它元数据里的官方品牌色（`data/simple-icons.json` 的 `hex`）。它自己的 CDN（cdn.simpleicons.org）会被 Cloudflare 拦。
- 还没有的，去品牌官网的 press kit / brand 页下载官方文件。

## 图片权利

- 只用公有领域、CC0、CC BY、CC BY-SA。NC（非商用）和 ND（禁止改编）都不用，因为包装会裁切、调色、加字。
- CC BY 和 CC BY-SA 要署名。把 `commons_photo.py` 生成的署名写进事实文件，再放上屏：照片卡用 `photo` 的 `credit='图：…'`；整屏照片底或 `broll` 用屏幕层小字 `sc.add('txt', t0, layer='screen', x=960, y=1058, txt='背景图：…', size=17, font='heavy', color='rgba(255,255,255,.6)', glow=False, anim='fade')`。屏幕底部正中在字幕下方，三种画中画都挡不到。
- CC 许可只管照片的版权，不管画面里的商标和人物肖像权。
- Logo 即使是公有领域文件，仍然是商标。只在讲到这个产品时用来指代它（指称性使用）；不改色、不变形，不排成暗示合作或背书的样子，不放在片名和片尾当装饰。来源写进 `public/logos/CREDITS.txt`。
- 新闻图片社的照片（Getty、视觉中国、AP、Reuters）、其他视频的截图、她本人原片的画面，都不能用。网页截图里出现这类照片时用 `web_shot.mjs --blur` 模糊。

```bash
python3 <skill>/scripts/commons_photo.py search "Otto von Bismarck portrait" --n 6   # 英文关键词结果更多
python3 <skill>/scripts/commons_photo.py get "File:<标题>.jpg" public/photos/bismarck.jpg --width 2000
```

`get` 会同时写 `<文件>.json`（许可、作者、页面、署名）。Commons 可能返回接近 `--width` 的标准尺寸。
