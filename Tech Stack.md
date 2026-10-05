

# **Tech Stack Architecture Document**

**Project:** AI-Driven Voice Assistant for Livelihood Mapping  
**Problem Statement ID:** 26097

## **1\. Omnichannel Communication & User Interface**

To reach users in low-connectivity environments and provide seamless interfaces, the system relies on external communication APIs and lightweight web apps.

* **WhatsApp Integration:** **WhatsApp Business API** (via Twilio or Meta directly) for processing incoming and outgoing voice notes.  
* **IVR (Interactive Voice Response):** **Exotel** or **Twilio Voice** to handle standard cellular phone calls for feature phone users.  
* **Kiosk / Web App Frontend:** **Next.js / React** to build lightweight Progressive Web Apps (PWAs) for ground workers, ensuring fast load times even on slow networks.  
* **Content Management:** **Sanity.io** to manage localized UI text, FAQs, and dynamic content for the frontend without redeploying code.

## **2\. Artificial Intelligence & Machine Learning Layer**

This is the core engine responsible for understanding regional dialects, interpreting aspirations, and matching them with local opportunities.

* **Large Language Model (LLM):** **Google AI (Gemini API)** to power the conversational logic, extract structured entities (like education, skills, and constraints) from the user's unstructured spoken input, and generate empathetic responses.  
* **Speech-to-Text & Text-to-Speech:** **Bhashini API** (the Government of India's National Language Translation Mission) for robust handling of regional Indian languages and local dialects.  
* **Recommendation Engine:** **Scikit-Learn** in Python to build custom machine learning models (like clustering and similarity matching) that map the user's extracted profile against the available NSQF livelihood pathways.

## **3\. Backend & Core Application Logic**

The backend must orchestrate the AI models, handle API webhooks from WhatsApp/IVR, and manage the business logic.

* **Backend Framework:** **Python** using **FastAPI** or **Flask**. Python is ideal for natively integrating with Scikit-Learn and AI APIs while providing fast, asynchronous endpoint handling for incoming voice messages.

## **4\. Database Architecture**

A hybrid database approach ensures flexibility for unstructured profiling data and strict relational integrity for the NSQF skilling data.

* **NoSQL Database:** **MongoDB** for storing the dynamic, unstructured conversational logs and user profiles generated during the voice interviews.  
* **Relational Database:** **Supabase** (PostgreSQL) to store structured, tabular data such as the official NSQF training program catalogs, regional job market data, and geographical mapping.

## **5\. Deployment & DevOps**

* **Frontend Hosting:** **Vercel** for deploying the Next.js Kiosk application and Sanity.io studio, providing edge caching and fast content delivery.  
* **Backend Hosting:** **Google Cloud Platform (GCP)** or **AWS** for hosting the Python backend services and custom ML models to ensure scalability during high traffic.  
* **Version Control & CI/CD:** **GitHub** for repository management and automated deployment pipelines.