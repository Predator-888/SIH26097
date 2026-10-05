# **System Design Document (SDD)**

**Document Reference:** SDD-PM-AJAY-26097-V1.0  
**Project:** AI-Driven Voice Assistant for Livelihood Mapping & NSQF-Aligned Skilling Recommendations  
**Scheme:** Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY) – Grant-in-Aid (GIA) Component  
**Nodal Ministry:** Ministry of Social Justice and Empowerment (MoSJE), Government of India  
**Target Beneficiaries:** Scheduled Caste (SC) individuals and rural/semi-urban households in aspirational districts

## **1\. Document Control & Metadata**

| Field | Detail |
| :---- | :---- |
| **Document Version** | 1.0 (Final Architecture Proposal) |
| **Classification** | Official / Government-Ready Architecture Standard |
| **Standards Compliance** | MeitY Guidelines for Indian Government Websites (GIGW), Digital Personal Data Protection (DPDP) Act 2023, National e-Governance Division (NeGD) Standards |
| **Target Infrastructure** | MeitY-Empaneled Cloud Service Provider (MeghRaj / NIC Cloud) |

## **2\. Executive Overview & Institutional Alignment**

### **2.1 Context**

Under the Grant-in-Aid (GIA) component of PM-AJAY, interventions require actionable socio-economic enablement of Scheduled Caste (SC) beneficiaries. Existing top-down registration methods suffer from:

> 1. Low digital and textual literacy among target groups.  
> 2. Incompatible skill allocations ignoring local economic realities and individual physical/mobility constraints.  
> 3. High post-training attrition and suboptimal job placements.

### **2.2 System Objective**

To deploy a **fault-tolerant, voice-first, dialect-aware conversational system** accessible across low-bandwidth environments (Interactive Voice Response \[IVR\], WhatsApp Voice Notes, and Common Service Centre \[CSC\] kiosks). The platform maps beneficiary capabilities to National Skills Qualifications Framework (NSQF) qualification packs, optimizing training outcomes and livelihood generation.

## **3\. High-Level System Architecture**

The architecture follows a modular, microservices-based model designed for high concurrency, zero data residency outside national borders, and strict loose coupling.

\+-----------------------------------------------------------------------------------+  
|                            1\. ACCESS & INGESTION LAYER                            |  
|   \+-----------------------+   \+-----------------------+   \+-------------------+   |  
|   |  IVR / Telephony Hub  |   |   WhatsApp Bot Hub    |   | CSC / PWA Kiosk   |   |  
|   | (PSTN/PRI via Exotel) |   | (Meta/Govt Messaging) |   | (Low-BW Next.js)  |   |  
\+---+-----------+-----------+---+-----------+-----------+---+---------+---------+---+  
                |                           |                         |  
                \+-------------------\> Webhook Gateway \<---------------+  
                                            |  
\+-------------------------------------------v---------------------------------------+  
|                    2\. LINGUISTIC & CONVERSATIONAL LAYER                           |  
|   \+---------------------------------------------------------------------------+   |  
|   | ASR / Speech-to-Text: Bhashini API (Indic Dialects, Code-Mixing)          |   |  
|   \+-------------------------------------+-------------------------------------+   |  
|                                         |                                         |  
|   \+-------------------------------------v-------------------------------------+   |  
|   | Dialogue Management & NLU: Custom LLM Orchestrator (Intent/Entity Parser) |   |  
|   \+-------------------------------------+-------------------------------------+   |  
|                                         |                                         |  
|   \+-------------------------------------v-------------------------------------+   |  
|   | TTS / Text-to-Speech: Bhashini Indic Acoustic Models (Empathetic Persona) |   |  
|   \+---------------------------------------------------------------------------+   |  
\+-------------------------------------------+---------------------------------------+  
                                            |  
\+-------------------------------------------v---------------------------------------+  
|                     3\. CORE INTELLIGENCE & PROCESSING LAYER                       |  
|   \+-----------------------------------+   \+-----------------------------------+   |  
|   | Beneficiary Profiling Engine      |   | Dynamic Skill Gap Assessor        |   |  
|   | \- Socio-Demographic Normalizer    |   | \- Current vs. Target Qualification|   |  
|   \+-----------------+-----------------+   \+-----------------+-----------------+   |  
|                     |                                       |                     |  
|   \+-----------------v---------------------------------------v-----------------+   |  
|   | NSQF-Livelihood Matching Engine                                           |   |  
|   | \- Multi-Factor Recommendation Matrix (Scikit-Learn Inference Pipeline)   |   |  
|   \+---------------------------------------------------------------------------+   |  
\+-------------------------------------------+---------------------------------------+  
                                            |  
