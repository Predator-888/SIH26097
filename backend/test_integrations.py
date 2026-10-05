"""
Integration test for Government Interoperability Endpoints (SIDH, e-Shram, LGD).
"""
import sys
import os
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from fastapi.testclient import TestClient
from app.main import app
from app.models.storage import db

client = TestClient(app)

def test_government_integrations():
    print("=" * 60)
    print("TESTING GOVERNMENT INTEROPERABILITY (SIDH, e-Shram, LGD)")
    print("=" * 60)

    # 1. Test LGD District Hierarchy
    lgd_res = client.get("/integrations/lgd/districts")
    assert lgd_res.status_code == 200
    districts = lgd_res.json()
    assert len(districts) >= 5
    print(f"[1] LGD Hierarchy verified: Found {len(districts)} districts (Dhule, Jalgaon, Nandurbar, Guntur, Warangal)")

    # 2. Test e-Shram Verification
    eshram_res = client.post("/integrations/eshram/verify", json={
        "uan_number": "1234-5678-9012",
        "phone_hash": "anon_test123"
    })
    assert eshram_res.status_code == 200
    eshram_data = eshram_res.json()
    assert eshram_data["status"] == "VERIFIED"
    assert eshram_data["welfare_scheme_eligible"] is True
    print(f"[2] e-Shram Verification passed: {eshram_data['uan_masked']} -> {eshram_data['status']}")

    # 3. Test SIDH Queue Push
    # Create mock enrollment first
    enr = db.create_enrollment({
        "beneficiary_id": "test_ben_99",
        "beneficiary_name": "Ramesh Patil",
        "phone_hash": "hash_123",
        "selected_qp_code": "AGR/Q0108",
        "training_center_id": "TC_MH_DHL_01"
    })
    sidh_res = client.post("/integrations/sidh/push", json={
        "enrollment_id": enr["enrollment_id"],
        "training_partner_id": "TP_MOSJE_PM_AJAY_01"
    })
    assert sidh_res.status_code == 200
    sidh_data = sidh_res.json()
    assert sidh_data["status"] == "SUCCESS"
    assert "SIDH_BATCH_" in sidh_data["sidh_batch_id"]
    print(f"[3] SIDH Push passed: Batch ID {sidh_data['sidh_batch_id']} synced to Training Partner queue.")

    print("\n✅ ALL GOVERNMENT INTEROPERABILITY TESTS PASSED!")

if __name__ == "__main__":
    test_government_integrations()
