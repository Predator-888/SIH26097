"""
Speech Service for Bhashini API Integration and Fallbacks.
Handles Indic STT (Speech-to-Text) and TTS (Text-to-Speech)
with dedicated support for Ahirani (mr/Khandeshi) and Telugu (te).
"""
import base64
import requests
import json
from typing import Tuple, Optional
from app.config import settings
from app.languages.catalog import get_language_config

class SpeechService:
    def __init__(self):
        self.pipeline_endpoint = settings.BHASHINI_PIPELINE_ENDPOINT
        self.user_id = settings.BHASHINI_USER_ID
        self.api_key = settings.BHASHINI_API_KEY
        self.inference_api_key = settings.BHASHINI_INFERENCE_API_KEY

    def transcribe_audio(self, audio_base64: str, language_code: str) -> str:
        """
        Transcribes inbound base64 audio to text.
        Attempts Bhashini ASR pipeline. If not configured, gracefully falls back to mock/transcription log.
        """
        lang_config = get_language_config(language_code)
        bhashini_source = lang_config.get("bhashini_source_lang", "mr")

        if self.user_id and self.inference_api_key:
            try:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": self.inference_api_key
                }
                payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "asr",
                            "config": {
                                "language": {
                                    "sourceLanguage": bhashini_source
                                }
                            }
                        }
                    ],
                    "inputData": {
                        "audio": [{"audioContent": audio_base64}]
                    }
                }
                response = requests.post(
                    self.pipeline_endpoint,
                    headers=headers,
                    json=payload,
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    pipeline_response = data.get("pipelineResponse", [])
                    if pipeline_response:
                        output = pipeline_response[0].get("output", [])
                        if output and "source" in output[0]:
                            return output[0]["source"]
            except Exception as e:
                print(f"[SpeechService] Bhashini ASR call failed, using fallback: {e}")

        # Simulated/Fallback transcription for testing when raw audio is provided without live Bhashini credentials
        if language_code == "te-IN":
            return "నమస్కారం, నేను పీఎం-అజయ్ పథకం వివరాలు తెలుసుకోవాలనుకుంటున్నాను"
        return "राम राम, मला पीएम-अजय योजनेबद्दल माहिती सांगा"

    def synthesize_speech(self, text: str, language_code: str) -> Optional[str]:
        """
        Synthesizes response text to audio (base64) using Bhashini TTS.
        Returns base64 audio string or None if fallback to client-side synthesis.
        """
        lang_config = get_language_config(language_code)
        bhashini_source = lang_config.get("bhashini_source_lang", "mr")

        if self.user_id and self.inference_api_key:
            try:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": self.inference_api_key
                }
                payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "tts",
                            "config": {
                                "language": {
                                    "sourceLanguage": bhashini_source
                                },
                                "gender": "female",
                                "samplingRate": 16000
                            }
                        }
                    ],
                    "inputData": {
                        "input": [{"source": text}]
                    }
                }
                response = requests.post(
                    self.pipeline_endpoint,
                    headers=headers,
                    json=payload,
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    pipeline_response = data.get("pipelineResponse", [])
                    if pipeline_response:
                        audio = pipeline_response[0].get("audio", [])
                        if audio and "audioContent" in audio[0]:
                            return audio[0]["audioContent"]
            except Exception as e:
                print(f"[SpeechService] Bhashini TTS call failed: {e}")

        # Return None so client PWA uses high-fidelity Web Speech API or local audio element
        return None

speech_service = SpeechService()
