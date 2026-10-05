"""
In-Memory and File-Backed Storage Abstraction for PM-AJAY Voice Assistant.
Implements data stores for:
- Sessions & Dialogue History (NoSQL/Document store model)
- Beneficiary Profiles & Pre-Enrollments (Relational model)
- NSQF Qualification Packs, Training Centers, and District Demand
"""
import os
import json
import uuid
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from app.config import settings

class DataStore:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.beneficiaries: Dict[str, Dict[str, Any]] = {}
        self.enrollments: List[Dict[str, Any]] = []
        self.nsqf_packs: List[Dict[str, Any]] = []
        self.training_centers: List[Dict[str, Any]] = []
        self.district_demand: Dict[str, Any] = {}
        self._load_seed_data()

    def _load_seed_data(self):
        data_dir = settings.DATA_DIR
        try:
            with open(os.path.join(data_dir, "nsqf_packs.json"), "r", encoding="utf-8") as f:
                self.nsqf_packs = json.load(f)
        except Exception as e:
            print(f"[DataStore] Warning loading nsqf_packs: {e}")
            self.nsqf_packs = []

        try:
            with open(os.path.join(data_dir, "training_centers.json"), "r", encoding="utf-8") as f:
                self.training_centers = json.load(f)
        except Exception as e:
            print(f"[DataStore] Warning loading training_centers: {e}")
            self.training_centers = []

        try:
            with open(os.path.join(data_dir, "district_demand.json"), "r", encoding="utf-8") as f:
                self.district_demand = json.load(f)
        except Exception as e:
            print(f"[DataStore] Warning loading district_demand: {e}")
            self.district_demand = {}

    def hash_phone(self, phone: Optional[str]) -> str:
        """DPDP Act compliance: pseudonymize phone numbers using SHA-256"""
        if not phone:
            return "anon_" + str(uuid.uuid4())[:8]
        return hashlib.sha256(phone.encode()).hexdigest()[:16]

    def create_session(self, channel: str, language: str, phone: Optional[str] = None) -> Dict[str, Any]:
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        beneficiary_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        session = {
            "session_id": session_id,
            "beneficiary_id": beneficiary_id,
            "channel": channel,
            "preferred_language": language,
            "phone_hash": self.hash_phone(phone),
            "dialogue_state": "GREETING_AND_CONSENT",
            "consent_granted": False,
            "transcript_history": [],
            "extracted_entities": {
                "district_name": None,
                "district_lgd_code": None,
                "village": None,
                "education_level": None,
                "traditional_trade": None,
                "mobility_radius_km": 10,
                "preferred_modality": "SELF_EMPLOYMENT",
                "declared_interest": None
            },
            "recommendations": [],
            "created_at": now,
            "updated_at": now
        }
        self.sessions[session_id] = session
        self._save_runtime_state()
        return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.sessions.get(session_id)

    def update_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if session_id in self.sessions:
            self.sessions[session_id].update(updates)
            self.sessions[session_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._save_runtime_state()
            return self.sessions[session_id]
        return None

    def save_beneficiary_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        beneficiary_id = profile.get("beneficiary_id") or str(uuid.uuid4())
        profile["beneficiary_id"] = beneficiary_id
        profile["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.beneficiaries[beneficiary_id] = profile
        self._save_runtime_state()
        return profile

    def create_enrollment(self, enrollment: Dict[str, Any]) -> Dict[str, Any]:
        enrollment_id = f"enr_{uuid.uuid4().hex[:8]}"
        enrollment["enrollment_id"] = enrollment_id
        enrollment["enrolled_at"] = datetime.now(timezone.utc).isoformat()
        enrollment["sidh_sync_status"] = "FORWARDED_TO_SIDH"
        self.enrollments.append(enrollment)
        self._save_runtime_state()
        return enrollment

    def _save_runtime_state(self):
        """Persists sessions and enrollments to runtime_store.json"""
        store_path = os.path.join(settings.DATA_DIR, "runtime_store.json")
        try:
            with open(store_path, "w", encoding="utf-8") as f:
                json.dump({
                    "sessions": self.sessions,
                    "beneficiaries": self.beneficiaries,
                    "enrollments": self.enrollments
                }, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[DataStore] Warning saving runtime state: {e}")

    def _load_runtime_state(self):
        """Restores persisted sessions and enrollments on startup"""
        store_path = os.path.join(settings.DATA_DIR, "runtime_store.json")
        if os.path.exists(store_path):
            try:
                with open(store_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.sessions = data.get("sessions", {})
                    self.beneficiaries = data.get("beneficiaries", {})
                    self.enrollments = data.get("enrollments", [])
            except Exception as e:
                print(f"[DataStore] Warning restoring runtime state: {e}")

db = DataStore()
db._load_runtime_state()

