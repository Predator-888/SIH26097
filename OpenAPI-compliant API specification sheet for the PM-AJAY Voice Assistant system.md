Here is the OpenAPI-compliant API specification sheet for the PM-AJAY Voice Assistant system. It covers the omnichannel ingestion webhooks, the conversational processing engine, and the NSQF recommendation retrieval endpoints.

YAML  
openapi: 3.0.3  
info:  
  title: PM-AJAY Voice Assistant API  
  description: Core backend API for the AI-Driven Voice Assistant for Livelihood Mapping & NSQF-Aligned Skilling Recommendations (SIH 2026 \- ID 26097).  
  version: 1.0.0  
  contact:  
    name: API Support  
    url: https://socialjustice.gov.in  
servers:  
  \- url: https://api.pm-ajay-livelihood.gov.in/v1  
    description: Production Server (MeitY-Empaneled Cloud)  
  \- url: https://staging.api.pm-ajay-livelihood.gov.in/v1  
    description: Staging Server  
tags:  
  \- name: Webhooks  
    description: Ingestion endpoints for omnichannel communication (WhatsApp, IVR)  
  \- name: Conversational AI  
    description: Audio processing, intent extraction, and state management  
  \- name: Profiling & Recommendations  
    description: Beneficiary data and NSQF-aligned skilling matches

paths:  
  /webhook/whatsapp:  
    post:  
      tags:  
        \- Webhooks  
      summary: WhatsApp Incoming Message Webhook  
      description: Webhook endpoint for Meta/WhatsApp Business API to push incoming user voice notes or texts.  
      requestBody:  
        required: true  
        content:  
          application/json:  
            schema:  
              \$ref: '\#/components/schemas/WhatsAppWebhookPayload'  
      responses:  
        '200':  
          description: Webhook received and queued for processing successfully.

  /webhook/ivr:  
    post:  
      tags:  
        \- Webhooks  
      summary: IVR Audio Ingestion Webhook  
      description: Endpoint for telephony providers (e.g., Exotel) to send recorded audio chunks from feature phone calls.  
      requestBody:  
        required: true  
        content:  
          application/json:  
            schema:  
              \$ref: '\#/components/schemas/IVRWebhookPayload'  
      responses:  
        '200':  
          description: Audio received and queued.  
          content:  
            application/json:  
              schema:  
                \$ref: '\#/components/schemas/IVRActionResponse'

  /session/start:  
    post:  
      tags:  
        \- Conversational AI  
      summary: Initialize a new conversational session  
      description: Starts a new dialogue state machine for a beneficiary interaction via the Kiosk/PWA.  
      requestBody:  
        required: true  
        content:  
          application/json:  
            schema:  
              type: object  
              properties:  
                channel:  
                  type: string  
                  enum: \[KIOSK, WHATSAPP, IVR\]  
                preferred\_language:  
                  type: string  
                  example: "hi-IN"  
      responses:  
        '201':  
          description: Session created.  
          content:  
            application/json:  
              schema:  
                \$ref: '\#/components/schemas/SessionResponse'

  /session/{session\_id}/process-audio:  
    post:  
      tags:  
        \- Conversational AI  
      summary: Process inbound user audio  
      description: Accepts raw/base64 audio, passes it through Bhashini STT, extracts entities via LLM, and returns the next TTS prompt.  
      parameters:  
        \- name: session\_id  
          in: path  
          required: true  
          schema:  
            type: string  
      requestBody:  
        required: true  
        content:  
          application/json:  
            schema:  
              type: object  
              properties:  
                audio\_base64:  
                  type: string  
                  description: Base64 encoded audio string (16-bit PCM).  
      responses:  
        '200':  
          description: Audio processed successfully with AI response.  
          content:  
            application/json:  
              schema:  
                \$ref: '\#/components/schemas/DialogueResponse'

  /beneficiary/{beneficiary\_id}/recommendations:  
    get:  
      tags:  
        \- Profiling & Recommendations  
      summary: Get NSQF skilling recommendations  
      description: Triggers the Scikit-Learn matching engine to evaluate the beneficiary's extracted profile against the NSQF database and local geography.  
      parameters:  
        \- name: beneficiary\_id  
          in: path  
          required: true  
          schema:  
            type: string  
            format: uuid  
      responses:  
        '200':  
          description: List of matched livelihood pathways.  
          content:  
            application/json:  
              schema:  
                type: array  
                items:  
                  \$ref: '\#/components/schemas/Recommendation'

components:  
  schemas:  
    WhatsAppWebhookPayload:  
      type: object  
      properties:  
        object:  
          type: string  
          example: "whatsapp\_business\_account"  
        entry:  
          type: array  
          items:  
            type: object  
              
    IVRWebhookPayload:  
      type: object  
      properties:  
        CallSid:  
          type: string  
        From:  
          type: string  
        RecordingUrl:  
          type: string  
          format: uri  
            
    IVRActionResponse:  
      type: object  
      properties:  
        action:  
          type: string  
          example: "play\_audio"  
        audio\_url:  
          type: string  
          format: uri  
            
    SessionResponse:  
      type: object  
      properties:  
        session\_id:  
          type: string  
          example: "sess\_89f41b2c"  
        status:  
          type: string  
          example: "AWAITING\_CONSENT"  
            
    DialogueResponse:  
      type: object  
      properties:  
        user\_transcript:  
          type: string  
          description: STT output from Bhashini.  
          example: "मैं खेती का काम करता हूँ"  
        ai\_response\_text:  
          type: string  
          description: Generated response to be synthesized.  
        ai\_tts\_audio:  
          type: string  
          description: Base64 encoded TTS audio generated by Bhashini.  
        current\_state:  
          type: string  
          example: "SKILL\_PROBING"  
        extracted\_entities:  
          type: object  
          description: Structured data pulled from the conversation so far.  
            
    Recommendation:  
      type: object  
      properties:  
        qp\_code:  
          type: string  
          example: "AGR/Q0101"  
        trade\_name:  
          type: string  
          example: "Organic Grower"  
        nsqf\_level:  
          type: integer  
          example: 4  
        suitability\_score:  
          type: number  
          format: float  
          example: 0.92  
        justification:  
          type: string  
          example: "Matches existing agricultural background; training center available within 10km radius."

### **Key API Workflow Highlights**

> 1. **Omnichannel Ingestion:** The /webhook/whatsapp and /webhook/ivr endpoints are designed to accept asynchronous callbacks from telecom providers and messaging platforms, isolating the core AI engine from protocol-specific overhead.  
> 2. **Stateful Conversations:** The /session/start and /session/{session\_id}/process-audio endpoints manage the state machine. The backend tracks whether the AI is currently asking about *education*, *mobility*, or *skills* (stored in a MongoDB document).  
> 3. **Real-Time Recommendations:** The /beneficiary/{beneficiary\_id}/recommendations endpoint is called at the end of the voice flow. It executes the Scikit-Learn pipeline to rank the National Qualifications Register (NQR) database against the dynamically built user profile.