\+-------------------------------------------v---------------------------------------+  
|                 4\. DATA PERSISTENCE & GOV INTEROPERABILITY LAYER                  |  
|   \+--------------------+   \+---------------------+   \+------------------------+   |  
|   | Supabase / Postgres|   | MongoDB Storage     |   | Govt Integrations      |   |  
|   | (Relational/NSQF)  |   | (Voice/Chat Logs)   |   | (SIDH, e-Shram, PFMS)  |   |  
|   \+--------------------+   \+---------------------+   \+------------------------+   |  
\+-----------------------------------------------------------------------------------+

## **4\. Subsystem Specifications**

### **4.1 Ingestion & Telephony Subsystem**

* **IVR Telephony Channel:** Uses standard Telecom Service Provider (TSP) PRI lines to support plain feature phones without active mobile data. The IVR engine records incoming audio streams in chunked raw .wav/.pcm (8 kHz/16-bit mono) and streams them to the processing pipeline via secure WebSocket connections.  
* **WhatsApp Voice Gateway:** Receives .ogg (Opus-encoded) voice notes via standard webhook callbacks, decrypts the media payload, and routes it to the audio ingestion queue.  
* **CSC / PWA Kiosk:** Progressive Web Application running a lightweight service worker designed to cache static assets and record audio client-side using the MediaRecorder API, transmitting over TLS 1.3.

### **4.2 Linguistic Pipeline (Digital India Bhashini Integration)**

> 1. **Speech Recognition (ASR):** Inbound audio is routed to the respective language model via the Bhashini Open API. The pipeline includes background acoustic noise reduction filters tuned to rural environments.  
> 2. **Intent & Entity Extraction (NLU):** The conversational logic transforms colloquial phrases into standardized parameter keys:  
   * education\_attainment\_code (e.g., Pre-matric, Matric, Intermediate)  
   * traditional\_family\_trade (e.g., Leathercraft, Weaving, Masonry, Agritech)  
   * mobility\_radius\_km (e.g., strictly within panchayat vs. block/district headquarter)  
   * employment\_modality (Wage-labor vs. Micro-enterprise/Self-employment)  
> 3. **Voice Synthesis (TTS):** Responses are converted into natural regional accents with cadence adjustments (0.9x speed) to maximize comprehension for elderly or low-literacy users.

### **4.3 NSQF Skill Matching & Recommendation Logic**

The recommendation engine uses a constraint-satisfaction and similarity-matching model:

\$\$\\text{Suitability Score} \= w\_1 \\cdot S\_{\\text{aspiration}} \+ w\_2 \\cdot S\_{\\text{pre\\\_req}} \+ w\_3 \\cdot S\_{\\text{mobility}} \+ w\_4 \\cdot S\_{\\text{demand}}\$\$

| Dimension | Evaluation Parameter | Data Source |
| :---- | :---- | :---- |
| **Aspiration Match (\$S\_{\\text{aspiration}}\$)** | Semantic cosine similarity between declared trade interests and Qualification Pack (QP) descriptors. | Bhashini transcribed text vs. NSQF registry embeddings. |
| **Eligibility Feasibility (\$S\_{\\text{pre\\\_req}}\$)** | Strict binary/weighted check on minimum academic criteria and physical capability requirements. | National Occupational Standards (NOS) prerequisite rules. |
| **Geographic Mobility (\$S\_{\\text{mobility}}\$)** | Physical distance constraint between candidate's village code (LGD) and recognized PM-AJAY Training Centers. | Ministry Local Government Directory (LGD) geospatial mappings. |
| **Local Economic Viability (\$S\_{\\text{demand}}\$)** | District Skill Development Plan (DSDP) priority index and regional MSME cluster requirements. | Periodic district livelihood reports & market surveys. |

## **5\. Data Architecture & Schema Standards**

### **5.1 Relational Core (PostgreSQL / Supabase)**

Stores master tables, audit trails, and NSQF reference catalogs:

