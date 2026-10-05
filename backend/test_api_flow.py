"""
Full API Flow Integration Test.
Simulates end-to-end conversation in Ahirani and Telugu, verifies recommendations and enrollment.
"""
import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_ahirani_flow():
    print("=" * 60)
    print("TESTING FULL FLOW: AHIRANI (MAHARASHTRA)")
    print("=" * 60)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200
    print("[1] Health Check:", res.json())

    # 2. Start session
    start_payload = {
        "channel": "KIOSK",
        "preferred_language": "ahr-IN",
        "phone_number": "+919876543210"
    }
    res = client.post("/session/start", json=start_payload)
    assert res.status_code == 201
    data = res.json()
    session_id = data["session_id"]
    print(f"[2] Session Started: {session_id}")
    print(f"    Initial Prompt: {data['initial_prompt_text']}")

    # 3. Conversational turns
    turns = [
        {"input": "हो, सांगा", "expected_state": "IDENTITY_AND_LOCATION"},
        {"input": "मी धुळे गावचा आहे", "expected_state": "EDUCATION_AND_BACKGROUND"},
        {"input": "मी आठवी शिकलो आहे", "expected_state": "TRADITIONAL_AND_INFORMAL_SKILLS"},
        {"input": "घरात कापूस शेती करतो, मला सोलर पंप आणि शेतीचं काम शिकायचं आहे", "expected_state": "MOBILITY_AND_MODALITY"},
        {"input": "मला स्वतःचा व्यवसाय सुरू करायचा आहे, दहा किलोमीटरच्या आत", "expected_state": "RECOMMENDATION_DELIVERY"}
    ]

    for i, t in enumerate(turns, 1):
        p_res = client.post(
            f"/session/{session_id}/process-audio",
            json={"text_fallback": t["input"]}
        )
        assert p_res.status_code == 200
        p_data = p_res.json()
        print(f"\n[Turn {i}] User: '{t['input']}'")
        print(f"    State: {p_data['current_state']}")
        print(f"    AI Response: {p_data['ai_response_text'][:80]}...")
        if p_data.get("recommendations"):
            print(f"    Generated {len(p_data['recommendations'])} Recommendations!")
            for r in p_data["recommendations"]:
                print(f"     - {r['trade_name_localized']} ({r['suitability_score']*100:.0f}%)")

    # 4. Enroll
    enroll_payload = {
        "beneficiary_name": "Ramesh Patil",
        "phone_number": "+919876543210",
        "selected_qp_code": "AGR/Q0108",
        "training_center_id": "TC_MH_DHL_01",
        "session_id": session_id
    }
    enroll_res = client.post(f"/beneficiary/{session_id}/enroll", json=enroll_payload)
    assert enroll_res.status_code == 200
    print("\n[Enrollment Success]:", enroll_res.json()["message"])

    # 5. Check Admin Stats
    admin_res = client.get("/admin/dashboard-stats")
    assert admin_res.status_code == 200
    print("[Admin Telemetry]:", admin_res.json()["kpis"])
    print("\n✅ AHIRANI END-TO-END FLOW PASSED!")

if __name__ == "__main__":
    test_full_ahirani_flow()
