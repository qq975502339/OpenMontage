# Vidu S2-Avatar 非实时版数字主持人

需要数字主持人出镜、且形象已由一张角色图固定时，使用 OpenMontage 工具注册表中的 `vidu_s2_avatar`（provider `vidu`），密钥 `VIDU_API_KEY`。这是本技能生成数字主持人的默认路径；AutoDL H3 的 `autodl_comfyui_video` 是备用路径，只在 Vidu 不可用、积分不足（低于 45 分）、用户明确指定 AutoDL，或需要逐镜约束镜头与人体时使用，切换前告知用户并记录原因。

接口文档：https://platform.vidu.cn/vidu-stream/doc/s2-avatar/async/introduction 、https://platform.vidu.cn/vidu-stream/doc/s2-avatar/async/parameters

## 与 AutoDL H3 路径的区别

| 项目 | Vidu S2 非实时版 | AutoDL H3 image+audio |
|---|---|---|
| 输入 | 1 张单人角色图 + 音频（或文本） | 参考图 + 参考音频 + 逐段提示词 |
| 提示词 | 不需要写提示词，也不需要读 `h3-prompt-writing` | 每次编写或修改提示词前必须读 `h3-prompt-writing` |
| 镜头/人体约束 | 靠角色图与 `timeline` 动作时间段，不能逐镜约束镜头 | 靠提示词逐条写禁止项，可约束镜头与人体 |
| 片段时长 | 由音频长度决定；文本模式由合成语音长度决定 | 每段 5–15 秒 |
| 计费 | 1 积分/秒，1 积分 0.03125 元，余额低于 45 积分不能发起 | 按 AutoDL token 与工作统计费 |
| 出片耗时 | 文档实测约 40 秒–2 分钟 | 视工作流与分辨率 |

选择建议：默认走 Vidu；需要控制镜头、表情或人体姿态，已经有 H3 工作流与提示词资产，或 Vidu 积分不足时改走 AutoDL。切换前告知用户并记录决定。

## 调用参数

| 参数 | 说明 |
|---|---|
| `image` | 必填。公网 URL、`data:` base64 或本地文件路径。仅支持 1 张单人图，全身/半身、任意风格均可 |
| `audio` | 音频：URL、base64 或本地路径。与 `text` 至少传一个；两者都传时以 `audio` 为准 |
| `text` | 说话文本，仅在未传 `audio` 时生效，≤ 10000 字符，由服务合成语音 |
| `voice` | 文本模式的音色，传了 `audio` 时无效。音色列表见 https://platform.vidu.cn/vidu-stream/doc/voice-list |
| `timeline` | 动作时间轴：`[{text, time_range: [start, end]}]` 数组或其 JSON 字符串；不传时服务按音频自动生成 |
| `resolution` | `720p`（默认）/ `1080p` / `2k` |
| `watermark` | 是否另出带水印版本；工具始终下载无水印的 `creations[].url` |
| `payload` | 透传标记，例如工程 id |
| `output_path` | 下载保存路径，成片片段写进工程目录 |
| `poll_interval_seconds` | 轮询间隔，默认 4 秒，不得低于 2 秒 |
| `timeout_seconds` | 墙钟超时，默认 300 秒 |

## 制作要点

1. **配音先行**。本技能默认旁白仍由 Token Plan `token_plan_tts` 生成，按 [Token Plan 旁白](token-plan-narration.md) 分段产出 `.mp3`，再把对应分段的音频作为 `audio` 传入。这样音色与全片一致，跨片段也稳定；不要用 `text` 模式让 Vidu 另配一套声音，除非用户明确要求。
2. **形象固定**。同一形象始终使用同一张角色图；不要用不同图片生成多段后声称是同一个人。
3. **素材可访问性**。本地图片和音频会被工具自动编码为 base64，解码后上限 20 MB；更大的素材先上传为公网 URL 再传入。
4. **失败处理**。任务失败时以 `err_code` + `err_msg` 判断：`ImageCheckFaceFailed`、`ImageCheckBodyJointsFailed`、`ImageObjectsUndetected`、`MultiFaceDetected` 需换角色图；`CreditInsufficient` 需充值；`TooManyRequests` 需降低轮询频率。报告实际原因，不擅自换服务。
5. **生成物时效**。`creations[].url` 有效期 24 小时，工具会立即下载到 `output_path`，仍需在工程内确认文件存在再进入合成。
6. **时间线对齐**。片段时长由音频实际时长决定，不是申请值；合成时按实际文件时长排布，并按真实音频重新对齐字幕与分镜。

## 验收

- 整段播放，核对口型与台词是否逐句对齐，声音是否为预期音色。
- 抽帧检查（`ffmpeg -i 片段 -vf fps=6`）人物一致性、颈部与下巴、肩部、衣物、背景和构图是否稳定；出现液化、融化、拉伸、穿模即判不合格，重生成而不是靠剪辑掩盖。
- 比对首帧与末帧的构图和背景，出现位移视为未满足锁定要求。
- 记录 `task_id`、`duration`、`credits`，写入工程产物与决定记录。

模型输出是概率性的，工具调用成功不等于质量通过，抽帧检查才是验收依据。
