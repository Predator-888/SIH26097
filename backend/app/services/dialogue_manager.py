"""
Dialogue Manager and State Machine Orchestrator.
Uses Google Gemini API for empathetic dialectal conversation and entity extraction,
with deterministic heuristics for Ahirani and Telugu fallback operation.
"""
import json
import re
from typing import Dict, Any, Tuple, Optional
from app.config import settings
from app.languages.catalog import get_language_config
from app.models.storage import db
from app.services.recommendation_engine import recommendation_engine
from app.services.speech_service import speech_service

STATE_SEQUENCE = [
    "GREETING_AND_CONSENT",
    "IDENTITY_AND_LOCATION",
    "EDUCATION_AND_BACKGROUND",
    "TRADITIONAL_AND_INFORMAL_SKILLS",
    "MOBILITY_AND_MODALITY",
    "RECOMMENDATION_DELIVERY",
    "COMPLETED"
]

class DialogueManager:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[DialogueManager] Could not initialize Gemini client: {e}")
                self.client = None
        else:
            self.client = None

    def process_turn(self, session_id: str, user_transcript: str) -> Dict[str, Any]:
        """
        Executes one turn of dialogue:
        1. Checks current state.
        2. Extracts entities and updates session.
        3. Moves state machine forward.
        4. Produces next empathetic prompt in target language.
        5. Computes recommendations if reaching recommendation state.
        """
        session = db.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        current_state = session.get("dialogue_state", "GREETING_AND_CONSENT")
        lang_code = session.get("preferred_language", "ahr-IN")
        lang_cfg = get_language_config(lang_code)

        # 1. Extract entities & advance state
        extracted_updates, next_state, consent_granted = self._evaluate_input(
            current_state, user_transcript, lang_cfg, session
        )

        # Merge extracted entities
        entities = session.get("extracted_entities", {})
        entities.update(extracted_updates)

        # Append to transcript history
        turn_number = len(session.get("transcript_history", [])) + 1
        history_entry = {
            "turn": turn_number,
            "state_before": current_state,
            "user_transcript": user_transcript,
            "extracted": extracted_updates,
            "state_after": next_state
        }
        transcript_history = session.get("transcript_history", [])
        transcript_history.append(history_entry)

        # Check for recommendations if reaching RECOMMENDATION_DELIVERY
        recommendations = []
        response_text = ""
        is_completed = False

        if next_state == "RECOMMENDATION_DELIVERY":
            # Build profile for recommendation
            profile = {
                "beneficiary_id": session.get("beneficiary_id"),
                "primary_language": lang_code,
                "district_lgd_code": entities.get("district_lgd_code"),
                "district_name": entities.get("district_name"),
                "education_level": entities.get("education_level"),
                "traditional_trade": entities.get("traditional_trade"),
                "mobility_radius_km": entities.get("mobility_radius_km", 10),
                "preferred_modality": entities.get("preferred_modality", "SELF_EMPLOYMENT"),
                "declared_interest": entities.get("declared_interest") or user_transcript
            }
            db.save_beneficiary_profile(profile)
            recommendations = recommendation_engine.generate_recommendations(profile, top_n=3)
            session["recommendations"] = recommendations

            # Synthesize verbal readout
            rec_lines = []
            for i, rec in enumerate(recommendations, 1):
                t_name = rec.get("trade_name_localized", rec.get("trade_name"))
                rec_lines.append(f"{i}. {t_name} ({rec.get('justification')})")

            prefix = lang_cfg["state_prompts"]["RECOMMENDATION_DELIVERY"]
            suffix = "कोणत्या कोर्ससाठी नाव नोंदवायचं आहे?" if "ahr" in lang_code else "ఏ కోర్సులో చేరాలనుకుంటున్నారు?"
            response_text = f"{prefix}\n" + "\n".join(rec_lines) + f"\n\n{suffix}"

        elif next_state == "COMPLETED":
            response_text = lang_cfg["state_prompts"]["COMPLETED"]
            is_completed = True
        else:
            response_text = lang_cfg["state_prompts"].get(next_state, "")

        # Update session in DB
        db.update_session(session_id, {
            "dialogue_state": next_state,
            "consent_granted": consent_granted,
            "extracted_entities": entities,
            "transcript_history": transcript_history
        })

        # Synthesize audio via Bhashini/fallback
        ai_tts_audio = speech_service.synthesize_speech(response_text, lang_code)

        return {
            "user_transcript": user_transcript,
            "ai_response_text": response_text,
            "ai_tts_audio": ai_tts_audio,
            "current_state": next_state,
            "extracted_entities": entities,
            "is_completed": is_completed,
            "recommendations": recommendations if recommendations else None
        }

    def _evaluate_input(self, current_state: str, user_transcript: str, lang_cfg: Dict[str, Any], session: Dict[str, Any]) -> Tuple[Dict[str, Any], str, bool]:
        """Evaluates input using Google Gemini LLM if configured, otherwise falls back to heuristics"""
        if self.client:
            try:
                gemini_result = self._evaluate_with_gemini(current_state, user_transcript, lang_cfg, session)
                if gemini_result:
                    return gemini_result
            except Exception as e:
                print(f"[DialogueManager] Gemini evaluation error, using fallback heuristics: {e}")

        return self._evaluate_with_heuristics(current_state, user_transcript, lang_cfg, session)

    def _evaluate_with_gemini(self, current_state: str, user_transcript: str, lang_cfg: Dict[str, Any], session: Dict[str, Any]) -> Optional[Tuple[Dict[str, Any], str, bool]]:
        """Invokes Google Gemini 2.5 Flash for dialectal NLU and entity extraction"""
        system_instruction = f"""
You are an empathetic, culturally sensitive vocational counseling AI for the Government of India's PM-AJAY scheme.
The user speaks {lang_cfg['name']} ({lang_cfg['dialect_label']}).
Current Dialogue State: {current_state}
Known entities so far: {json.dumps(session.get('extracted_entities', {}))}

Evaluate the user's spoken input:
1. If state is GREETING_AND_CONSENT, detect if consent is granted (affirmative words like ho, vhay, avunu, sare vs nahi, vaddu).
2. Extract any entities mentioned: district_name, village, education_level, traditional_trade, declared_interest, mobility_radius_km, preferred_modality (SELF_EMPLOYMENT, WAGE_EMPLOYMENT, HYBRID).
3. Determine the next_state from: {STATE_SEQUENCE}.

Return ONLY valid JSON matching this schema:
{{
  "consent_granted": boolean,
  "next_state": string,
  "extracted_entities": object
}}
"""
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[
                {"role": "user", "parts": [{"text": f"User said: \"{user_transcript}\""}]}
            ],
            config={
                "system_instruction": system_instruction,
                "response_mime_type": "application/json"
            }
        )

        if response and response.text:
            data = json.loads(response.text)
            extracted = data.get("extracted_entities", {})
            next_state = data.get("next_state", "EDUCATION_AND_BACKGROUND")
            consent = data.get("consent_granted", True)

            # Map district to LGD code if detected
            district = extracted.get("district_name")
            if district:
                d_lower = district.lower()
                if "dhule" in d_lower: extracted["district_lgd_code"] = 472
                elif "jalgaon" in d_lower: extracted["district_lgd_code"] = 473
                elif "nandurbar" in d_lower: extracted["district_lgd_code"] = 471
                elif "guntur" in d_lower: extracted["district_lgd_code"] = 505
                elif "warangal" in d_lower: extracted["district_lgd_code"] = 535

            return extracted, next_state, consent
        return None

    def _evaluate_with_heuristics(self, current_state: str, user_transcript: str, lang_cfg: Dict[str, Any], session: Dict[str, Any]) -> Tuple[Dict[str, Any], str, bool]:
        """Deterministic heuristic fallback when Gemini API key is absent or offline"""
        extracted = {}
        consent_granted = session.get("consent_granted", False)
        transcript_lower = user_transcript.lower()

        if current_state == "GREETING_AND_CONSENT":
            negatives = lang_cfg.get("negative_words", [])
            if any(w in transcript_lower for w in negatives):
                return extracted, "COMPLETED", False
            return extracted, "IDENTITY_AND_LOCATION", True

        elif current_state == "IDENTITY_AND_LOCATION":
            if any(d in transcript_lower for d in ["dhule", "धुळे", "धुळे तालुका"]):
                extracted["district_name"] = "Dhule"
                extracted["district_lgd_code"] = 472
            elif any(d in transcript_lower for d in ["jalgaon", "जळगाव"]):
                extracted["district_name"] = "Jalgaon"
                extracted["district_lgd_code"] = 473
            elif any(d in transcript_lower for d in ["nandurbar", "नंदुरबार"]):
                extracted["district_name"] = "Nandurbar"
                extracted["district_lgd_code"] = 471
            elif any(d in transcript_lower for d in ["guntur", "గుంటూరు"]):
                extracted["district_name"] = "Guntur"
                extracted["district_lgd_code"] = 505
            elif any(d in transcript_lower for d in ["warangal", "వరంగల్"]):
                extracted["district_name"] = "Warangal"
                extracted["district_lgd_code"] = 535
            else:
                extracted["district_name"] = lang_cfg["primary_districts"][0]
                extracted["district_lgd_code"] = 472 if "ahr" in lang_cfg["code"] else 505
            extracted["village"] = user_transcript[:40]
            return extracted, "EDUCATION_AND_BACKGROUND", True

        elif current_state == "EDUCATION_AND_BACKGROUND":
            extracted["education_level"] = user_transcript
            return extracted, "TRADITIONAL_AND_INFORMAL_SKILLS", True

        elif current_state == "TRADITIONAL_AND_INFORMAL_SKILLS":
            extracted["traditional_trade"] = user_transcript
            extracted["declared_interest"] = user_transcript
            return extracted, "MOBILITY_AND_MODALITY", True

        elif current_state == "MOBILITY_AND_MODALITY":
            if any(w in transcript_lower for w in ["दुकान", "व्यवसाय", "स्वतः", "వ్యాపారం", "స్వయం"]):
                extracted["preferred_modality"] = "SELF_EMPLOYMENT"
            elif any(w in transcript_lower for w in ["नोकरी", "कामगार", "ఉద్యోగం"]):
                extracted["preferred_modality"] = "WAGE_EMPLOYMENT"
            else:
                extracted["preferred_modality"] = "HYBRID"
            
            numbers = re.findall(r'\d+', user_transcript)
            extracted["mobility_radius_km"] = int(numbers[0]) if numbers else 15
            return extracted, "RECOMMENDATION_DELIVERY", True

        elif current_state == "RECOMMENDATION_DELIVERY":
            return extracted, "COMPLETED", True

        return extracted, "COMPLETED", True

dialogue_manager = DialogueManager()

