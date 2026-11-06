$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$engineDirectory = Split-Path -Parent $PSScriptRoot
$previewDirectory = Join-Path $engineDirectory 'previews'
$tempDirectory = Join-Path $previewDirectory 'demo-voice-work'
if (Test-Path -LiteralPath $tempDirectory) { throw 'Temporary voice directory already exists.' }
New-Item -ItemType Directory -Path $tempDirectory | Out-Null
try {
  $synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
  try {
    $voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'zh-CN' } | Select-Object -First 1
    if (!$voice) { throw 'No installed Mandarin voice found.' }
    $synth.SelectVoice($voice.VoiceInfo.Name)
    $synth.Rate = 1
    $lines = @('日常的小选择，也能带来变化。', '每周存下一笔钱，举个例子。', '学习时间，也可以用图表观察。', '把目标拆小，持续积累。')
    for ($i = 0; $i -lt $lines.Count; $i++) {
      $synth.SetOutputToWaveFile((Join-Path $tempDirectory "line-$i.wav"))
      $synth.Speak($lines[$i])
      $synth.SetOutputToNull()
    }
  } finally { $synth.Dispose() }
  $inputVideo = Join-Path $previewDirectory 'personal-style-demo.mp4'
  $outputVideo = Join-Path $previewDirectory 'personal-style-demo-voice.mp4'
  & ffmpeg -loglevel error -y -i $inputVideo -i (Join-Path $tempDirectory 'line-0.wav') -i (Join-Path $tempDirectory 'line-1.wav') -i (Join-Path $tempDirectory 'line-2.wav') -i (Join-Path $tempDirectory 'line-3.wav') -filter_complex '[1:a]adelay=300:all=1[a1];[2:a]adelay=4200:all=1[a2];[3:a]adelay=8200:all=1[a3];[4:a]adelay=12200:all=1[a4];[a1][a2][a3][a4]amix=inputs=4:duration=longest:normalize=0,apad=whole_dur=16[a]' -map 0:v -map '[a]' -c:v copy -c:a aac -b:a 160k -t 16 -movflags +faststart $outputVideo
  if ($LASTEXITCODE -ne 0) { throw 'FFmpeg audio mix failed.' }
  Write-Output "Rendered $outputVideo using $($voice.VoiceInfo.Name)"
} finally {
  Remove-Item -LiteralPath $tempDirectory -Recurse -Force
}
