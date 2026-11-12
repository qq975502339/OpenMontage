"""Token Plan personal image and speech generation via native HTTP APIs."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import requests

from tools.base_tool import BaseTool, ToolResult, ToolRuntime, ToolStability, ToolStatus, ToolTier

BASE = 'https://token-plan.maas.qianwenaiapi.com/api/v1'
KEY = 'QIANWEN_API_KEY'


class _TokenPlanMedia(BaseTool):
    runtime = ToolRuntime.API
    stability = ToolStability.EXPERIMENTAL
    dependencies = []
    agent_skills = ['dashscope']
    install_instructions = 'Configure QIANWEN_API_KEY for the Token Plan personal subscription.'

    def get_status(self):
        value = os.environ.get(KEY, '').strip()
        return ToolStatus.AVAILABLE if value and not value.startswith('#') else ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0  # Credit consumption is determined by the provider; not a free-use guarantee.

    def _request(self, endpoint: str, payload: dict, output_path: str, kind: str, include_remote_url: bool = False) -> ToolResult:
        key = os.environ.get(KEY, '').strip()
        if not key or key.startswith('#'):
            return ToolResult(success=False, error=f'{KEY} is not configured')
        if not output_path:
            return ToolResult(success=False, error='output_path is required')
        try:
            response = requests.post(BASE + endpoint, headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}, json=payload, timeout=180)
            response.raise_for_status()
            data = response.json()
            if kind == 'audio':
                url = data['output']['audio']['url']
            else:
                url = next(item['image'] for choice in data['output']['choices'] for item in choice['message']['content'] if item.get('image'))
            if url.startswith('http://'):
                url = 'https://' + url[len('http://'):]
            if not url.startswith('https://'):
                raise ValueError(f'Invalid media URL scheme: {urlsplit(url).scheme or "missing"}')
            download = requests.get(url, timeout=120)
            download.raise_for_status()
            if not download.content:
                raise ValueError('Empty media result')
            path = Path(output_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(download.content)
            result_data = {'output': str(path), 'usage': data.get('usage', {}), 'provider': 'token_plan'}
            if include_remote_url:
                result_data['remote_url'] = url
            return ToolResult(success=True, artifacts=[str(path)], model=payload['model'], data=result_data)
        except (requests.RequestException, ValueError, KeyError, TypeError, StopIteration, OSError) as exc:
            return ToolResult(success=False, error=f'Token Plan {kind} failed: {str(exc).replace(key, "[redacted]")}')


class TokenPlanTTS(_TokenPlanMedia):
    name = 'token_plan_tts'
    tier = ToolTier.VOICE
    capability = 'tts'
    provider = 'token_plan'
    input_schema = {'type': 'object', 'required': ['text', 'output_path'], 'properties': {'text': {'type': 'string'}, 'output_path': {'type': 'string'}, 'voice': {'type': 'string', 'default': 'longanlingxin'}, 'include_remote_url': {'type': 'boolean', 'default': False}}}

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        text = inputs.get('text', '').strip()
        if not text:
            return ToolResult(success=False, error='text is required')
        voice = (inputs.get('voice') or 'longanlingxin').strip()
        if not voice:
            return ToolResult(success=False, error='voice must not be blank')
        payload = {'model': 'qwen-audio-3.0-tts-plus', 'input': {'text': text, 'voice': voice, 'format': 'mp3', 'sample_rate': 22050}}
        return self._request('/services/audio/tts/SpeechSynthesizer', payload, inputs.get('output_path', ''), 'audio', inputs.get('include_remote_url', False))


class TokenPlanImage(_TokenPlanMedia):
    name = 'token_plan_image'
    tier = ToolTier.GENERATE
    capability = 'image_generation'
    provider = 'token_plan'
    input_schema = {'type': 'object', 'required': ['prompt', 'output_path'], 'properties': {'prompt': {'type': 'string'}, 'output_path': {'type': 'string'}, 'size': {'type': 'string'}, 'include_remote_url': {'type': 'boolean', 'default': False}}}

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        prompt = inputs.get('prompt', '').strip()
        if not prompt:
            return ToolResult(success=False, error='prompt is required')
        payload = {'model': 'qwen-image-3.0-pro', 'input': {'messages': [{'role': 'user', 'content': [{'text': prompt}]}]}}
        if inputs.get('size'):
            payload['parameters'] = {'size': inputs['size']}
        return self._request('/services/aigc/multimodal-generation/generation', payload, inputs.get('output_path', ''), 'image', inputs.get('include_remote_url', False))
