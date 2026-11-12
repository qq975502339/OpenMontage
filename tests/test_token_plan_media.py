from unittest.mock import Mock, patch

from tools.graphics.token_plan_media import TokenPlanImage, TokenPlanTTS


def test_speech_uses_token_plan_voice_and_saves_audio(tmp_path, monkeypatch):
    monkeypatch.setenv('QIANWEN_API_KEY', 'test-secret')
    response = Mock(); response.json.return_value = {'output': {'audio': {'url': 'https://media.example/audio'}}}
    media = Mock(content=b'audio')
    with patch('requests.post', return_value=response) as post, patch('requests.get', return_value=media):
        result = TokenPlanTTS().execute({'text': '你好', 'output_path': str(tmp_path / 'voice.mp3')})
    assert result.success
    assert (tmp_path / 'voice.mp3').read_bytes() == b'audio'
    assert post.call_args.kwargs['json']['input']['voice'] == 'longanlingxin'
    assert post.call_args.args[0].endswith('/services/audio/tts/SpeechSynthesizer')


def test_image_uses_token_plan_model_and_saves_image(tmp_path, monkeypatch):
    monkeypatch.setenv('QIANWEN_API_KEY', 'test-secret')
    response = Mock(); response.json.return_value = {'output': {'choices': [{'message': {'content': [{'image': 'https://media.example/image'}]}}]}}
    with patch('requests.post', return_value=response) as post, patch('requests.get', return_value=Mock(content=b'image')):
        result = TokenPlanImage().execute({'prompt': 'portrait', 'output_path': str(tmp_path / 'image.png')})
    assert result.success
    assert (tmp_path / 'image.png').read_bytes() == b'image'
    assert post.call_args.kwargs['json']['model'] == 'qwen-image-3.0-pro'


def test_speech_accepts_character_voice(tmp_path, monkeypatch):
    monkeypatch.setenv('QIANWEN_API_KEY', 'test-secret')
    response = Mock(); response.json.return_value = {'output': {'audio': {'url': 'https://media.example/audio'}}}
    with patch('requests.post', return_value=response) as post, patch('requests.get', return_value=Mock(content=b'audio')):
        result = TokenPlanTTS().execute({'text': '你好', 'voice': 'character-voice', 'output_path': str(tmp_path / 'character.mp3')})
    assert result.success
    assert post.call_args.kwargs['json']['input']['voice'] == 'character-voice'


def test_missing_key_does_not_call_service(monkeypatch, tmp_path):
    monkeypatch.delenv('QIANWEN_API_KEY', raising=False)
    with patch('requests.post') as post:
        result = TokenPlanTTS().execute({'text': 'hello', 'output_path': str(tmp_path / 'voice.mp3')})
    assert not result.success
    post.assert_not_called()