SQL  
\-- NSQF Master Qualification Pack Mapping  
CREATE TABLE nsqf\_qualification\_packs (  
    qp\_code VARCHAR(32) PRIMARY KEY,  
    sector\_name VARCHAR(128) NOT NULL,  
    nsqf\_level INT NOT NULL CHECK (nsqf\_level BETWEEN 1 AND 8),  
    entry\_qualification\_minimum VARCHAR(256),  
    is\_self\_employment\_oriented BOOLEAN DEFAULT FALSE,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

\-- Beneficiary Core Profile  
CREATE TABLE beneficiary\_profiles (  
    beneficiary\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    district\_lgd\_code INT NOT NULL,  
    primary\_language VARCHAR(16) NOT NULL,  
    education\_level VARCHAR(64),  
    mobility\_radius\_km INT DEFAULT 10,  
    preferred\_modality VARCHAR(32) CHECK (preferred\_modality IN ('SELF\_EMPLOYMENT', 'WAGE\_EMPLOYMENT', 'HYBRID')),  
    consent\_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

### **5.2 Document Store (MongoDB)**

Retains dynamic conversational sessions, audio interaction metadata, and state machines:

JSON  
{  
  "\_id": "sess\_89f41b2c",  
  "beneficiary\_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",  
  "channel": "IVR",  
  "dialogue\_state": "SKILL\_PROBING\_COMPLETED",  
  "transcript\_history": \[  
    {  
      "turn": 1,  
      "assistant\_tts\_id": "prompt\_trad\_occ\_01",  
      "user\_raw\_asr": "हमारे यहाँ चमड़े का काम होता है पुश्तों से",  
      "extracted\_entities": {  
        "domain": "Leather Goods & Footwear",  
        "prior\_informal\_experience": true  
      }  
    }  
  \],  
  "top\_recommendations": \["LWS/Q0201", "LWS/Q0302"\]  
}

## **6\. Interoperability & External Government Integrations**

                       \+---------------------------------------+  
                       |    PM-AJAY Central Core Engine        |  
                       \+-------------------+-------------------+  
                                           |  
         \+---------------------------------+---------------------------------+  
         |                                 |                                 |  
\+--------v-------+                \+--------v-------+                \+--------v-------+  
|  Skill India   |                |    e-Shram     |                |  PFMS / DBT    |  
|  Digital (SIDH)|                |   Databases    |                |    Gateway     |  
\+----------------+                \+----------------+                \+----------------+  
  Pushes pre-enrolled              Validates existing               Tracks stipend  
  candidates directly              unorganized worker               and subsidy  
  into authorized                  welfare status via               disbursements  
  training partner queues.         secure API tokens.               under GIA scheme.

> 1. **Skill India Digital Hub (SIDH):** Secure REST integration using standardized OAuth2 credentials to push pre-enrolled candidate profiles straight to designated Training Partners (TPs).  
> 2. **e-Shram System:** Cross-checks registered unorganized worker profiles using tokenized identifiers, preventing duplicate registration for skilling stipends.  
> 3. **Local Government Directory (LGD):** Strict adherence to Census/LGD codes for administrative hierarchies (Village \$\\rightarrow\$ Gram Panchayat \$\\rightarrow\$ Block \$\\rightarrow\$ District \$\\rightarrow\$ State).

## **7\. Security, Privacy & Regulatory Compliance**

* **DPDP Act (2023) Compliance:** Explicit informed consent is gathered using voice verification at the beginning of the interaction (*"क्या आप अपने काम की जानकारी साझा करने की सहमति देते हैं?"*). The system supports full data purging on request.  
* **Data Residency & Localization:** All computing clusters, database backups, and speech processing queues reside inside domestic data centers in compliance with CERT-In directives.  
* **PII Masking:** Direct identifiers (phone numbers, full names) are decoupled from profile features via pseudonymization. Raw conversational recordings are scrubbed of numerical identifiers using automated regex/audio silencing before model analysis.  
* **Access Control:** Strict Role-Based Access Control (RBAC) enforced across Ministry administrators, District Welfare Officers (DWOs), and field support agencies.

## **8\. Deployment Architecture & Reliability**

| Infrastructure Component | Specification / Standard | SLA Target |
| :---- | :---- | :---- |
| **Compute Clusters** | Kubernetes (K8s) Cluster on MeitY-Empaneled CSP (Auto-scaling 2–32 worker nodes) | 99.9% uptime |
| **Audio Processing Queue** | Distributed message broker (RabbitMQ / Redis Sentinel) for asynchronous queuing | Max processing wait \< 2.5s |
| **Backup & Recovery** | Automated geo-redundant database snapshots every 6 hours | RPO \< 6 hours, RTO \< 1 hour |
| **Edge Caching** | Static assets and TTS pre-compiled prompts cached via National Content Delivery Networks | Latency \< 100ms nationwide |

## **9\. Phased Implementation Roadmap**

Phase 1: Alpha Core (Months 1–3)  
├── Setup Bhashini Indic STT/TTS pipeline for Hindi \+ 2 state languages  
├── Ingestion engine for IVR and WhatsApp voice notes  
└── NSQF static matching engine with pre-loaded QP catalogs

Phase 2: Pilot Ground Rollout (Months 4–6)  
├── Deploy in 5 Aspirational Districts with high SC concentration  
├── Field validation via CSC Village Level Entrepreneurs (VLEs)  
└── Calibration of recommendation accuracy against drop-out rates

Phase 3: Scale & System Integration (Months 7–12)  
├── Connect SIDH API and PM-AJAY GIA monitoring dashboards  
├── Full 22 scheduled language coverage with regional dialect models  
└── Nationwide rollout across State SC Development Corporations (SDCs)  
