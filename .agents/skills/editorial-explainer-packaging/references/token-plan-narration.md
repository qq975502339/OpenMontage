# Token Plan 旁白

需要生成旁白时，使用项目工具注册表中的 `token_plan_tts`，模型 `qwen-audio-3.0-tts-plus`、音色 `longanlingxin`。使用项目中已有的 `QIANWEN_API_KEY` 配置；不要把密钥写入项目素材、命令、日志或对话。当前音色作为本技能生成旁白的默认，用户明确指定其他配音或提供录音时按用户要求处理。保留授权的真人口播原声，不自动替换。

## 生成和时间线

1. 先完成待配文案与分段。按项目生产流程检查 `token_plan_tts` 的可用性，说明服务、模型和费用；不可用时说明原因，不静默切换服务。把文案以 `text`、`voice: longanlingxin` 和项目内 `.mp3` 格式的 `output_path` 传给工具；需要分段时逐段生成并记录文本与对应文件。生成的素材路径、用量、时长以实际结果为准。
2. 播放并检查内容、声音、停顿和发音。以最终音频的实际时长安排镜头、字幕、音乐及音效；重新生成或剪辑配音后，必须重新对齐，不使用按字数估出的时间线冒充真实对齐。
3. **大头剪贴**：将 Token Plan 生成的正式旁白作为录音导入，按内置 `vendor/bighead-collage/scripts/voice_timeline.py` 的录音流程制作字级时间线，随后检查时间线。不要把该子项目的 edge-tts 默认误当成本技能的正式旁白。
4. **华尔街模式**：旁白按脚本句子分别准备，按内置 `vendor/wallstreet-explainer` 约定转换为 `voice/<id>.final.wav`，使用 `temp_voice.py <工程>/script.json --asr` 与实际正式配音重新对齐，并检查每句及原声插段。估算时间线或临时语音仅用于排版预览，不作为最终旁白。
5. **数字主持人**：把生成的对应段落音频用于按需生成流程；确认 AutoDL 能访问素材以及工作流字段符合实际要求，检查嘴型和声音。为避免重复配音，合成时依据实际片段音轨与时间线处理；`assemble-story.mjs` 不保留输入片段原音频，需显式混入所需音轨。

Token Plan 返回的音频链接可能过期，应及时保存到项目。工具通过模拟接口及此前另一音色的实际调用验证；`longanlingxin` 及跨引擎完整对齐仍需在实际制作中验证。官方参考：[语音合成](https://platform.qianwenai.com/docs/token-plan/best-practices/speech-synthesis)、[音色列表](https://platform.qianwenai.com/docs/developer-guides/speech/voice-list/qwen-audio-tts)。
