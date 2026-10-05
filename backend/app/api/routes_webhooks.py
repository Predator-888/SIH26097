"""
Omnichannel Ingestion Webhook Endpoints.
Handles inbound audio/messages from WhatsApp Business API and IVR Telephony (Exotel/Twilio).
"""
from fastapi import APIRouter
from app.models.schemas import WhatsAppWebhookPayload, IVRWebhookPayload, IVRActionResponse
from app.models.storage import db
from app.services.speech_service import speech_service
from app.services.dialogue_manager import dialogue_manager

router = APIRouter(prefix="", tags=["Webhooks"])

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(payload: WhatsAppWebhookPayload):
    """
    Webhook endpoint for Meta/WhatsApp Business API to push incoming user voice notes or texts.
    Accepts incoming voice notes (.ogg/base64), runs dialogue state machine, and replies with audio + cards.
    """
    lang_code = payload.language or "ahr-IN"
    # Find existing session for caller or start one
    session = db.create_session(
        channel="WHATSAPP",
        language=lang_code,
        phone=payload.from_number
    )
    
    # Process text or audio
    user_input = payload.text_message
    if not user_input and payload.audio_base64:
        user_input = speech_service.transcribe_audio(payload.audio_base64, lang_code)
    
    if not user_input:
        user_input = "राम राम" if "ahr" in lang_code else "నమస్కారం"

    turn_result = dialogue_manager.process_turn(session["session_id"], user_input)

    return {
        "status": "QUEUED_AND_REPLIED",
        "session_id": session["session_id"],
        "reply_text": turn_result["ai_response_text"],
        "reply_audio": turn_result["ai_tts_audio"],
        "recommendations": turn_result.get("recommendations")
    }

@router.post("/webhook/ivr", response_model=IVRActionResponse)
async def ivr_webhook(payload: IVRWebhookPayload):
    """
    Endpoint for telephony providers (e.g., Exotel/Twilio) to send recorded audio chunks from feature phone calls.
    Returns IVR action instruction to play synthesized response audio back to the caller.
    """
    lang_code = payload.language or "ahr-IN"
    session = db.create_session(
        channel="IVR",
        language=lang_code,
        phone=payload.From
    )

    user_input = "राम राम" if "ahr" in lang_code else "నమస్కారం"
    if payload.RecordingBase64:
        user_input = speech_service.transcribe_audio(payload.RecordingBase64, lang_code)
    elif payload.Digits:
        user_input = f"निवड: पर्याय {payload.Digits}"

    turn_result = dialogue_manager.process_turn(session["session_id"], user_input)

    return IVRActionResponse(
        action="play_audio",
        audio_url=f"/static/audio/{session['session_id']}.wav",
        audio_base64=turn_result["ai_tts_audio"],
        response_text=turn_result["ai_response_text"],
        session_id=session["session_id"]
    )
