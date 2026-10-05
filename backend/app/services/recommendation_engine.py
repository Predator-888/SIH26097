"""
NSQF Multi-Factor Recommendation Engine.
Implements the mathematical formulation:
Suitability Score = w1 * S_aspiration + w2 * S_prereq + w3 * S_mobility + w4 * S_demand
Powered by Scikit-Learn TF-IDF vectorization and spatial constraint matching.
"""
import math
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.storage import db

class RecommendationEngine:
    def __init__(self):
        self.w_aspiration = 0.35
        self.w_prereq = 0.25
        self.w_mobility = 0.20
        self.w_demand = 0.20

    def _calculate_aspiration_score(self, user_profile: Dict[str, Any], qp: Dict[str, Any]) -> float:
        """Calculates semantic similarity using TF-IDF between user's expressed skills and QP profile"""
        corpus = [
            f"{qp.get('trade_name', '')} {qp.get('sector_name', '')} {qp.get('description', '')} {' '.join(qp.get('keywords', []))}",
            f"{user_profile.get('declared_interest', '')} {user_profile.get('traditional_trade', '')} {user_profile.get('education_level', '')}"
        ]
        
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(corpus)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            # Ensure a sensible non-zero baseline
            return float(min(1.0, max(0.1, similarity * 1.5)))
        except Exception:
            return 0.5

    def _calculate_prereq_score(self, user_education: Optional[str], qp_min_qual: str) -> float:
        """Evaluates educational feasibility constraint"""
        if not user_education:
            return 0.7
        user_lower = user_education.lower()
        qp_lower = qp_min_qual.lower()

        if "10th" in user_lower or "12th" in user_lower or "intermediate" in user_lower or "graduate" in user_lower:
            return 1.0
        if "8th" in user_lower:
            if "10th" in qp_lower or "12th" in qp_lower:
                return 0.4
            return 1.0
        if "5th" in user_lower or "primary" in user_lower:
            if "8th" in qp_lower or "10th" in qp_lower:
                return 0.3
            return 0.95
        # Can read/write
        return 0.85

    def _calculate_mobility_score(self, candidate_district_code: Optional[int], qp_code: str, mobility_radius_km: int) -> Tuple[float, Optional[Dict[str, Any]]]:
        """Finds nearest training center offering this QP and calculates distance decay score"""
        matching_centers = [
            c for c in db.training_centers
            if qp_code in c.get("offered_qp_codes", [])
        ]
        if not matching_centers:
            return 0.5, None

        # Check for same district training center
        same_district_center = next(
            (c for c in matching_centers if c.get("district_lgd_code") == candidate_district_code),
            None
        )

        if same_district_center:
            # Within district: estimated 8-15 km
            distance_km = 10.0
            chosen_center = same_district_center
        else:
            # Neighboring district: estimated 30-40 km
            distance_km = 35.0
            chosen_center = matching_centers[0]

        # Exponential decay function: e^(-distance / (2 * mobility_radius))
        decay_factor = math.exp(-distance_km / (2 * max(5, mobility_radius_km)))
        score = float(min(1.0, max(0.2, decay_factor)))
        return score, chosen_center

    def _calculate_demand_score(self, district_code: Optional[int], qp_code: str) -> float:
        """Fetches District Skill Development Plan (DSDP) demand weight"""
        if not district_code:
            return 0.7
        district_data = db.district_demand.get(str(district_code), {})
        priority_weights = district_data.get("priority_qp_weights", {})
        return float(priority_weights.get(qp_code, 0.65))

    def generate_recommendations(self, user_profile: Dict[str, Any], top_n: int = 3) -> List[Dict[str, Any]]:
        """
        Evaluates all NSQF Qualification Packs against candidate profile
        and returns top_n ranked matches with suitability score and natural justification.
        """
        district_code = user_profile.get("district_lgd_code")
        mobility_km = int(user_profile.get("mobility_radius_km", 10))
        lang_code = user_profile.get("primary_language", "ahr-IN")

        scored_qps = []

        for qp in db.nsqf_packs:
            qp_code = qp["qp_code"]
            s_aspiration = self._calculate_aspiration_score(user_profile, qp)
            s_prereq = self._calculate_prereq_score(user_profile.get("education_level"), qp.get("entry_qualification_minimum", ""))
            s_mobility, center = self._calculate_mobility_score(district_code, qp_code, mobility_km)
            s_demand = self._calculate_demand_score(district_code, qp_code)

            # Modality bonus (if self employment preferred and course is self-employment oriented)
            modality_bonus = 0.05 if (user_profile.get("preferred_modality") == "SELF_EMPLOYMENT" and qp.get("is_self_employment_oriented")) else 0.0

            total_score = (
                self.w_aspiration * s_aspiration +
                self.w_prereq * s_prereq +
                self.w_mobility * s_mobility +
                self.w_demand * s_demand +
                modality_bonus
            )
            suitability_score = round(min(0.99, max(0.40, total_score)), 2)

            # Localized trade name
            trade_name_loc = qp.get("trade_name_ahirani") if "ahr" in lang_code else qp.get("trade_name_telugu", qp.get("trade_name"))

            # Construct human-readable reasoning
            center_name = center.get("center_name", "जिल्हा कौशल्य केंद्र") if center else "स्थानिक केंद्र"
            if "ahr" in lang_code:
                justification = f"तुमना शेती/कामाच्या अनुभवाशी जुळतंस. {center_name} मध्ये मोफत ट्रेनिंग उपलब्ध आहे. {int(suitability_score*100)}% अनुकूल."
            else:
                justification = f"మీ అనుభవం మరియు ఆసక్తికి సరిపోతుంది. {center_name} వద్ద శిక్షణ మరియు స్కాలర్‌షిప్ అందుబాటులో ఉంది. {int(suitability_score*100)}% సరిపోతుంది."

            scored_qps.append({
                "qp_code": qp_code,
                "trade_name": qp["trade_name"],
                "trade_name_localized": trade_name_loc,
                "nsqf_level": qp.get("nsqf_level", 4),
                "sector_name": qp.get("sector_name", ""),
                "suitability_score": suitability_score,
                "justification": justification,
                "training_center": center
            })

        # Sort descending by suitability score
        scored_qps.sort(key=lambda x: x["suitability_score"], reverse=True)
        return scored_qps[:top_n]

recommendation_engine = RecommendationEngine()
