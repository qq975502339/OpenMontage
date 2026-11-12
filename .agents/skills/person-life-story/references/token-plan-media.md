# Token Plan 人物图片与配音

按 OpenMontage 的项目流程和工具注册表使用 Token Plan 个人版。技能默认图片 `token_plan_image` / `qwen-image-3.0-pro`；配音使用 `token_plan_tts` / `qwen-audio-3.0-tts-plus`。主持人和大头剪贴主线旁白默认音色为 `longanlingxin`；第一人称人物的音色按角色与当次制作需要决定。不要把它与现有百炼 `dashscope_tts` 的模型和接口混用。个人版凭据使用 `QIANWEN_API_KEY`，由用户安全配置；不要把密钥放入技能、命令行参数、生成文件或日志。未配置或无权限时如实报告，不擅自替换服务。

## 实施顺序

1. 先确定故事节点、角色年龄、服装、场景、竖屏构图与口播台词。对于历史人物，生成图像仅为创作演绎，不声称还原真人。
2. 通过注册表调用 `token_plan_image`，传入 `prompt`、明确的项目内 `output_path` 和可选 `size`（格式 `宽*高`，须符合服务支持的尺寸）。检查人脸、姿态、服饰和构图，再保存选定参考。默认模型为 `qwen-image-3.0-pro`。
3. 通过注册表调用 `token_plan_tts`，传入 `text` 和项目内 `output_path`（`.mp3`）；生成后听取并检查台词、声音与实际时长。该工具使用模型 `qwen-audio-3.0-tts-plus`，输出 MP3。主持人和大头剪贴主线旁白默认使用 `longanlingxin`，保持开场、主线和收尾声音一致；用户提供录音或明确指定其他配音时按用户要求执行；第一人称角色依据人物年龄、性格、处境及故事选择合适音色，制作时向用户说明并确认，以 `voice` 参数传入所选音色。选择时核对所选音色与模型的兼容性，同一角色跨片段保持声音一致或按情节合理变化。
4. 生成图片和配音仅产生本地文件；向 AutoDL 传递前须使用已授权、工作流可访问的素材上传方式，确认可访问 URL、权限、有效期和字段。不得把本地路径或仅供本机使用的地址冒称远程可访问链接。依据当前 H3 工作流的真实接口提交图片、配音及提示词；音频驱动和人物一致性需要实际验证。

官方文档：[语音合成](https://platform.qianwenai.com/docs/token-plan/best-practices/speech-synthesis)、[图片生成](https://platform.qianwenai.com/docs/token-plan/best-practices/image-generation)、[音色列表](https://platform.qianwenai.com/docs/developer-guides/speech/voice-list/qwen-audio-tts)。生成接口返回的文件地址可能过期，及时下载，按服务实际返回的 Credits 用量记录费用。音视频生成前先呈现素材样片，按项目生产流程确认。模型和音色尚未使用用户凭据实测；接口和额度以实际响应为准。
