# AI-Driven Voice Assistant for Livelihood Mapping & NSQF Skilling (PM-AJAY)
**Smart India Hackathon (SIH) 2026 — Problem Statement ID:** `26097`  
**Ministry:** Ministry of Social Justice and Empowerment (MoSJE), Government of India  
**Scheme:** Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY) – Grant-in-Aid (GIA) Component  
**Theme:** Agriculture, FoodTech & Rural Development  

---

## 🌟 Executive Summary

Target Scheduled Caste (SC) beneficiaries in rural and semi-urban aspirational districts frequently face high literacy and language barriers when navigating standard bureaucratic portals. This causes a severe mismatch between traditional livelihoods and the training programs they are allotted, resulting in high dropout rates and poor post-training job placement.

This solution is a **voice-first, empathetic, dialect-aware conversational AI assistant** designed to run across **PSTN Feature Phones (IVR)**, **WhatsApp Voice Notes**, and **Common Service Center (CSC) Kiosks (Next.js/PWA)**. It interviews beneficiaries in their local dialect, evaluates their traditional competencies and mobility constraints, and mathematically matches them to accredited **National Skills Qualifications Framework (NSQF)** courses linked with local District Skill Development Plans (DSDP).

### 🗣️ Target Demo Languages
1. **Ahirani (`ahr-IN` / Khandeshi, Maharashtra)**: Spoken across Dhule, Jalgaon, and Nandurbar aspirational districts (*e.g., "राम राम! तुमना काय काम-धंदा चालस?"*).
2. **Telugu (`te-IN`, Andhra Pradesh & Telangana)**: Spoken across Guntur, Warangal, and Nalgonda (*e.g., "నమస్కారం! పీఎం-అజయ్ పథకం కింద నైపుణ్య వివరాలు చెప్పడానికి మీ సమ్మతి ఉందా?"*).

---

## 🏛️ System Architecture

```
                  +-------------------------------------------------+
                  |          1. OMNICHANNEL INGESTION               |
                  |  [IVR Telephony]   [WhatsApp Bot]   [CSC Kiosk] |
                  +-----------------------+-------------------------+
                                          |
                                          v
                  +-------------------------------------------------+
                  |      2. FASTAPI BACKEND GATEWAY & ORCHESTRATOR  |
                  +-----------------------+-------------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
+------------------------------------+    +------------------------------------+
| 3. LINGUISTIC PIPELINE (BHASHINI)  |    | 4. DIALOGUE & RECOMMENDATION (AI)  |
| - Indic ASR: Khandeshi/Telugu      |    | - Gemini Conversational NLU        |
| - Dialect Grounding Prompts        |    | - Scikit-Learn Multi-Factor Matrix |
| - Paced Cadence Neural TTS (0.9x)  |    | - DPDP Act 2023 Voice Consent Guard|
+------------------------------------+    +------------------------------------+
                     |                                         |
                     +--------------------+--------------------+
                                          |
                                          v
                  +-------------------------------------------------+
                  |      5. PERSISTENCE & GOV INTEROPERABILITY      |
                  | - Relational / NSQF Catalogs (PostgreSQL)       |
                  | - Turn History & Session Documents (MongoDB)    |
                  | - Skill India Digital Hub (SIDH) Push Queue     |
                  +-------------------------------------------------+
```

---

## 🧮 Multi-Factor Recommendation Equation

$$\text{Suitability Score} = 0.35 \cdot S_{\text{aspiration}} + 0.25 \cdot S_{\text{pre\_req}} + 0.20 \cdot S_{\text{mobility}} + 0.20 \cdot S_{\text{demand}} + \text{modality\_bonus}$$

* **$S_{\text{aspiration}}$**: Cosine similarity between candidate's expressed skills and NSQF Qualification Pack descriptors via Scikit-Learn TF-IDF embeddings.
* **$S_{\text{pre\_req}}$**: Strict academic eligibility filter (Class 5th, 8th, 10th).
* **$S_{\text{mobility}}$**: Exponential spatial distance decay function ($e^{-\lambda d}$) from candidate's village (LGD code) to the nearest PMKK accredited training center.
* **$S_{\text{demand}}$**: District Skill Development Plan (DSDP) priority index for high-opportunity rural trades.

---

## 👥 Jury Demo Personas

| Persona | Language | District | Profile | Top Matched NSQF Courses |
| :--- | :--- | :--- | :--- | :--- |
| **Ramesh Patil** | Ahirani (`ahr-IN`) | Dhule, MH | Class 8th, Cotton farm worker, wants self-employment within 10 km | 1. Cotton Ginning Technician (`AGR/Q0108`)<br>2. Solar Pump Technician (`ELE/Q5901`)<br>3. Small Dairy Manager (`AGR/Q4101`) |
| **Lakshmi Devi** | Telugu (`te-IN`) | Guntur, AP | Class 10th, Traditional Handloom Artisan, open to traveling 20 km | 1. Handloom Jacquard Weaver (`AMH/Q1001`)<br>2. Chilli & Spice Processing (`FIC/Q7001`)<br>3. Solar Lighting Assembler (`ELE/Q5601`) |

---

## 🚀 Quickstart & Running Locally

### 1. Launch Everything with One Click
Double-click `run_all.bat` in the repository root. This will launch:
- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Interactive Swagger UI)
- **Frontend Kiosk & Simulator**: [http://localhost:3000](http://localhost:3000)

### 2. Manual Start

#### Backend (FastAPI):
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
python -m http.server 3000
```
Open `http://localhost:3000` in Chrome/Edge.

---

## 📋 OpenAPI Specification Endpoints

* `POST /session/start` — Initializes a new session with audio consent prompt in chosen dialect.
* `POST /session/{session_id}/process-audio` — Ingests audio chunk/base64, performs STT, dialogue transition, and returns next empathetic prompt.
* `GET /beneficiary/{beneficiary_id}/recommendations` — Executes Scikit-Learn multi-factor recommendation engine.
* `POST /beneficiary/{beneficiary_id}/enroll` — Pre-enrolls candidate and forwards profile to Skill India Digital Hub (SIDH).
* `POST /webhook/whatsapp` — Omnichannel ingestion webhook for Meta WhatsApp Business API voice notes.
* `POST /webhook/ivr` — Telephony audio ingestion webhook for Exotel / Twilio voice calls.
* `GET /admin/dashboard-stats` — Real-time telemetry for District Welfare Officers (DWOs).

---

## 🛡️ Regulatory & DPDP Act 2023 Compliance
- Explicit audio consent gathered upfront (*"क्या आप अपने काम की जानकारी साझा करने की सहमति देते हैं?"* / *"तुमाले काम-धंद्याची माहिती विचारायला चालस का?"*).
- Candidate phone numbers pseudonymized using SHA-256 before model analysis.
- Full data localization adhering to MeitY MeghRaj and CERT-In guidelines.