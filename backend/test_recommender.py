"""
Verification Test for NSQF Recommendation Engine and Persona Matching.
Tests both Ramesh Patil (Ahirani, Dhule) and Lakshmi Devi (Telugu, Guntur).
"""
import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.recommendation_engine import recommendation_engine
from app.models.storage import db

def test_personas():
    print("=" * 60)
    print("TESTING NSQF RECOMMENDATION ENGINE WITH SIH DEMO PERSONAS")
    print("=" * 60)

    # 1. Test Ramesh Patil (Ahirani - Dhule, Maharashtra)
    ramesh_profile = {
        "beneficiary_id": "test_ramesh_01",
        "primary_language": "ahr-IN",
        "district_lgd_code": 472,  # Dhule
        "district_name": "Dhule",
        "education_level": "Class 8th Pass",
        "traditional_trade": "कापूस शेती आणि शेतमजुरी",
        "mobility_radius_km": 10,
        "preferred_modality": "SELF_EMPLOYMENT",
        "declared_interest": "कापूस आणि सौर पंप काम किंवा शेतीचं काम"
    }

    print("\n--- Persona 1: Ramesh Patil (Ahirani, Dhule, Maharashtra) ---")
    recs_ramesh = recommendation_engine.generate_recommendations(ramesh_profile, top_n=3)
    for i, r in enumerate(recs_ramesh, 1):
        print(f"[{i}] {r['trade_name']} ({r['qp_code']})")
        print(f"    Localized: {r['trade_name_localized']}")
        print(f"    Suitability: {r['suitability_score']*100:.1f}%")
        print(f"    Reasoning: {r['justification']}")
        print(f"    Center: {r['training_center']['center_name'] if r['training_center'] else 'N/A'}")

    assert len(recs_ramesh) == 3, "Expected 3 recommendations"
    top_codes_ramesh = [r['qp_code'] for r in recs_ramesh]
    assert "AGR/Q0108" in top_codes_ramesh or "ELE/Q5901" in top_codes_ramesh, "Expected Cotton Ginning or Solar Pump for Ramesh"

    # 2. Test Lakshmi Devi (Telugu - Guntur, Andhra Pradesh)
    lakshmi_profile = {
        "beneficiary_id": "test_lakshmi_02",
        "primary_language": "te-IN",
        "district_lgd_code": 505,  # Guntur
        "district_name": "Guntur",
        "education_level": "Class 10th Pass",
        "traditional_trade": "చేనేత మగ్గం నేత పని మరియు మిరప ఎండబెట్టడం",
        "mobility_radius_km": 20,
        "preferred_modality": "HYBRID",
        "declared_interest": "చేనేత, మిరప ప్రాసెసింగ్ మరియు ఆధునిక యంత్రాలు"
    }

    print("\n--- Persona 2: Lakshmi Devi (Telugu, Guntur, Andhra Pradesh) ---")
    recs_lakshmi = recommendation_engine.generate_recommendations(lakshmi_profile, top_n=3)
    for i, r in enumerate(recs_lakshmi, 1):
        print(f"[{i}] {r['trade_name']} ({r['qp_code']})")
        print(f"    Localized: {r['trade_name_localized']}")
        print(f"    Suitability: {r['suitability_score']*100:.1f}%")
        print(f"    Reasoning: {r['justification']}")
        print(f"    Center: {r['training_center']['center_name'] if r['training_center'] else 'N/A'}")

    assert len(recs_lakshmi) == 3, "Expected 3 recommendations"
    top_codes_lakshmi = [r['qp_code'] for r in recs_lakshmi]
    assert "AMH/Q1001" in top_codes_lakshmi or "FIC/Q7001" in top_codes_lakshmi, "Expected Handloom Weaver or Chilli Processing for Lakshmi"

    print("\n✅ ALL PERSONA RECOMMENDATION TESTS PASSED!")

if __name__ == "__main__":
    test_personas()
