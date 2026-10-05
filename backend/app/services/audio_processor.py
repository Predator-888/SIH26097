"""
Audio Processing & Normalization Service.
Validates inbound audio payloads (WAV, WebM, OGG/Opus),
normalizes base64 strings, and computes audio metadata.
"""
import base64
import struct
from typing import Dict, Any, Optional

class AudioProcessor:
    @staticmethod
    def inspect_audio_base64(base64_str: str) -> Dict[str, Any]:
        """
        Inspects base64 audio payload, detects format and estimated size.
        """
        if not base64_str:
            return {"valid": False, "format": "unknown", "size_bytes": 0}

        try:
            # Strip data URL prefix if present
            if "," in base64_str:
                base64_str = base64_str.split(",", 1)[1]

            raw_bytes = base64.b64decode(base64_str)
            size_bytes = len(raw_bytes)

            audio_format = "unknown"
            if raw_bytes.startswith(b"RIFF") and b"WAVE" in raw_bytes[:12]:
                audio_format = "audio/wav"
            elif raw_bytes.startswith(b"OggS"):
                audio_format = "audio/ogg" # WhatsApp voice note
            elif raw_bytes.startswith(b"\x1a\x45\xdf\xa3"):
                audio_format = "audio/webm" # Browser MediaRecorder
            elif raw_bytes.startswith(b"ID3") or raw_bytes.startswith(b"\xff\xfb"):
                audio_format = "audio/mp3"

            return {
                "valid": True,
                "format": audio_format,
                "size_bytes": size_bytes,
                "clean_base64": base64_str
            }
        except Exception as e:
            return {"valid": False, "error": str(e), "format": "unknown", "size_bytes": 0}

audio_processor = AudioProcessor()
