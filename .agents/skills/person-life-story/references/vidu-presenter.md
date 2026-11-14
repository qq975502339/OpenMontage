# Vidu S2-Avatar 非实时版数字主持人

主持人开场与收尾默认走 Vidu S2 非实时版：工具注册表中的 `vidu_s2_avatar`（provider `vidu`），密钥 `VIDU_API_KEY`。AutoDL H3 的 `autodl_comfyui_video` 是备用路径，只在 Vidu 不可用、积分不足（低于 45 分）、用户明确指定 AutoDL，或需要逐镜约束镜头与人体时使用，切换前告知用户并记录原因。

接口文档：https://platform.vidu.cn/vidu-stream/doc/s2-avatar/async/introduction 、https://platform.vidu.cn/vidu-stream/doc/s2-avatar/async/parameters

## 适用判断

- 主持人开场与收尾默认用本路径：形象已由一张单人角色图固定，不需要写提示词，也不需要读 `h3-prompt-writing`。
- 需要控制镜头、表情、手部动作或人体姿态时，改用 AutoDL H3 image+audio 路径，按 [数字主持人生成](autodl-presenter.md) 执行。
- 第一人称人物片段不走本路径，只走 AutoDL H3。
- 切换路径前告知用户并记录决定。

## 调用参数

| 参数 | 说明 |
|---|---|
| `image` | 必填。公网 URL、`data:` base64 或本地文件路径；仅 1 张单人图，全身/半身均可 |
| `audio` | 音频：URL、base64 或本地路径。与 `text` 至少传一个，都传时以 `audio` 为准 |
| `text` | 说话文本，仅在未传 `audio` 时生效，≤ 10000 字符 |
| `voice` | 文本模式音色，传 `audio` 时无效 |
| `timeline` | 动作时间轴 `[{text, time_range: [start, end]}]` 或 JSON 字符串；不传时按音频自动生成 |
| `resolution` | `720p`（默认）/ `1080p` / `2k` |
| `watermark` | 是否另出带水印版本；工具始终下载无水印的 `creations[].url` |
| `payload` | 透传标记，例如工程 id |
| `output_path` | 下载保存路径，写进工程目录 |
| `poll_interval_seconds` | 轮询间隔，默认 4 秒，不得低于 2 秒 |
| `timeout_seconds` | 墙钟超时，默认 300 秒 |

## 制作要点

1. **配音先行**。主持人与主线旁白按 [Token Plan 图片与配音](token-plan-media.md) 用 `token_plan_tts` 生成 `.mp3`，再把对应段落音频作为 `audio` 传入，保证全片音色一致。不要用 `text` 模式让 Vidu 另配声音，除非用户明确要求。
2. **形象与声音固定**。开场与收尾始终使用同一张角色图、同一段音色；跨片段不得更换角色图后声称是同一个人。
3. **片段长度**。时长由音频实际长度决定，不是申请值；开场与收尾按实际文件时长排布，出镜总时长由内容决定，不设固定比例。
4. **素材可访问性**。本地图片和音频会被自动编码为 base64，解码后上限 20 MB；更大的素材先上传为公网 URL。
5. **失败处理**。以 `err_code` 和 `err_msg` 判断：`ImageCheckFaceFailed`、`ImageCheckBodyJointsFailed`、`ImageObjectsUndetected`、`MultiFaceDetected` 换角色图；`CreditInsufficient` 充值；`TooManyRequests` 降低轮询频率。如实报告，不擅自换服务。
6. **生成物时效**。`creations[].url` 24 小时过期，工具会立即下载；进入合成前确认文件存在。
7. **计费**。1 积分/秒，1 积分 0.03125 元，余额低于 45 积分不能发起；记录 `task_id`、`duration`、`credits`。

## 验收

- 整段播放核对口型、台词与音色。
- `ffmpeg -i 片段 -vf fps=6` 抽帧检查人物一致性、颈部与下巴、肩部、衣物和背景；出现液化、融化、拉伸、穿模即重生成，不靠剪辑掩盖。
- 比对首帧与末帧的构图和背景，出现位移视为未满足锁定要求。

工具调用成功不等于质量通过，抽帧检查才是验收依据。
