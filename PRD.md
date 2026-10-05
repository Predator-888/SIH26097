

# **Product Requirements Document (PRD)**

**Project Title:** AI-Driven Voice Assistant for Livelihood Mapping & NSQF-Aligned Skilling (PM-AJAY)  
**Problem Statement ID:** 26097  
**Organization:** Ministry of Social Justice and Empowerment (MoSJE)  
**Theme:** Agriculture, FoodTech & Rural Development

## **1\. Executive Summary**

The Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY) requires a digital intervention to improve the effectiveness of its Grant-in-Aid (GIA) component. Currently, beneficiaries face barriers to entry—like low digital literacy and language constraints—resulting in a mismatch between the training they receive and their actual livelihood opportunities.  
This product will be an empathetic, AI-driven, multilingual voice assistant that replaces traditional text-heavy forms. It will map beneficiaries' skills and interests through natural conversation and recommend localized, NSQF-aligned (National Skills Qualifications Framework) livelihood pathways, bridging the gap between ambition, ability, and market demand.

## **2\. Problem & Background**

### **2.1 Core Pain Points**

* **Accessibility Barriers:** Target beneficiaries (Scheduled Caste communities) often struggle with low digital literacy, language barriers, and complex text-based forms.  
* **Aspiration vs. Reality Mismatch:** Beneficiaries are often enrolled in training programs that do not match their interests, physical mobility, or local market demand, leading to high dropout rates and poor post-training job placement.  
* **Operational Bottlenecks (GIA Component):** Lack of strategic roadmap planning, issues identifying trained consultants, poor post-skilling job placement, and coordination friction among departments and ground-level teams.

## **3\. Product Vision & Objectives**

**Vision:** To democratize access to livelihood planning for SC communities by providing a frictionless, voice-first digital assistant that acts as a personalized career and skilling counselor in their native language.  
**Objectives:**

> 1. Collect qualitative and quantitative user profiling data strictly through conversational voice interfaces.  
> 2. Utilize AI/ML to map user data against regional economic opportunities.  
> 3. Recommend highly suitable, NSQF-aligned training programs.  
> 4. Operate reliably in low-connectivity environments (IVR, WhatsApp, Kiosks).

## **4\. Target Personas**

* **Persona A: Feature Phone User (e.g., Rural Agricultural Worker)**  
  * *Traits:* Low literacy, speaks only local dialect, possesses a basic feature phone (no internet).  
  * *Needs:* Requires access via a simple phone call (IVR); needs empathetic, slow-paced interaction.  
* **Persona B: Smartphone Novice (e.g., Traditional Artisan/Youth)**  
  * *Traits:* Uses WhatsApp for basic communication, prefers sending voice notes over typing.  
  * *Needs:* Wants to interact on WhatsApp using voice, expecting quick, relevant training recommendations nearby.

## **5\. Functional Requirements (Key Features)**

### **5.1 Voice-First Conversational Interface**

* **Multilingual Support:** Must support major regional Indian languages and local dialects (Integration with APIs like Bhashini recommended).  
* **Empathetic NLP:** The system must converse in a conversational, non-administrative tone (e.g., *"Namaste, tell me a bit about what kind of work you do at home?"* instead of *"State your current occupation"*).  
* **Dynamic Interviewing:** AI dynamically generates the next question based on previous answers, specifically collecting:  
  * Educational background & existing family occupations.  
  * Current livelihood activities & skills.  
  * Mobility/physical constraints & employment preferences (self-employed vs. wage).

### **5.2 Omnichannel Deployment Strategy**

The solution must function in low-tech/low-connectivity areas via:

* **IVR Integration:** Users can dial a toll-free number and speak to the AI via standard cellular networks (crucial for feature phones).  
* **WhatsApp Voice-Bot:** Users can send voice notes to a dedicated WhatsApp number and receive voice/text replies.  
* **Kiosk / Lightweight Mobile App:** A low-bandwidth progressive web app (PWA) for localized CSC (Common Service Centers) or ground support teams.

### **5.3 AI/ML Profiling & Recommendation Engine**

* **Profile Generation:** Transcribes and synthesizes unstructured voice inputs into structured demographic and skill-based profiles.  
* **Gap Assessment:** Identifies the gap between a user's current skill level and their desired trade.  
* **NSQF Recommendation Engine:** Matches the generated profile against a database of NSQF-aligned training programs.  
* **Geo-localized Mapping:** Filters recommendations based on the user’s local economic reality and physical mobility constraints.

## **6\. User Journey (Happy Path via WhatsApp/IVR)**

> 1. **Initiation:** Beneficiary gives a missed call or sends a "Hi" voice note on WhatsApp.  
> 2. **Greeting & Language Selection:** Assistant greets in the regional language and confirms the preferred dialect.  
> 3. **Conversational Profiling:** Assistant asks 4 to 5 friendly questions one by one. User replies with voice notes.  
> 4. **Analysis:** The AI processes the audio (Speech-to-Text \-\> NLP Entity Extraction \-\> ML Recommendation).  
> 5. **Recommendation Presentation:** The Assistant replies with voice notes detailing the top 2-3 matched NSQF skilling courses nearby.  
> 6. **Action/Enrollment:** User verbally confirms interest. Assistant logs the pre-enrollment data for the PM-AJAY ground team to facilitate the final registration.

## **7\. Technical Architecture Considerations**

* **Voice Processing (STT/TTS):** Must handle heavy accents, background noise, and code-mixing (e.g., Hindi mixed with English words).  
* **Conversational AI (LLM / NLP):** Secure, sandboxed LLM optimized for conversational flow and context retention over a short session.  
* **Data Structure:** A graph or relational database mapping NSQF roles with required skills, geographic viability, and physical requirements.

## **8\. Success Metrics (KPIs)**

* **Engagement Rate:** Number of users who complete the conversational profile vs. those who drop off mid-conversation.  
* **Recommendation Accuracy:** Percentage of users who accept the AI's top-recommended skilling pathway.  
* **Placement Improvement:** Long-term metric tracking the reduction in drop-out rates for AI-counseled users vs. traditional form-counseled users.  
* **System Latency:** Voice response delay (needs to be \< 3 seconds to feel conversational).