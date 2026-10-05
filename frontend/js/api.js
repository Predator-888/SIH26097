/**
 * PM-AJAY AI Voice Assistant - API Service & High-Fidelity Standalone Mock Engine
 * Supports seamless offline/mock mode and live FastAPI backend connectivity (http://localhost:8000).
 */
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isBackendOnline = false;

    // Master NSQF Qualification Packs Catalog
    this.nsqfPacks = [
      {
        qp_code: "AGR/Q0108",
        trade_name: "Cotton Ginning & Processing Technician",
        trade_name_ahirani: "कापूस जिनिंग आणि प्रक्रिया कारागीर",
        trade_name_telugu: "పత్తి జిన్నింగ్ & ప్రాసెసింగ్ టెక్నీషియన్",
        sector_name: "Agriculture & Rural Processing",
        sector_icon: "🌾",
        nsqf_level: 4,
        duration_hours: 360,
        entry_qualification_minimum: "Class 8th",
        is_self_employment_oriented: true,
        stipend_monthly: "₹1,500/mo DBT Support",
        toolkit_support: "Free Ginning & Testing Toolkit (Govt GIA)",
        description: "Operation of modern cotton ginning machines, quality grading, seed separation, and fiber sorting. Crucial for Khandesh cotton belt.",
        syllabus_modules: [
          "Introduction to Cotton Fiber Classification & Moisture Testing",
          "Rotary Knife Gin & Saw Gin Machine Maintenance",
          "Baling, Pressing, and Safe Storage Protocols",
          "Occupational Health & Fire Safety in Ginning Mills",
          "Micro-Enterprise Accounting & Local Market Linkages"
        ],
        keywords: ["cotton", "ginning", "kapus", "farming", "patti", "fiber", "कापूस", "पత్తి"]
      },
      {
        qp_code: "ELE/Q5901",
        trade_name: "Solar Agriculture Pump Technician",
        trade_name_ahirani: "सौर कृषी पंप तंत्रज्ञ",
        trade_name_telugu: "సోలార్ అగ్రికల్చర్ పంప్ టెక్నీషియన్",
        sector_name: "Green Jobs & Renewable Energy",
        sector_icon: "☀️",
        nsqf_level: 4,
        duration_hours: 400,
        entry_qualification_minimum: "Class 8th with vocational aptitude",
        is_self_employment_oriented: true,
        stipend_monthly: "₹1,800/mo DBT Support",
        toolkit_support: "Free Solar Multimeter & Wiring Toolset",
        description: "Installation, testing, and maintenance of solar photovoltaic pumping systems for rural irrigation and PM-KUSUM integration.",
        syllabus_modules: [
          "Solar PV Array Layout & Shadow Analysis in Farm Fields",
          "DC/AC Solar Inverter & Submersible Pump Wiring",
          "Grid-Tied vs Standalone Controller Diagnostics",
          "Preventive Maintenance, Cleaning & Earthing Standards",
          "PM-KUSUM Subsidy Schemes & Customer Service"
        ],
        keywords: ["solar", "pump", "electricity", "irrigation", "motor", "सौर", "సోలార్", "విద్యుత్"]
      },
      {
        qp_code: "AMH/Q1001",
        trade_name: "Handloom Jacquard Weaver & Textile Artisan",
        trade_name_ahirani: "हातमाग विणकर आणि वस्त्र कारागीर",
        trade_name_telugu: "చేనేత జకార్డ్ నేత కార్మికుడు & వస్త్ర కళాకారుడు",
        sector_name: "Apparel, Made-Ups & Home Furnishing",
        sector_icon: "🧵",
        nsqf_level: 4,
        duration_hours: 450,
        entry_qualification_minimum: "Class 5th or traditional family craft",
        is_self_employment_oriented: true,
        stipend_monthly: "₹1,500/mo DBT Support",
        toolkit_support: "Free Jacquard Cards & Handloom Accessories",
        description: "Warping, jacquard card drafting, handloom setup, and weaving of traditional silk and cotton sarees (e.g. Mangalagiri & Khandesh weaves).",
        syllabus_modules: [
          "Yarn Count Verification & Loom Beam Preparation",
          "Jacquard Mechanism Attachment & Harness Tie-Up",
          "Traditional Motifs & Modern Color Forecasting",
          "Quality Inspection & Defect Rectification in Woven Cloth",
          "E-Commerce Marketplace Onboarding (GeM / ONDC / Tribes India)"
        ],
        keywords: ["handloom", "weaving", "textile", "sari", "chenetha", "magham", "हातमाग", "చేనేత"]
      },
      {
        qp_code: "FIC/Q7001",
        trade_name: "Chilli & Spice Processing Technician",
        trade_name_ahirani: "मिरची आणि मसाला प्रक्रिया कारागीर",
        trade_name_telugu: "మిరప మరియు సుగంధ ద్రవ్యాల ప్రాసెసింగ్ నిపుణుడు",
        sector_name: "Food Processing",
        sector_icon: "🌶️",
        nsqf_level: 3,
        duration_hours: 320,
        entry_qualification_minimum: "Class 8th",
        is_self_employment_oriented: true,
        stipend_monthly: "₹1,500/mo DBT Support",
        toolkit_support: "Hygienic Pulverizing & Vacuum Sealing Kit",
        description: "Grading, cleaning, drying, pulverizing, and packaging of red chilli and regional spice blends in Guntur and Deccan agro belts.",
        syllabus_modules: [
          "Raw Spice Sorting & Aflatoxin Detection Standards",
          "Solar Drying & Moisture Reduction Techniques",
          "Commercial Pulverizer Operation & Mesh Sizing",
          "Food Safety & FSSAI Packaging Compliance",
          "Self-Help Group (SHG) Collective Marketing"
        ],
        keywords: ["chilli", "spice", "food", "mirchi", "masala", "processing", "మిరప", "మసాలా"]
      },
      {
        qp_code: "AGR/Q4101",
        trade_name: "Small Livestock & Dairy Farm Manager",
        trade_name_ahirani: "शेळीपालन आणि दुग्ध व्यवसाय व्यवस्थापक",
        trade_name_telugu: "పాడి పరిశ్రమ & పశుపోషణ సహాయకుడు",
        sector_name: "Animal Husbandry & Dairy",
        sector_icon: "🐄",
        nsqf_level: 3,
        duration_hours: 300,
        entry_qualification_minimum: "Class 5th",
        is_self_employment_oriented: true,
        stipend_monthly: "₹1,400/mo DBT Support",
        toolkit_support: "Veterinary First-Aid & Milking Hygiene Kit",
        description: "Scientific rearing of cattle and goats, feed management, milk production, silage preparation, and veterinary hygiene.",
        syllabus_modules: [
          "Breed Selection for Local Climates (Osmanabadi, Murrah)",
          "Hydroponic Green Fodder & Silage Preservation",
          "Vaccination Scheduling & Mastitis Prevention",
          "Clean Milk Production & Fat Testing Equipment",
          "Dairy Cooperative Societies & Milk Chilling Center Links"
        ],
        keywords: ["dairy", "goat", "livestock", "milk", "dudh", "sheli", "పాడి", "మేకలు", "పాలు"]
      },
      {
        qp_code: "HCS/Q7301",
        trade_name: "Banana Fiber Products & Agro-Craft Artisan",
        trade_name_ahirani: "केळीच्या धाग्यापासून हस्तकला कारागीर",
        trade_name_telugu: "అరటి నార ఉత్పత్తుల తయారీ కళాకారుడు",
        sector_name: "Handicrafts and Carpet",
        sector_icon: "🧺",
        nsqf_level: 3,
        duration_hours: 300,
        entry_qualification_minimum: "Ability to read and write",
        is_self_employment_oriented: true,
        stipend_monthly: "₹1,500/mo DBT Support",
        toolkit_support: "Fiber Extraction Machine & Craft Tooling Kit",
        description: "Extracting fiber from banana pseudostem agricultural waste, rope spinning, handicraft baskets, and eco-friendly packaging.",
        syllabus_modules: [
          "Waste Pseudostem Collection & Raspador Machine Operation",
          "Fiber Washing, Degumming, and Natural Dyeing",
          "Braiding, Twisting, and Loom/Table Weaving",
          "Eco-Friendly Bags, Table Mats, and Handicraft Products",
          "Export Fair Certification & Artisan Credit Card Linkage"
        ],
        keywords: ["banana", "fiber", "craft", "waste to wealth", "keli", "arati", "हस्तकला", "చేతివృత్తులు"]
      },
      {
        qp_code: "AGR/Q1101",
        trade_name: "Micro-Irrigation & Drip System Installer",
        trade_name_ahirani: "ठिबक सिंचन तंत्रज्ञ",
        trade_name_telugu: "సూక్ష్మ సేద్యం & డ్రిప్ ఇరిగేషన్ టెక్నీషియన్",
        sector_name: "Agriculture Technology",
        sector_icon: "💧",
        nsqf_level: 4,
        duration_hours: 350,
        entry_qualification_minimum: "Class 8th",
        is_self_employment_oriented: true,
        stipend_monthly: "₹1,600/mo DBT Support",
        toolkit_support: "Pipe Fusion & Pressure Gauge Kit",
        description: "Laying drip lateral lines, screen filters, venturi injectors, pressure relief valves, and maintenance for water-efficient farming.",
        syllabus_modules: [
          "Soil Type & Topography Assessment for Water Discharge",
          "Mainline, Sub-main & Lateral Trenching and Fitting",
          "Venturi Fertigation Unit Installation",
          "Acid Treatment & Emitter Clogging Rectification",
          "PM Krishi Sinchayee Yojana (PMKSY) Documentation"
        ],
        keywords: ["drip", "irrigation", "water", "pipe", "thibak", "సేద్యం", "నీటిపారుదల"]
      },
      {
        qp_code: "CON/Q0103",
        trade_name: "Rural Mason & Habitat Infrastructure Builder",
        trade_name_ahirani: "ग्रामीण गवंडी कारागीर",
        trade_name_telugu: "గ్రామీణ మేస్త్రీ / భవన నిర్మాణ కార్మికుడు",
        sector_name: "Construction",
        sector_icon: "🧱",
        nsqf_level: 3,
        duration_hours: 400,
        entry_qualification_minimum: "Class 5th",
        is_self_employment_oriented: false,
        stipend_monthly: "₹1,500/mo DBT Support",
        toolkit_support: "Masonry Trowel, Plumb Bob & Laser Level Kit",
        description: "Bricklaying, plastering, sanitary soak-pit construction, and durable PM-Awas housing construction.",
        syllabus_modules: [
          "Foundation Trenching & PCC Bed Preparation",
          "Fly-Ash Brick / Compressed Earth Block Masonry",
          "Twin-Pit Toilet & Soak-Pit Sanitary Construction",
          "Bar Bending Basics & Lintel Concreting",
          "PMAY-Gramin Construction Standards & Geotagging"
        ],
        keywords: ["mason", "construction", "cement", "building", "gavandi", "మేస్త్రీ", "నిర్మాణం"]
      }
    ];

    // Master Training Centers Directory
    this.trainingCenters = [
      {
        center_id: "TC_MH_DHL_01",
        center_name: "PM-AJAY Kaushal Kendra (PMKK), Dhule",
        district: "Dhule",
        state: "Maharashtra",
        district_lgd_code: 472,
        distance_km: 4.8,
        contact_phone: "+91-2562-284901",
        address: "Survey No. 42/1, Near MIDC Avadhan, Dhule, Maharashtra 424006",
        offered_qp_codes: ["AGR/Q0108", "ELE/Q5901", "AGR/Q4101", "CON/Q0103"]
      },
      {
        center_id: "TC_MH_JLG_02",
        center_name: "Khandesh Agro & Banana Craft Skill Hub, Jalgaon",
        district: "Jalgaon",
        state: "Maharashtra",
        district_lgd_code: 473,
        distance_km: 12.4,
        contact_phone: "+91-257-2234502",
        address: "Agricultural College Road, Near NH-6, Jalgaon, Maharashtra 425001",
        offered_qp_codes: ["HCS/Q7301", "AGR/Q0108", "ELE/Q5901"]
      },
      {
        center_id: "TC_AP_GNT_01",
        center_name: "Skill India Training Hub & Spice Processing Center, Guntur",
        district: "Guntur",
        state: "Andhra Pradesh",
        district_lgd_code: 505,
        distance_km: 6.2,
        contact_phone: "+91-863-2345678",
        address: "Chilli Yard Bypass Road, Nallapadu, Guntur, Andhra Pradesh 522005",
        offered_qp_codes: ["FIC/Q7001", "AMH/Q1001", "AGR/Q1101", "ELE/Q5901"]
      },
      {
        center_id: "TC_TG_WRG_02",
        center_name: "Kakatiya Handloom & Rural Vocational Institute, Warangal",
        district: "Warangal",
        state: "Telangana",
        district_lgd_code: 535,
        distance_km: 14.5,
        contact_phone: "+91-870-2456789",
        address: "Weavers Cooperative Colony, Hanamkonda, Warangal, Telangana 506001",
        offered_qp_codes: ["AMH/Q1001", "ELE/Q5901", "AGR/Q4101"]
      }
    ];

    // District Economic Demand (DSDP)
    this.districtDemand = {
      "472": {
        district_name: "Dhule",
        state: "Maharashtra",
        language: "ahr-IN",
        high_demand_sectors: ["Agriculture & Rural Processing", "Green Jobs & Renewable Energy", "Animal Husbandry & Dairy"],
        priority_qp_weights: { "AGR/Q0108": 0.95, "ELE/Q5901": 0.90, "AGR/Q4101": 0.85, "HCS/Q7301": 0.70, "CON/Q0103": 0.75 }
      },
      "505": {
        district_name: "Guntur",
        state: "Andhra Pradesh",
        language: "te-IN",
        high_demand_sectors: ["Food Processing", "Agriculture Technology", "Apparel, Made-Ups & Home Furnishing"],
        priority_qp_weights: { "FIC/Q7001": 0.98, "AGR/Q1101": 0.90, "AMH/Q1001": 0.82, "ELE/Q5901": 0.75 }
      },
      "473": {
        district_name: "Jalgaon",
        state: "Maharashtra",
        language: "ahr-IN",
        high_demand_sectors: ["Handicrafts and Carpet", "Agriculture & Rural Processing", "Green Jobs & Renewable Energy"],
        priority_qp_weights: { "HCS/Q7301": 0.98, "AGR/Q0108": 0.92, "ELE/Q5901": 0.88, "AGR/Q4101": 0.70 }
      },
      "535": {
        district_name: "Warangal",
        state: "Telangana",
        language: "te-IN",
        high_demand_sectors: ["Apparel, Made-Ups & Home Furnishing", "Green Jobs & Renewable Energy", "Animal Husbandry & Dairy"],
        priority_qp_weights: { "AMH/Q1001": 0.96, "ELE/Q5901": 0.88, "AGR/Q4101": 0.82, "CON/Q0103": 0.70 }
      }
    };

    // Candidate Pre-Enrollment Queue for Admin Hub
    this.candidateQueue = [
      {
        id: "CAN_2026_01",
        name: "Ramesh Patil",
        phone: "+91-98765-43210",
        language: "ahr-IN",
        district: "Dhule",
        village: "Avadhan Gram Panchayat",
        education: "Class 8th Pass",
        selected_qp: "AGR/Q0108",
        trade_name: "Cotton Ginning & Processing Technician",
        center_name: "PMKK Avadhan, Dhule",
        match_score: 94,
        status: "FORWARDED_TO_SIDH",
        dpdp_consent: "VERIFIED_VOICE_STAMP",
        date: "2026-09-29 14:15"
      },
      {
        id: "CAN_2026_02",
        name: "Lakshmi Devi",
        phone: "+91-98231-87654",
        language: "te-IN",
        district: "Guntur",
        village: "Mangalagiri Rural",
        education: "Class 10th Pass",
        selected_qp: "AMH/Q1001",
        trade_name: "Handloom Jacquard Weaver & Artisan",
        center_name: "Skill India Hub, Guntur",
        match_score: 96,
        status: "FORWARDED_TO_SIDH",
        dpdp_consent: "VERIFIED_VOICE_STAMP",
        date: "2026-09-29 14:48"
      },
      {
        id: "CAN_2026_03",
        name: "Aniket Jadhav",
        phone: "+91-97645-12389",
        language: "mr-IN",
        district: "Jalgaon",
        village: "Savda Taluka",
        education: "Class 10th Pass",
        selected_qp: "HCS/Q7301",
        trade_name: "Banana Fiber Products & Agro-Craft",
        center_name: "Khandesh Agro Skill Hub, Jalgaon",
        match_score: 92,
        status: "BATCH_ENROLLED",
        dpdp_consent: "VERIFIED_VOICE_STAMP",
        date: "2026-09-29 15:10"
      },
      {
        id: "CAN_2026_04",
        name: "Suresh Chavan",
        phone: "+91-94215-67890",
        language: "ahr-IN",
        district: "Dhule",
        village: "Songir Village",
        education: "Class 8th Pass",
        selected_qp: "ELE/Q5901",
        trade_name: "Solar Agriculture Pump Technician",
        center_name: "PMKK Avadhan, Dhule",
        match_score: 91,
        status: "PENDING_VERIFICATION",
        dpdp_consent: "VERIFIED_VOICE_STAMP",
        date: "2026-09-29 15:45"
      },
      {
        id: "CAN_2026_05",
        name: "Venkatesh Rao",
        phone: "+91-91002-34567",
        language: "te-IN",
        district: "Guntur",
        village: "Tenali Ward 4",
        education: "Class 8th Pass",
        selected_qp: "FIC/Q7001",
        trade_name: "Chilli & Spice Processing Technician",
        center_name: "Skill India Hub, Guntur",
        match_score: 89,
        status: "FORWARDED_TO_SIDH",
        dpdp_consent: "VERIFIED_VOICE_STAMP",
        date: "2026-09-29 16:02"
      }
    ];

    // Local in-memory session states
    this.activeSessions = {};
  }

  // --- Live Backend Health Check ---
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        this.isBackendOnline = true;
        return await response.json();
      }
    } catch (e) {
      this.isBackendOnline = false;
    }
    return null;
  }

  // --- Session Management ---
  async startSession(channel, language, phoneNumber = null) {
    try {
      const response = await fetch(`${this.baseUrl}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, preferred_language: language, phone_number: phoneNumber })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('[API] Backend offline. Using high-fidelity standalone mock session.');
    }
    return this._mockStartSession(channel, language);
  }

  // --- Audio / Turn Processing ---
  async processAudio(sessionId, { audioBase64 = null, textFallback = null }) {
    try {
      const response = await fetch(`${this.baseUrl}/session/${sessionId}/process-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: audioBase64, text_fallback: textFallback })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('[API] Backend offline. Using intelligent standalone conversational engine.');
    }
    return this._mockProcessTurn(sessionId, textFallback);
  }

  // --- Enrollment ---
  async enrollBeneficiary(beneficiaryId, enrollmentData) {
    try {
      const response = await fetch(`${this.baseUrl}/beneficiary/${beneficiaryId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentData)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('[API] Backend offline. Recording candidate in local SIDH queue.');
    }

    // Add to local queue
    const matchedQP = this.nsqfPacks.find(q => q.qp_code === enrollmentData.qpCode) || this.nsqfPacks[0];
    const newCandidate = {
      id: "CAN_" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: enrollmentData.beneficiaryName || "Ramesh Patil",
      phone: enrollmentData.phoneNumber || "+91-98765-XXXXX",
      language: enrollmentData.language || "ahr-IN",
      district: enrollmentData.district || "Dhule",
      village: enrollmentData.village || "Avadhan",
      education: enrollmentData.education || "Class 8th Pass",
      selected_qp: matchedQP.qp_code,
      trade_name: matchedQP.trade_name,
      center_name: enrollmentData.centerName || "PMKK Avadhan, Dhule",
      match_score: 94,
      status: "FORWARDED_TO_SIDH",
      dpdp_consent: "VERIFIED_VOICE_STAMP",
      date: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };
    this.candidateQueue.unshift(newCandidate);

    return {
      status: "SUCCESS",
      application_id: newCandidate.id,
      candidate: newCandidate,
      message: "Candidate pre-enrolled and forwarded to Skill India Digital Hub (SIDH)."
    };
  }

  // --- NSQF Catalog & Data Getters ---
  getAllNsqfPacks() {
    return this.nsqfPacks;
  }

  getTrainingCenters() {
    return this.trainingCenters;
  }

  getDistrictDemand() {
    return this.districtDemand;
  }

  getCandidateQueue() {
    return this.candidateQueue;
  }

  async getAdminStats() {
    return {
      kpis: {
        total_beneficiary_sessions: 1420 + this.candidateQueue.length,
        total_pre_enrolled: 892 + this.candidateQueue.length,
        avg_suitability_score: 91.4,
        dpdp_consent_rate: 98.9,
        districts_covered: 5,
        training_centers_active: 8
      },
      queue: this.candidateQueue
    };
  }

  // --- Standalone Conversational State Machine ---
  _mockStartSession(channel, language) {
    const isAhr = language === 'ahr-IN';
    const isTel = language === 'te-IN';
    const sessId = 'sess_' + Math.random().toString(36).substr(2, 9);

    const initialPrompt = isAhr
      ? "राम राम! मी गव्हर्मेंटच्या पीएम-अजय योजनेतून बोलस. तुमाले मोफत काम-धंद्याचं आणि ट्रेनिंगचं माहिती विचारायला तुमची संमती चालस का? बोला, हो किंवा नाही?"
      : (isTel
        ? "నమస్కారం! నేను పీఎం-అజయ్ ప్రభుత్వ పథకం నుండి మాట్లాడుతున్నాను. ఉచిత నైపుణ్య శిక్షణ మరియు ఉపాధి వివరాలు తెలుసుకోవడానికి మీ సమ్మతి ఉందా? అవును లేదా కాదు అని చెప్పండి."
        : "नमस्ते! मैं पीएम-अजय योजना से बोल रहा हूँ। आजीविका और कौशल प्रशिक्षण के लिए क्या आपकी सहमति है? कृपया हाँ या ना कहें।");

    this.activeSessions[sessId] = {
      step: 0,
      language: language,
      channel: channel,
      entities: {
        district: isTel ? "Guntur" : "Dhule",
        village: "",
        education: "",
        trade_interest: "",
        mobility_km: 10,
        modality: "SELF_EMPLOYMENT"
      }
    };

    return {
      session_id: sessId,
      status: 'GREETING_AND_CONSENT',
      preferred_language: language,
      initial_prompt_text: initialPrompt,
      initial_prompt_audio: null
    };
  }

  _mockProcessTurn(sessionId, userText) {
    const session = this.activeSessions[sessionId] || {
      step: 0,
      language: 'ahr-IN',
      entities: { district: "Dhule", education: "", trade_interest: "", mobility_km: 10, modality: "SELF_EMPLOYMENT" }
    };

    session.step++;
    const isAhr = session.language === 'ahr-IN';
    const isTel = session.language === 'te-IN';
    const textLower = (userText || "").toLowerCase();

    let aiResponse = "";
    let extracted = session.entities;
    let recs = [];
    let isCompleted = false;

    if (session.step === 1) {
      // Identity & Location question
      aiResponse = isAhr
        ? "खूप छान! तुमची संमती नोंदवली गेली आहे. तुम्ही कोणतं गाव किंवा तालुक्यातून बोलस? आणि तुमचं शुभ नाव काय आहे?"
        : (isTel
          ? "చాలా మంచిది! మీ సమ్మతి నమోదు చేయబడింది. మీరు ఏ గ్రామం లేదా మండలం నుండి మాట్లాడుతున్నారు? మీ పేరు ఏమిటి?"
          : "बहुत अच्छा! आपकी सहमति दर्ज की गई है। आप किस गाँव या जिले से बोल रहे हैं?");
      extracted.consent_recorded = true;
    } else if (session.step === 2) {
      // Education question
      if (textLower.includes("धुळे") || textLower.includes("अवधा") || textLower.includes("dhule")) {
        extracted.district = "Dhule";
        extracted.village = "Avadhan Gram Panchayat";
      } else if (textLower.includes("గుంటూరు") || textLower.includes("మంగళగిరి") || textLower.includes("guntur")) {
        extracted.district = "Guntur";
        extracted.village = "Mangalagiri Rural";
      }
      aiResponse = isAhr
        ? "धन्यवाद! तुमचं शिक्षण कितवीपर्यंत झालं आहे? (उदा. आठवी, दहावी किंवा बारावी?)"
        : (isTel
          ? "ధన్యవాదాలు! మీ చదువు ఎక్కడి వరకు సాగింది? (ఉదా. 8వ తరగతి, 10వ తరగతి లేదా ఇంటర్?)"
          : "धन्यवाद! आपकी शैक्षिक योग्यता क्या है? (जैसे 8वीं, 10वीं पास?)");
    } else if (session.step === 3) {
      // Work / Traditional Skills question
      if (textLower.includes("आठवी") || textLower.includes("8th") || textLower.includes("8")) {
        extracted.education = "Class 8th Pass";
      } else if (textLower.includes("दहावी") || textLower.includes("10") || textLower.includes("పదవ")) {
        extracted.education = "Class 10th Pass";
      } else {
        extracted.education = "Class 8th Pass";
      }
      aiResponse = isAhr
        ? "समजलं! तुमच्या घरी किंवा शेतात आता कोणतं काम-धंदा चालस? आणि तुम्हाला पुढे नवीन काय शिकायची आवड आहे?"
        : (isTel
          ? "అర్థమైంది! ప్రస్తుతం మీ కుటుంబంలో ఎలాంటి పనులు లేదా చేతివృత్తులు చేస్తున్నారు? మీకు భవిష్యత్తులో ఏ రంగంలో శిక్షణ కావాలి?"
          : "आपके परिवार में अभी कौन सा पारंपरिक काम या व्यवसाय होता है? और आप क्या नया सीखना चाहते हैं?");
    } else if (session.step === 4) {
      // Mobility & Modality question
      extracted.trade_interest = userText || "Agriculture & Solar";
      aiResponse = isAhr
        ? "छान! तुम्हाला स्वतःचा व्यवसाय सुरू करायचा आहे की नोकरी? आणि ट्रेनिंगसाठी घरापासून किती किलोमीटर प्रवास चालंल?"
        : (isTel
          ? "చాలా మంచి ఆసక్తి! మీరు స్వయం ఉపాధి (స్వంత వ్యాపారం) కోరుకుంటున్నారా లేక ఉద్యోగం కావాలా? మీ గ్రామం నుండి ఎంత దూరం వరకు వెళ్లగలరు?"
          : "आप खुद का व्यवसाय चाहते हैं या नौकरी? और ट्रेनिंग के लिए कितनी दूरी तक जा सकते हैं?");
    } else {
      // Final Recommendation step!
      isCompleted = true;
      if (textLower.includes("व्यवसाय") || textLower.includes("स्वयं") || textLower.includes("self")) {
        extracted.modality = "SELF_EMPLOYMENT";
      }
      if (textLower.includes("दहा") || textLower.includes("10") || textLower.includes("పది")) {
        extracted.mobility_km = 10;
      } else {
        extracted.mobility_km = 15;
      }

      // Generate scored recommendations
      recs = this._generateScoredRecommendations(session.language, extracted);

      aiResponse = isAhr
        ? `तुमच्या कौशल्यांचे विश्लेषण पूर्ण झाले आहे! PM-AJAY योजनेअंतर्गत धुळे जिल्ह्यातील जवळच्या PMKK केंद्रावर तुमच्यासाठी ३ प्रमुख कोर्सेस निवडले आहेत. खालील यादी तपासा आणि मोफत प्रवेश निश्चित करा.`
        : (isTel
          ? `మీ నైపుణ్యాల విశ్లేషణ పూర్తయింది! PM-AJAY పథకం కింద మీ ఆసక్తులకు సరిపోయే 3 అగ్రశ్రేణి ఉచిత NSQF కోర్సులు సిద్ధంగా ఉన్నాయి. క్రింది వివరాలు చూసి మీ ఉచిత ప్రవేశాన్ని నమోదు చేసుకోండి.`
          : `आपके कौशल का विश्लेषण पूरा हुआ! आपके लिए टॉप 3 NSQF कोर्स अनुशंसित हैं।`);
    }

    return {
      user_transcript: userText || "होय",
      ai_response_text: aiResponse,
      current_state: isCompleted ? "RECOMMENDATIONS_READY" : `STEP_${session.step}`,
      extracted_entities: extracted,
      is_completed: isCompleted,
      recommendations: recs
    };
  }

  _generateScoredRecommendations(lang, entities) {
    const isTel = lang === 'te-IN';
    const isAhr = lang === 'ahr-IN';

    if (isTel) {
      return [
        {
          qp_code: "AMH/Q1001",
          trade_name: "Handloom Jacquard Weaver & Artisan",
          trade_name_localized: "చేనేత జకార్డ్ నేత కార్మికుడు & వస్త్ర కళాకారుడు",
          sector_name: "Apparel, Made-Ups & Home Furnishing",
          nsqf_level: 4,
          suitability_score: 0.96,
          justification: "సంప్రదాయ చేనేత నైపుణ్యాలకు మరియు గుంటూరు ప్రాంత మార్కెట్ డిమాండ్‌కు 96% సరిపోలిక. స్వయం ఉపాధికి ప్రత్యేక కిట్ అందుబాటులో ఉంది.",
          stipend: "₹1,500/నెల DBT మద్దతు + ఉచిత టూల్‌కిట్",
          training_center: this.trainingCenters[2]
        },
        {
          qp_code: "FIC/Q7001",
          trade_name: "Chilli & Spice Processing Technician",
          trade_name_localized: "మిరప మరియు సుగంధ ద్రవ్యాల ప్రాసెసింగ్ నిపుణుడు",
          sector_name: "Food Processing",
          nsqf_level: 3,
          suitability_score: 0.93,
          justification: "గుంటూరు జిల్లా డిస్ట్రిక్ట్ స్కిల్ ప్లాన్ (DSDP) ప్రాధాన్యత ప్రకారం అత్యధిక డిమాండ్ ఉన్న వ్యవసాయ ఆహార ప్రాసెసింగ్ కోర్సు.",
          stipend: "₹1,500/నెల DBT మద్దతు + సర్టిఫికేషన్",
          training_center: this.trainingCenters[2]
        },
        {
          qp_code: "ELE/Q5901",
          trade_name: "Solar Agriculture Pump Technician",
          trade_name_localized: "సోలార్ అగ్రికల్చర్ పంప్ టెక్నీషియన్",
          sector_name: "Green Jobs & Renewable Energy",
          nsqf_level: 4,
          suitability_score: 0.88,
          justification: "గ్రామీణ ప్రాంతాల్లో సోలార్ పంపింగ్ వ్యవస్థల నిర్వహణకు PM-KUSUM పథకంతో అనుసంధానించబడిన కోర్సు.",
          stipend: "₹1,800/నెల DBT మద్దతు + సోలార్ టూల్‌కిట్",
          training_center: this.trainingCenters[2]
        }
      ];
    }

    // Default: Ahirani / Maharashtra
    return [
      {
        qp_code: "AGR/Q0108",
        trade_name: "Cotton Ginning & Processing Technician",
        trade_name_localized: "कापूस जिनिंग आणि प्रक्रिया कारागीर",
        sector_name: "Agriculture & Rural Processing",
        nsqf_level: 4,
        suitability_score: 0.94,
        justification: "खानदेश कापूस पट्ट्यातील स्थानिक औद्योगिक मागणी आणि अवधान MIDC मधील जिनिंग मिल्सशी 94% अचूक जुळणी. आठवी पास पात्रता पूर्ण.",
        stipend: "₹1,500/महिना थेट बँक खात्यात (DBT) + मोफत टूलकिट",
        training_center: this.trainingCenters[0]
      },
      {
        qp_code: "ELE/Q5901",
        trade_name: "Solar Agriculture Pump Technician",
        trade_name_localized: "सौर कृषी पंप तंत्रज्ञ",
        sector_name: "Green Jobs & Renewable Energy",
        nsqf_level: 4,
        suitability_score: 0.91,
        justification: "धुळे जिल्ह्यातील PM-KUSUM सौर कृषी पंप विस्तार आणि स्थानिक शेतकरी दुरुस्ती मागणीसाठी 91% उपयुक्तता. स्वयंरोजगारासाठी उत्तम संधी.",
        stipend: "₹1,800/महिना थेट बँक खात्यात + डिजिटल मल्टीमीटर टूलकिट",
        training_center: this.trainingCenters[0]
      },
      {
        qp_code: "AGR/Q4101",
        trade_name: "Small Livestock & Dairy Farm Manager",
        trade_name_localized: "शेळीपालन आणि दुग्ध व्यवसाय व्यवस्थापक",
        sector_name: "Animal Husbandry & Dairy",
        nsqf_level: 3,
        suitability_score: 0.86,
        justification: "कमी जमिनीच्या शेतमजुरांसाठी घरच्या घरी दुग्ध व्यवसाय आणि शेळीपालनातून शाश्वत उपजीविका निर्माण करण्यासाठी 86% अनुकूल.",
        stipend: "₹1,400/महिना + पशुवैद्यकीय प्रथमोपचार किट",
        training_center: this.trainingCenters[0]
      }
    ];
  }
}

// Global Singleton Export
window.apiService = new ApiService();
