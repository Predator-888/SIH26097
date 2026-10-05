from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class StartSessionRequest(BaseModel):
    channel: str = Field(default="KIOSK", description="KIOSK, WHATSAPP, or IVR")
    preferred_language: str = Field(default="ahr-IN", description="ahr-IN or te-IN")
    phone_number: Optional[str] = Field(default=None, description="Optional caller phone")

class SessionResponse(BaseModel):
    session_id: str
    status: str
    preferred_language: str
    initial_prompt_text: str
    initial_prompt_audio: Optional[str] = None

class ProcessAudioRequest(BaseModel):
    audio_base64: Optional[str] = Field(default=None, description="Base64 encoded audio string")
    text_fallback: Optional[str] = Field(default=None, description="Direct text input for simulator/fallback")

class DialogueResponse(BaseModel):
    user_transcript: str
    ai_response_text: str
    ai_tts_audio: Optional[str] = None
    current_state: str
    extracted_entities: Dict[str, Any] = Field(default_factory=dict)
    is_completed: bool = False
    recommendations: Optional[List[Dict[str, Any]]] = None

class Recommendation(BaseModel):
    qp_code: str
    trade_name: str
    trade_name_localized: Optional[str] = None
    nsqf_level: int
    sector_name: str
    suitability_score: float
    justification: str
    training_center: Optional[Dict[str, Any]] = None

class WhatsAppWebhookPayload(BaseModel):
    object: Optional[str] = "whatsapp_business_account"
    entry: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    # Simulator friendly fields
    from_number: Optional[str] = None
    audio_base64: Optional[str] = None
    text_message: Optional[str] = None
    language: Optional[str] = "ahr-IN"

class IVRWebhookPayload(BaseModel):
    CallSid: Optional[str] = None
    From: Optional[str] = None
    RecordingUrl: Optional[str] = None
    RecordingBase64: Optional[str] = None
    Digits: Optional[str] = None
    language: Optional[str] = "ahr-IN"

class IVRActionResponse(BaseModel):
    action: str = "play_audio"
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    response_text: Optional[str] = None
    session_id: Optional[str] = None

class EnrollRequest(BaseModel):
    beneficiary_name: str
    phone_number: str
    selected_qp_code: str
    training_center_id: str
    session_id: Optional[str] = None

class BeneficiaryProfile(BaseModel):
    beneficiary_id: str
    phone_hash: str
    primary_language: str
    district_lgd_code: Optional[int] = None
    district_name: Optional[str] = None
    education_level: Optional[str] = None
    mobility_radius_km: int = 10
    preferred_modality: str = "SELF_EMPLOYMENT"
    traditional_trade: Optional[str] = None
    declared_interest: Optional[str] = None
    consent_timestamp: Optional[str] = None
    created_at: Optional[str] = None
