"""
Profiling and Recommendations Endpoints for PM-AJAY Voice Assistant.
Implements /beneficiary/{beneficiary_id}/recommendations and enrollment.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Path
from app.models.schemas import Recommendation, EnrollRequest
from app.models.storage import db
from app.services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="", tags=["Profiling & Recommendations"])

@router.get("/beneficiary/{beneficiary_id}/recommendations", response_model=List[Recommendation])
async def get_recommendations(beneficiary_id: str = Path(...)):
    """
    Triggers the Scikit-Learn matching engine to evaluate the beneficiary's extracted profile
    against the NSQF database and district geography.
    """
    profile = db.beneficiaries.get(beneficiary_id)
    if not profile:
        # Check if exists in any session
        session = next((s for s in db.sessions.values() if s.get("beneficiary_id") == beneficiary_id), None)
        if session:
            profile = {
                "beneficiary_id": beneficiary_id,
                "primary_language": session.get("preferred_language", "ahr-IN"),
                "district_lgd_code": session.get("extracted_entities", {}).get("district_lgd_code"),
                "education_level": session.get("extracted_entities", {}).get("education_level"),
                "traditional_trade": session.get("extracted_entities", {}).get("traditional_trade"),
                "mobility_radius_km": session.get("extracted_entities", {}).get("mobility_radius_km", 10),
                "preferred_modality": session.get("extracted_entities", {}).get("preferred_modality", "SELF_EMPLOYMENT"),
                "declared_interest": session.get("extracted_entities", {}).get("declared_interest", "")
            }
        else:
            raise HTTPException(status_code=404, detail="Beneficiary profile not found")

    recs = recommendation_engine.generate_recommendations(profile, top_n=3)
    return [Recommendation(**r) for r in recs]

@router.post("/beneficiary/{beneficiary_id}/enroll")
async def enroll_beneficiary(
    beneficiary_id: str = Path(...),
    request: EnrollRequest = ...
):
    """
    Records the candidate's chosen NSQF trade pre-enrollment
    and queues for PM-AJAY ground mobilization and Skill India Digital Hub (SIDH) sync.
    """
    enrollment = db.create_enrollment({
        "beneficiary_id": beneficiary_id,
        "beneficiary_name": request.beneficiary_name,
        "phone_hash": db.hash_phone(request.phone_number),
        "selected_qp_code": request.selected_qp_code,
        "training_center_id": request.training_center_id,
        "session_id": request.session_id
    })
    return {
        "status": "SUCCESS",
        "message": "Candidate pre-enrolled successfully for PM-AJAY skilling.",
        "enrollment_record": enrollment
    }
