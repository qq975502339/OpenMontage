# 华尔街财经与真人口播模式

用于用户选择华尔街视觉，或内容适合用华尔街财经画面、真实素材、关系和口播镜头时。保留原项目深蓝织物、金色数字与原版动作；个人组件与大头剪贴不被替换。`number`、`bars`、`chart` 与个人的大数字、柱状图和折线图同时保留，由助理根据文案、素材及用户要求选择。用户排除 wallstreet 的 `equation`、`title`、`flash`；生成工程不登记这三种场景。用户原来不接入 xiaolin v1.1 的决定不变。

可用场景：`number board discs versus flow network timeline person footage montage chart bars share ranking article frames desk popup cards3d custom change quote profile statement headlines compare stats agenda device map`；另有 `line`、`chain` 和 `host`。`custom` 是手写画面的入口，也不能用来绕过用户排除的场景。`device` 是该项目的设备展示能力，不是重新安装 xiaolin v1.1 的功能。

## 制作

1. 运行 `node scripts/create-wallstreet.mjs <尚不存在的工程目录>`。它使用技能自带的 `vendor/wallstreet-explainer` 创建工程，不覆盖现有目录。可用 `WALLSTREET_SKILL_PATH` 指向兼容原版。工程保留原作者 MIT 许可；素材和字体按各自许可处理。占位素材只供测试，正式成片必须替换。
2. 按事实核验、来源与许可、文案、镜头表、素材、旁白、时间线、画面和交付检查的流程制作。阅读 `vendor/wallstreet-explainer/SKILL.md`、`references/presenter.md`、`references/sourcing.md`、`kit/README.md`；其中与本清单或用户要求冲突的规则以本技能和用户要求为准。新闻、人物、数据、AI 示意及实拍素材应核对身份、事实、时间与许可。
3. 在工程里写 `script.json` 和 `film.js`，可用原项目 `timeline_stub.mjs` 生成估算时间线；正式配音或真人视频需按实际音频重新对齐并人工核查。使用原项目 `render.mjs` 的 `--check`、`--sheet`、`--stills`、`--video`。渲染依赖本地 Playwright 和浏览器，优先使用已有安装，可将 `PLAYWRIGHT_FROM` 指向已安装 Playwright 的 package.json；缺依赖时说明，不默默下载。原项目字体缺失时会回退系统字体，应说明对外观的影响。结构检查不能替代看图和听声音。
4. 组合个人图表时，可分别渲染片段，再用 `scripts/assemble-story.mjs` 拼接；也可先渲染个人画面，再运行 `node scripts/prepare-wallstreet-clip.mjs <华尔街工程> <素材名> <个人视频>`，转成 30fps 帧并登记，在华尔街工程中以 `footage` 的 `clip` 使用，也可配 `host:'window'` 或 `host:'pip'`。根据内容实际编排时序、画幅、裁切和转场。准备脚本不保留视频原音频；声音需另行混音。不要说成 React 组件已直接嵌入或图表会自动生成、自动同步。
5. 真人口播需要准备原始帧和时间线；必要时按原技能逐帧抠像。圆窗、竖窗和同屏展示可以不抠像，背景替换或身后挂图需要有效抠像。逐字对齐、视频检索和抠像可能需要额外依赖、模型或网络。确认素材身份、清晰度及授权。

以上是制作能力，不表示已对所有场景或环境完成端到端验证。最终检查首帧、文字边界、数据口径、字幕、声音、事实及镜头衔接。
