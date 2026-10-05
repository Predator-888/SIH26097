"""
Session & Audio Processing Endpoints for PM-AJAY Voice Assistant.
Implements /session/start and /session/{session_id}/process-audio.
"""
from fastapi import APIRouter, HTTPException, Path
from app.models.schemas import StartSessionRequest, SessionResponse, ProcessAudioRequest, DialogueResponse
from app.models.storage import db
from app.languages.catalog import get_language_config
from app.services.speech_service import speech_service
from app.services.dialogue_manager import dialogue_manager

router = APIRouter(prefix="", tags=["Conversational AI"])

@router.post("/session/start", response_model=SessionResponse, status_code=201)
async def start_session(request: StartSessionRequest):
    """
    Initialize a new conversational session for a beneficiary via Kiosk, WhatsApp, or IVR.
    """
    session = db.create_session(
        channel=request.channel.upper(),
        language=request.preferred_language,
        phone=request.phone_number
    )
    lang_cfg = get_language_config(request.preferred_language)
    prompt_text = lang_cfg["greeting_consent_prompt"]
    prompt_audio = speech_service.synthesize_speech(prompt_text, request.preferred_language)

    return SessionResponse(
        session_id=session["session_id"],
        status=session["dialogue_state"],
        preferred_language=session["preferred_language"],
        initial_prompt_text=prompt_text,
        initial_prompt_audio=prompt_audio
    )

@router.get("/session/{session_id}")
async def get_session(session_id: str = Path(...)):
    """Fetch session details and conversation history"""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/session/{session_id}/process-audio", response_model=DialogueResponse)
async def process_audio(
    session_id: str = Path(...),
    request: ProcessAudioRequest = ...
):
    """
    Accepts raw/base64 audio or text fallback, transcribes via Bhashini,
    processes conversational state via Gemini, and returns next dialogue turn.
    """
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Transcribe audio if provided, else use text fallback
    if request.text_fallback:
        user_transcript = request.text_fallback
    elif request.audio_base64:
        user_transcript = speech_service.transcribe_audio(
            request.audio_base64,
            session.get("preferred_language", "ahr-IN")
        )
    else:
        raise HTTPException(status_code=400, detail="Either audio_base64 or text_fallback must be provided")

    # Advance dialogue turn
    turn_result = dialogue_manager.process_turn(session_id, user_transcript)

    return DialogueResponse(
        user_transcript=turn_result["user_transcript"],
        ai_response_text=turn_result["ai_response_text"],
        ai_tts_audio=turn_result["ai_tts_audio"],
        current_state=turn_result["current_state"],
        extracted_entities=turn_result["extracted_entities"],
        is_completed=turn_result["is_completed"],
        recommendations=turn_result.get("recommendations")
    )
