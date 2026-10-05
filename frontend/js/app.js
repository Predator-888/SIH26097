/**
 * PM-AJAY AI Voice Assistant - Complete Application Controller
 * Handles CSC Kiosk, WhatsApp simulator, IVR telephony with DTMF synthesis,
 * NSQF Catalog explorer, DWO Admin Hub, Pre-Enrollment Slip generation, and accessibility.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  let currentLanguage = 'ahr-IN';
  let currentSession = null;
  let isRecording = false;
  let lastAssistantSpeech = '';
  let speechCadence = 0.9;
  let activeTab = 'kiosk';

  // IVR Telephony State
  let ivrTimerInterval = null;
  let ivrSeconds = 0;
  let isIvrCallActive = false;
  let ivrAudioCtx = null;

  // Selected item state for modals
  let currentSelectedQp = null;
  let currentBeneficiary = null;

  // =========================================================================
  // DOM ELEMENT REFERENCES
  // =========================================================================
  // Header & Accessibility
  const langSelect = document.getElementById('languageSelect');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const viewPanels = document.querySelectorAll('.view-panel');
  const apiStatusBadge = document.getElementById('apiStatusBadge');
  const dialectPill = document.getElementById('currentDialectLabel');
  const btnToggleContrast = document.getElementById('btnToggleContrast');
  const btnTextDec = document.getElementById('btnTextDec');
  const btnTextReset = document.getElementById('btnTextReset');
  const btnTextInc = document.getElementById('btnTextInc');
  const audioCadenceSelect = document.getElementById('audioCadenceSelect');
  const spokespersonSelect = document.getElementById('spokespersonSelect');
  const btnTestVoice = document.getElementById('btnTestVoice');
  const btnQuickTestVoice = document.getElementById('btnQuickTestVoice');
  const vsBtns = document.querySelectorAll('.vs-btn');
  const assistantNameEl = document.getElementById('assistantName');

  // Kiosk Controls & Visualizer
  const micBtn = document.getElementById('micBtn');
  const micLabel = document.getElementById('micLabel');
  const replayBtn = document.getElementById('replayAudioBtn');
  const glowOrb = document.getElementById('glowOrb');
  const soundWaves = document.getElementById('soundWaves');
  const statusTicker = document.getElementById('statusTicker');
  const chatStream = document.getElementById('chatStream');
  const manualTextInput = document.getElementById('manualTextInput');
  const sendTextBtn = document.getElementById('sendTextBtn');
  const sessionTag = document.getElementById('sessionDisplayTag');
  const btnClearChat = document.getElementById('btnClearChat');
  const recContainer = document.getElementById('recommendationsContainer');
  const recGrid = document.getElementById('recGrid');
  const recCountBadge = document.getElementById('recCountBadge');

  // Profiler Scorecard Elements
  const profDistrict = document.getElementById('profDistrict');
  const profEducation = document.getElementById('profEducation');
  const profTrade = document.getElementById('profTrade');
  const profMobility = document.getElementById('profMobility');
  const eqTotalScore = document.getElementById('eqTotalScore');

  // Demo Simulation Chips
  const btnRamesh = document.getElementById('btnSimulateRamesh');
  const btnLakshmi = document.getElementById('btnSimulateLakshmi');
  const btnAniket = document.getElementById('btnSimulateAniket');
  const btnReset = document.getElementById('btnResetSession');

  // WhatsApp Elements
  const waChatWindow = document.getElementById('waChatWindow');
  const waTextInput = document.getElementById('waTextInput');
  const waMicBtn = document.getElementById('waMicBtn');
  const waQuickSimBtn = document.getElementById('waQuickSimBtn');
  const waTeluguSimBtn = document.getElementById('waTeluguSimBtn');
  const phoneTime = document.getElementById('phoneTime');

  // IVR Telephony Elements
  const ivrSimBtn = document.getElementById('ivrSimulateCallBtn');
  const ivrTeluguCallBtn = document.getElementById('ivrTeluguCallBtn');
  const ivrStartCallBtn = document.getElementById('ivrStartCallBtn');
  const ivrEndCallBtn = document.getElementById('ivrEndCallBtn');
  const ivrTimer = document.getElementById('ivrTimer');
  const ivrTranscriptBox = document.getElementById('ivrTranscriptBox');
  const ivrCallStatus = document.getElementById('ivrCallStatus');
  const ivrPulseRing = document.getElementById('ivrPulseRing');
  const keyBtns = document.querySelectorAll('.key-btn');

  // NSQF Catalog Elements
  const catalogGrid = document.getElementById('catalogGrid');
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const catFilterBtns = document.querySelectorAll('.cat-filter-btn');

  // Admin Dashboard Elements
  const enrollmentsTableBody = document.getElementById('enrollmentsTableBody');
  const districtListContainer = document.getElementById('districtListContainer');
  const btnSyncSidh = document.getElementById('btnSyncSidh');
  const queueSearchInput = document.getElementById('queueSearchInput');
  const queueStatusSelect = document.getElementById('queueStatusSelect');

  // Modals & Drawers
  const enrollmentModal = document.getElementById('enrollmentModal');
  const btnCloseEnrollModal = document.getElementById('btnCloseEnrollModal');
  const btnCloseSlipBtn = document.getElementById('btnCloseSlipBtn');
  const btnPrintSlip = document.getElementById('btnPrintSlip');
  const btnShareWa = document.getElementById('btnShareWa');

  const syllabusModal = document.getElementById('syllabusModal');
  const btnCloseSyllabus = document.getElementById('btnCloseSyllabus');
  const sylEnrollBtn = document.getElementById('sylEnrollBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // =========================================================================
  // 1. INITIALIZATION & SETUP
  // =========================================================================
  initApp();

  async function initApp() {
    setupAccessibility();
    setupSpokespersonVoice();
    setupTabSwitching();
    setupLanguageSelector();
    setupKioskInteractions();
    setupWhatsAppSimulator();
    setupIvrSimulator();
    setupCatalogView();
    setupAdminDashboard();
    setupMobileApp();
    setupModals();
    updateLiveClock();

    await checkBackendHealth();
    await startNewSession();
  }

  async function checkBackendHealth() {
    const health = await window.apiService.checkHealth();
    if (health) {
      apiStatusBadge.textContent = `Backend: Online (FastAPI v1.0 | ${health.nsqf_packs_loaded || 8} NSQF Packs)`;
      apiStatusBadge.style.color = '#34d399';
    } else {
      apiStatusBadge.textContent = 'Backend: Standalone Mode (High-Fidelity Engine Active)';
      apiStatusBadge.style.color = '#38bdf8';
    }
  }

  function updateLiveClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (phoneTime) phoneTime.textContent = timeStr;
  }

  // =========================================================================
  // 2. ACCESSIBILITY & UTILITIES
  // =========================================================================
  function setupAccessibility() {
    // High Contrast Mode toggle (GIGW / WCAG 2.1 AAA)
    btnToggleContrast.addEventListener('click', () => {
      document.body.classList.toggle('theme-contrast');
      const isContrast = document.body.classList.contains('theme-contrast');
      btnToggleContrast.querySelector('.acc-label').textContent = isContrast ? 'Normal View' : 'High Contrast';
      showToast(isContrast ? 'High Contrast Mode Enabled (WCAG AAA)' : 'Standard Theme Restored', 'info');
    });

    // Text Size Scaler
    let baseSize = 16;
    btnTextDec.addEventListener('click', () => {
      baseSize = Math.max(14, baseSize - 1);
      document.documentElement.style.setProperty('--font-base-size', `${baseSize}px`);
      updateScaleBtns(btnTextDec);
    });
    btnTextReset.addEventListener('click', () => {
      baseSize = 16;
      document.documentElement.style.setProperty('--font-base-size', '16px');
      updateScaleBtns(btnTextReset);
    });
    btnTextInc.addEventListener('click', () => {
      baseSize = Math.min(20, baseSize + 1);
      document.documentElement.style.setProperty('--font-base-size', `${baseSize}px`);
      updateScaleBtns(btnTextInc);
    });

    function updateScaleBtns(activeBtn) {
      [btnTextDec, btnTextReset, btnTextInc].forEach(b => b.classList.remove('active'));
      activeBtn.classList.add('active');
    }

    // Audio Cadence Selector
    audioCadenceSelect.addEventListener('change', (e) => {
      speechCadence = parseFloat(e.target.value);
      showToast(`Assistant voice cadence set to ${speechCadence}x speed.`, 'info');
    });
  }

  // =========================================================================
  // 2B. SPOKESPERSON VOICE & PERSONA CONTROLLER
  // =========================================================================
  function setupSpokespersonVoice() {
    // Topbar Voice Dropdown
    if (spokespersonSelect) {
      spokespersonSelect.addEventListener('change', (e) => {
        changeSpokespersonVoice(e.target.value, true);
      });
    }

    // Topbar Test Button
    if (btnTestVoice) {
      btnTestVoice.addEventListener('click', () => {
        triggerVoiceSample();
      });
    }

    // Kiosk Voice Bar Test Button
    if (btnQuickTestVoice) {
      btnQuickTestVoice.addEventListener('click', () => {
        triggerVoiceSample();
      });
    }

    // Kiosk 4 Quick Voice Persona Buttons (Asha, Vikram, Kavita, Anand)
    vsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const voiceKey = btn.dataset.voice;
        changeSpokespersonVoice(voiceKey, true);
      });
    });
  }

  function changeSpokespersonVoice(personaId, playSample = true) {
    const persona = window.audioController.setVoicePersona(personaId);

    // Sync dropdown
    if (spokespersonSelect) spokespersonSelect.value = personaId;

    // Sync Kiosk buttons
    document.querySelectorAll('.vs-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.voice === personaId);
    });

    // Update Assistant Name Badge in Kiosk card
    if (assistantNameEl) {
      assistantNameEl.textContent = `PM-AJAY सहाय्यक • ${persona.name}`;
    }

    showToast(`🎙️ Spokesperson sound changed to: ${persona.name} (${persona.title})`, 'success');

    if (playSample) {
      triggerVoiceSample();
    }
  }

  function triggerVoiceSample() {
    glowOrb.className = 'glow-orb speaking';
    soundWaves.classList.add('active');
    replayBtn.disabled = true;

    const phrase = window.audioController.testCurrentVoice(currentLanguage, () => {
      glowOrb.className = 'glow-orb';
      soundWaves.classList.remove('active');
      replayBtn.disabled = false;
    });

    if (statusTicker) {
      statusTicker.textContent = `Speaking (${window.audioController.getVoicePersona().name}): "${phrase}"`;
    }
  }

  // =========================================================================
  // 3. NAVIGATION & TABS
  // =========================================================================
  function setupTabSwitching() {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        viewPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        activeTab = btn.dataset.mode;

        const panel = document.getElementById(`${activeTab}View`);
        if (panel) panel.classList.add('active');

        // Tab-specific refreshes
        if (activeTab === 'catalog') {
          renderCatalogCards();
        } else if (activeTab === 'admin') {
          renderAdminDashboard();
        } else if (activeTab === 'mobile') {
          renderMobileCourses();
        }
      });
    });
  }

  function setupLanguageSelector() {
    langSelect.addEventListener('change', async (e) => {
      currentLanguage = e.target.value;
      updateDialectBadges();
      await startNewSession();
    });
  }

  function updateDialectBadges() {
    if (currentLanguage === 'ahr-IN') {
      dialectPill.textContent = 'अहिराणी बोली (धुळे / जळगाव / नंदुरबार)';
      dialectPill.className = 'dialect-pill ahr';
      statusTicker.textContent = 'सुरू करण्यासाठी खालील माईक बटण दाबा (Tap microphone to begin)';
    } else if (currentLanguage === 'te-IN') {
      dialectPill.textContent = 'తెలుగు (గుంటూరు / వరంగల్ గ్రామీణ ప్రాంతం)';
      dialectPill.className = 'dialect-pill tel';
      statusTicker.textContent = 'ప్రారంభించడానికి మైక్రోఫోన్ నొక్కండి (Tap microphone to begin)';
    } else if (currentLanguage === 'mr-IN') {
      dialectPill.textContent = 'मराठी (ग्रामीण महाराष्ट्र)';
      dialectPill.className = 'dialect-pill';
      statusTicker.textContent = 'सुरू करण्यासाठी माईक बटण दाबा';
    } else {
      dialectPill.textContent = 'हिन्दी (उत्तर भारत)';
      dialectPill.className = 'dialect-pill';
      statusTicker.textContent = 'शुरू करने के लिए माइक बटन दबाएं';
    }
  }

  // =========================================================================
  // 4. CSC KIOSK VOICE ASSISTANT INTERACTION
  // =========================================================================
  async function startNewSession() {
    chatStream.innerHTML = '';
    recContainer.style.display = 'none';
    recGrid.innerHTML = '';
    updateProfilerCard({
      district: currentLanguage === 'te-IN' ? 'Guntur (505)' : 'Dhule (472)',
      education: 'Analyzing...',
      trade: 'Detecting...',
      mobility: '10 km'
    }, 0.85);

    statusTicker.textContent = 'सत्र जोडले जात आहे (Connecting AI session)...';
    currentSession = await window.apiService.startSession('KIOSK', currentLanguage);

    sessionTag.textContent = `ID: ${currentSession.session_id}`;
    lastAssistantSpeech = currentSession.initial_prompt_text;

    addChatMessage('assistant', currentSession.initial_prompt_text);
    replayBtn.disabled = false;

    // Vocalize greeting with cadence
    triggerAiSpeech(currentSession.initial_prompt_text);
  }

  function setupKioskInteractions() {
    // Microphone Toggle
    micBtn.addEventListener('click', async () => {
      if (!isRecording) {
        // Start recording
        isRecording = true;
        micBtn.classList.add('recording');
        micLabel.textContent = 'ऐकत आहे... (Listening)';
        glowOrb.className = 'glow-orb listening';
        soundWaves.classList.add('active');
        statusTicker.textContent = 'कृपया बोला, तुमचे शब्द नोंदवले जात आहेत... (Listening...)';

        await window.audioController.startRecording(currentLanguage, (liveTranscript) => {
          manualTextInput.value = liveTranscript;
        });
      } else {
        // Stop recording
        isRecording = false;
        micBtn.classList.remove('recording');
        micLabel.textContent = 'माईक सुरू करा (Speak Now)';
        glowOrb.className = 'glow-orb';
        soundWaves.classList.remove('active');
        statusTicker.textContent = 'प्रक्रिया सुरू आहे (Analyzing response & skills)...';

        const base64Audio = await window.audioController.stopRecording();
        const fallbackText = manualTextInput.value.trim();

        if (base64Audio || fallbackText) {
          await submitDialogueTurn(base64Audio, fallbackText);
        } else {
          statusTicker.textContent = 'कोणताही आवाज ऐकू आला नाही. पुन्हा प्रयत्न करा. (No audio detected)';
        }
      }
    });

    // Replay Button
    replayBtn.addEventListener('click', () => {
      if (lastAssistantSpeech) {
        triggerAiSpeech(lastAssistantSpeech);
      }
    });

    // Send Text Button & Enter key
    sendTextBtn.addEventListener('click', async () => {
      const text = manualTextInput.value.trim();
      if (!text) return;
      manualTextInput.value = '';
      await submitDialogueTurn(null, text);
    });

    manualTextInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendTextBtn.click();
    });

    // Clear Chat
    btnClearChat.addEventListener('click', () => {
      chatStream.innerHTML = '';
      showToast('Conversation stream cleared.', 'info');
    });

    // Reset Session Button
    btnReset.addEventListener('click', async () => {
      await startNewSession();
      showToast('Session reset with new beneficiary profile.', 'info');
    });

    // Simulation Chips for Jury Demos
    btnRamesh.addEventListener('click', async () => {
      langSelect.value = 'ahr-IN';
      currentLanguage = 'ahr-IN';
      updateDialectBadges();
      await simulateFullPersonaFlow('ramesh');
    });

    btnLakshmi.addEventListener('click', async () => {
      langSelect.value = 'te-IN';
      currentLanguage = 'te-IN';
      updateDialectBadges();
      await simulateFullPersonaFlow('lakshmi');
    });

    btnAniket.addEventListener('click', async () => {
      langSelect.value = 'mr-IN';
      currentLanguage = 'mr-IN';
      updateDialectBadges();
      await simulateFullPersonaFlow('aniket');
    });
  }

  async function submitDialogueTurn(audioBase64, textInput) {
    if (!currentSession) return;

    if (textInput) {
      addChatMessage('user', textInput);
    } else {
      addChatMessage('user', '🎙️ [व्हॉइस ऑडिओ संदेश]');
    }

    glowOrb.className = 'glow-orb speaking';
    statusTicker.textContent = 'AI विचार करत आहे (Analyzing aspiration, eligibility & local demand)...';

    const result = await window.apiService.processAudio(currentSession.session_id, {
      audioBase64: audioBase64,
      textFallback: textInput
    });

    glowOrb.className = 'glow-orb';
    statusTicker.textContent = 'उत्तर पूर्ण झाले (Ready)';

    if (result) {
      lastAssistantSpeech = result.ai_response_text;
      addChatMessage('assistant', result.ai_response_text);
      triggerAiSpeech(result.ai_response_text);

      // Update Profiler Scorecard
      if (result.extracted_entities) {
        updateProfilerCard(result.extracted_entities, result.recommendations ? 0.94 : 0.88);
      }

      // Render NSQF Pathways if generated
      if (result.recommendations && result.recommendations.length > 0) {
        renderRecommendations(result.recommendations);
      }
    }
  }

  function triggerAiSpeech(text) {
    glowOrb.className = 'glow-orb speaking';
    soundWaves.classList.add('active');
    replayBtn.disabled = true;

    window.audioController.speakText(text, currentLanguage, () => {
      glowOrb.className = 'glow-orb';
      soundWaves.classList.remove('active');
      replayBtn.disabled = false;
    }, speechCadence);
  }

  function addChatMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isAhr = currentLanguage === 'ahr-IN';
    const isTel = currentLanguage === 'te-IN';

    const speakerLabel = role === 'user'
      ? (isAhr ? 'लाभार्थी (Beneficiary)' : (isTel ? 'లబ్ధిదారుడు (Beneficiary)' : 'लाभार्थी'))
      : 'PM-AJAY सहाय्यक (MoSJE Voice AI)';

    bubble.innerHTML = `
      <div class="bubble-content">${text.replace(/\n/g, '<br>')}</div>
      <span class="bubble-meta">${speakerLabel} • ${time}</span>
    `;

    chatStream.appendChild(bubble);
    chatStream.scrollTop = chatStream.scrollHeight;
  }

  function updateProfilerCard(entities, score = 0.92) {
    if (profDistrict && entities.district) profDistrict.textContent = entities.district;
    if (profEducation && entities.education) profEducation.textContent = entities.education || 'Class 8th Pass';
    if (profTrade && entities.trade_interest) profTrade.textContent = entities.trade_interest.substr(0, 24) || 'Cotton & Solar';
    if (profMobility && entities.mobility_km) profMobility.textContent = `${entities.mobility_km} km radius`;
    if (eqTotalScore) eqTotalScore.textContent = `${Math.round(score * 100)}%`;
  }

  function renderRecommendations(recommendations) {
    recContainer.style.display = 'block';
    recGrid.innerHTML = '';
    recCountBadge.textContent = `${recommendations.length} Pathways Matched`;

    recommendations.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      const pct = Math.round(rec.suitability_score * 100);

      card.innerHTML = `
        <div class="rec-card-top">
          <h5 class="rec-title">${rec.trade_name_localized || rec.trade_name}</h5>
          <span class="match-pill">${pct}% Match</span>
        </div>
        <div class="rec-sector">${rec.sector_name} • NSQF Level ${rec.nsqf_level}</div>
        <div class="rec-justification">${rec.justification}</div>
        <div class="rec-stipend-badge">💰 ${rec.stipend || '₹1,500/mo DBT Support'}</div>
        <div class="rec-center">📍 ${rec.training_center ? rec.training_center.center_name : 'PMKK Center, Dhule'}</div>
        <div class="rec-card-actions">
          <button class="btn-card-secondary btn-view-syl" data-qp="${rec.qp_code}">
            📄 Syllabus
          </button>
          <button class="enroll-btn btn-pre-enroll" data-qp="${rec.qp_code}">
            ✅ मोफत प्रवेश (Pre-Enroll)
          </button>
        </div>
      `;

      // Syllabus button
      card.querySelector('.btn-view-syl').addEventListener('click', () => {
        openSyllabusModal(rec.qp_code);
      });

      // Pre-Enroll button -> Open Government Certificate Modal
      card.querySelector('.btn-pre-enroll').addEventListener('click', async () => {
        openEnrollmentModal(rec);
      });

      recGrid.appendChild(card);
    });

    // Auto-scroll to recommendations
    recContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Live Jury 1-Click Simulation Flows
  async function simulateFullPersonaFlow(type) {
    await startNewSession();

    let steps = [];
    if (type === 'ramesh') {
      steps = [
        "हो, मला माहिती सांगा",
        "मी धुळे तालुका, अवधान गावचा आहे",
        "मी आठवी पास आहे",
        "आमच्या घरी शेतात कापूस वेचणी आणि मजुरीचं काम करतो, मला सोलर पंप किंवा शेतीचं नवीन काम शिकायचं आहे",
        "मला स्वतःचा व्यवसाय सुरू करायचा आहे, दहा किलोमीटरच्या आत चालंल"
      ];
    } else if (type === 'lakshmi') {
      steps = [
        "అవును, వివరాలు తెలుసుకోవడానికి సమ్మతి ఉంది",
        "మాది గుంటూరు జిల్లా మంగళగిరి గ్రామం",
        "నేను పదవ తరగతి పూర్తి చేశాను",
        "మా ఇంట్లో చేనేత మగ్గం నేత పని చేస్తాము, మిరపకాయల ఎండబెట్టే ప్రాసెసింగ్ పని కూడా తెలుసు",
        "ఇరవై కిలోమీటర్ల లోపు ట్రైనింగ్ ఉంటే మంచిది, స్వయం ఉపాధి లేదా పని కావాలి"
      ];
    } else {
      steps = [
        "हो, पीएम-अजय योजनेची माहिती द्या",
        "मी जळगाव जिल्ह्यातील सावदा गावचा आहे",
        "मी दहावी पास आहे",
        "आमच्याकडे केळीची शेती आहे, मला केळीच्या धाग्यापासून हस्तकला आणि कृषी उपकरणे शिकायची आहेत",
        "मला स्वतःचा व्यवसाय सुरू करायचा आहे, १५ किलोमीटरपर्यंत चालेल"
      ];
    }

    for (let i = 0; i < steps.length; i++) {
      statusTicker.textContent = `Demo step ${i + 1}/${steps.length} in progress...`;
      await new Promise(r => setTimeout(r, 700));
      await submitDialogueTurn(null, steps[i]);
    }
  }

  // =========================================================================
  // 5. WHATSAPP BOT SIMULATOR
  // =========================================================================
  function setupWhatsAppSimulator() {
    waQuickSimBtn.addEventListener('click', () => {
      runWhatsAppSimulation('ramesh');
    });

    waTeluguSimBtn.addEventListener('click', () => {
      runWhatsAppSimulation('lakshmi');
    });

    // Microphone in phone
    waMicBtn.addEventListener('click', () => {
      waMicBtn.classList.toggle('recording');
      if (waMicBtn.classList.contains('recording')) {
        showToast('WhatsApp voice note recording started...', 'info');
      } else {
        addWaUserVoiceNote('Voice note (0:05) • "धुळे अवधान, कापूस आणि सोलर काम"');
        setTimeout(() => {
          addWaAssistantBubble('<strong>शिफारस केलेले कोर्सेस (Recommended):</strong><br>1. कापूस जिनिंग तंत्रज्ञ (94% Match)<br>2. सौर कृषी पंप तंत्रज्ञ (91% Match)<br><em>PMKK धुळे केंद्रावर मोफत बॅच उपलब्ध आहे.</em>');
        }, 1200);
      }
    });

    // Text in phone
    waTextInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const val = waTextInput.value.trim();
        if (!val) return;
        waTextInput.value = '';
        addWaUserBubble(val);
        setTimeout(() => {
          addWaAssistantBubble('छान! तुमची माहिती नोंदवली गेली आहे. जवळचे PM-AJAY कौशल्य केंद्र निवडण्यासाठी १ दाबा.');
        }, 900);
      }
    });
  }

  function runWhatsAppSimulation(persona) {
    waChatWindow.innerHTML = `
      <div class="wa-system-message">
        🔒 Messages and calls are end-to-end encrypted. Audio consent verified under DPDP Act 2023.
      </div>
    `;

    if (persona === 'ramesh') {
      setTimeout(() => addWaAssistantBubble('राम राम! गव्हर्मेंटच्या पीएम-अजय योजनेसाठी तुमाले काम-धंद्याची माहिती विचारायला चालस का?'), 400);
      setTimeout(() => addWaUserVoiceNote('Voice note (0:04) • "व्हय, मला सांगा"'), 1400);
      setTimeout(() => addWaAssistantBubble('छान! तुम्ही कोणतं गाव किंवा तालुक्यातून बोलस? आणि आधी कोणतं काम केलं आहे?'), 2600);
      setTimeout(() => addWaUserVoiceNote('Voice note (0:08) • "धुळे अवधान, कापूस वेचणी आणि सोलर पंप"'), 3800);
      setTimeout(() => {
        addWaAssistantBubble(`
          <strong>🎯 तुमच्यासाठी शिफारस केलेले मोफत कोर्सेस:</strong><br><br>
          1. <strong>कापूस जिनिंग व प्रक्रिया (AGR/Q0108)</strong> - 94% Match<br>
          2. <strong>सौर कृषी पंप तंत्रज्ञ (ELE/Q5901)</strong> - 91% Match<br><br>
          📍 <em>PMKK अवधान, धुळे केंद्रावर मोफत प्रवेश व दरमहा ₹१,५०० स्टायपेंड उपलब्ध आहे.</em>
        `);
      }, 5200);
    } else {
      setTimeout(() => addWaAssistantBubble('నమస్కారం! పీఎం-అజయ్ పథకం కింద నైపుణ్య వివరాలు తెలుసుకోవడానికి మీ సమ్మతి ఉందా?'), 400);
      setTimeout(() => addWaUserVoiceNote('Voice note (0:05) • "అవును, వివరాలు చెప్పండి"'), 1400);
      setTimeout(() => addWaAssistantBubble('ధన్యవాదాలు! మీది ఏ గ్రామం? మరియు గతంలో ఎలాంటి పనులు చేశారు?'), 2600);
      setTimeout(() => addWaUserVoiceNote('Voice note (0:07) • "గుంటూరు మంగళగిరి, చేనేత మగ్గం పని"'), 3800);
      setTimeout(() => {
        addWaAssistantBubble(`
          <strong>🎯 మీ కోసం ఎంపిక చేసిన ఉచిత కోర్సులు:</strong><br><br>
          1. <strong>చేనేత జకార్డ్ నేత కార్మికుడు (AMH/Q1001)</strong> - 96% Match<br>
          2. <strong>మిరప ప్రాసెసింగ్ నిపుణుడు (FIC/Q7001)</strong> - 93% Match<br><br>
          📍 <em>స్కిల్ ఇండియా హబ్, గుంటూరు వద్ద ఉచిత ప్రవేశం & ₹1,500/నెల DBT మద్దతు.</em>
        `);
      }, 5200);
    }
  }

  function addWaAssistantBubble(html) {
    const b = document.createElement('div');
    b.className = 'wa-bubble assistant';
    b.innerHTML = html;
    waChatWindow.appendChild(b);
    waChatWindow.scrollTop = waChatWindow.scrollHeight;
  }

  function addWaUserBubble(text) {
    const b = document.createElement('div');
    b.className = 'wa-bubble user';
    b.textContent = text;
    waChatWindow.appendChild(b);
    waChatWindow.scrollTop = waChatWindow.scrollHeight;
  }

  function addWaUserVoiceNote(label) {
    const b = document.createElement('div');
    b.className = 'wa-bubble user';
    b.innerHTML = `
      <div class="wa-voice-note">
        <button class="wa-vn-play">▶</button>
        <div class="wa-wave-sim">
          <span class="wa-wave-bar" style="height: 14px;"></span>
          <span class="wa-wave-bar" style="height: 8px;"></span>
          <span class="wa-wave-bar" style="height: 18px;"></span>
          <span class="wa-wave-bar" style="height: 12px;"></span>
          <span class="wa-wave-bar" style="height: 16px;"></span>
          <span class="wa-wave-bar" style="height: 6px;"></span>
        </div>
        <span style="font-size: 0.72rem; margin-left: 0.4rem;">${label}</span>
      </div>
    `;
    waChatWindow.appendChild(b);
    waChatWindow.scrollTop = waChatWindow.scrollHeight;
  }

  // =========================================================================
  // 6. IVR TELEPHONY SIMULATOR WITH WEB AUDIO DTMF TONES
  // =========================================================================
  function setupIvrSimulator() {
    // DTMF Frequencies Mapping (ITU-T standard)
    const dtmfFrequencies = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
    };

    function playDtmfTone(key) {
      const freqs = dtmfFrequencies[key];
      if (!freqs) return;

      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!ivrAudioCtx) ivrAudioCtx = new AudioCtx();
        if (ivrAudioCtx.state === 'suspended') ivrAudioCtx.resume();

        const osc1 = ivrAudioCtx.createOscillator();
        const osc2 = ivrAudioCtx.createOscillator();
        const gainNode = ivrAudioCtx.createGain();

        osc1.frequency.value = freqs[0];
        osc2.frequency.value = freqs[1];

        gainNode.gain.setValueAtTime(0.12, ivrAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ivrAudioCtx.currentTime + 0.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ivrAudioCtx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ivrAudioCtx.currentTime + 0.2);
        osc2.stop(ivrAudioCtx.currentTime + 0.2);
      } catch (e) {
        console.warn('DTMF synth note error:', e);
      }
    }

    // Keypad button listeners
    keyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        playDtmfTone(key);

        if (!isIvrCallActive) {
          startIvrCall('ahr');
        }

        ivrTranscriptBox.textContent = `DTMF Key ${key} Pressed. AI Server: Processing choice...`;
        setTimeout(() => {
          if (key === '1') {
            ivrTranscriptBox.textContent = '"संमती नोंदवली गेली आहे. तुमच्यासाठी कापूस जिनिंग (AGR/Q0108) कोर्स निवडला आहे. अधिक माहितीसाठी 2 दाबा."';
          } else {
            ivrTranscriptBox.textContent = `"पर्याय ${key} स्वीकारला. जवळच्या PMKK केंद्राची माहिती तुमच्या मोबाईलवर पाठवली आहे."`;
          }
        }, 900);
      });
    });

    // Call Actions
    ivrStartCallBtn.addEventListener('click', () => startIvrCall('ahr'));
    ivrSimBtn.addEventListener('click', () => startIvrCall('ahr'));
    ivrTeluguCallBtn.addEventListener('click', () => startIvrCall('tel'));

    ivrEndCallBtn.addEventListener('click', () => endIvrCall());

    function startIvrCall(lang) {
      if (ivrTimerInterval) clearInterval(ivrTimerInterval);
      isIvrCallActive = true;
      ivrSeconds = 0;
      ivrCallStatus.textContent = 'Call Active (Toll-Free PSTN)';
      ivrCallStatus.style.color = '#34d399';
      ivrPulseRing.style.display = 'block';

      ivrTimerInterval = setInterval(() => {
        ivrSeconds++;
        const mins = String(Math.floor(ivrSeconds / 60)).padStart(2, '0');
        const secs = String(ivrSeconds % 60).padStart(2, '0');
        ivrTimer.textContent = `${mins}:${secs}`;
      }, 1000);

      const prompt = lang === 'ahr'
        ? '"राम राम! पीएम-अजय योजनेसाठी तुमाले काम-धंद्याची माहिती विचारायला चालस का? हो असल्यास 1 दाबा किंवा बोला."'
        : '"నమస్కారం! పీఎం-అజయ్ పథకం కింద నైపుణ్య వివరాలు చెప్పడానికి మీ సమ్మతి ఉంటే 1 నొక్కండి."';

      ivrTranscriptBox.textContent = prompt;
      window.audioController.speakText(prompt.replace(/"/g, ''), lang === 'ahr' ? 'ahr-IN' : 'te-IN', null, 0.9);
      showToast('Cellular Toll-Free Call Connected.', 'info');
    }

    function endIvrCall() {
      if (ivrTimerInterval) clearInterval(ivrTimerInterval);
      isIvrCallActive = false;
      ivrSeconds = 0;
      ivrTimer.textContent = '00:00';
      ivrCallStatus.textContent = 'Call Ended';
      ivrCallStatus.style.color = '#ef4444';
      ivrPulseRing.style.display = 'none';
      ivrTranscriptBox.textContent = 'कॉल समाप्त झाला (Call Disconnected).';
      showToast('Call hung up.', 'info');
    }
  }

  // =========================================================================
  // 7. NSQF SCHEME CATALOG EXPLORER
  // =========================================================================
  function setupCatalogView() {
    renderCatalogCards();

    // Search filter
    catalogSearchInput.addEventListener('input', () => {
      renderCatalogCards();
    });

    // Filter Chips
    catFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterType = btn.dataset.filter;
        catFilterBtns.forEach(b => {
          if (b.dataset.filter === filterType) b.classList.remove('active');
        });
        btn.classList.add('active');
        renderCatalogCards();
      });
    });
  }

  function renderCatalogCards() {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';

    const allPacks = window.apiService.getAllNsqfPacks();
    const query = (catalogSearchInput.value || '').toLowerCase().trim();

    // Determine active filters
    const activeSectorBtn = document.querySelector('.cat-filter-btn.active[data-filter="sector"]');
    const activeModalityBtn = document.querySelector('.cat-filter-btn.active[data-filter="modality"]');

    const sectorFilter = activeSectorBtn ? activeSectorBtn.dataset.val : 'ALL';
    const modalityFilter = activeModalityBtn ? activeModalityBtn.dataset.val : 'ALL';

    const filtered = allPacks.filter(pack => {
      // Sector match
      if (sectorFilter !== 'ALL' && pack.sector_name !== sectorFilter) return false;

      // Modality match
      if (modalityFilter === 'SELF' && !pack.is_self_employment_oriented) return false;
      if (modalityFilter === 'WAGE' && pack.is_self_employment_oriented) return false;

      // Search query match
      if (query) {
        const fullText = `${pack.trade_name} ${pack.trade_name_ahirani} ${pack.trade_name_telugu} ${pack.qp_code} ${pack.description} ${pack.keywords.join(' ')}`.toLowerCase();
        return fullText.includes(query);
      }
      return true;
    });

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          🔍 No NSQF Qualification Packs found matching your search criteria.
        </div>
      `;
      return;
    }

    filtered.forEach(pack => {
      const card = document.createElement('div');
      card.className = 'catalog-card';

      card.innerHTML = `
        <div class="cat-card-head">
          <span class="cat-card-icon">${pack.sector_icon || '💼'}</span>
          <span class="cat-qp-pill">${pack.qp_code}</span>
        </div>
        <h4 class="cat-card-title">${pack.trade_name}</h4>
        <div class="cat-card-local">${pack.trade_name_ahirani}</div>
        <p class="cat-card-desc">${pack.description}</p>
        <div class="cat-meta-grid">
          <div class="cat-meta-item">
            <small>NSQF Level:</small>
            <strong>Level ${pack.nsqf_level}</strong>
          </div>
          <div class="cat-meta-item">
            <small>Duration:</small>
            <strong>${pack.duration_hours} Hours</strong>
          </div>
          <div class="cat-meta-item">
            <small>Entry Criteria:</small>
            <strong>${pack.entry_qualification_minimum}</strong>
          </div>
          <div class="cat-meta-item">
            <small>GIA Stipend:</small>
            <strong class="text-green">${pack.stipend_monthly.split(' ')[0]}</strong>
          </div>
        </div>
        <div class="cat-card-actions">
          <button class="btn-card-secondary btn-cat-syl" data-qp="${pack.qp_code}">
            View Syllabus
          </button>
          <button class="enroll-btn btn-cat-enroll" data-qp="${pack.qp_code}">
            Pre-Enroll Now
          </button>
        </div>
      `;

      card.querySelector('.btn-cat-syl').addEventListener('click', () => {
        openSyllabusModal(pack.qp_code);
      });

      card.querySelector('.btn-cat-enroll').addEventListener('click', () => {
        openEnrollmentModal({
          qp_code: pack.qp_code,
          trade_name: pack.trade_name,
          nsqf_level: pack.nsqf_level,
          stipend: pack.stipend_monthly,
          training_center: window.apiService.getTrainingCenters()[0]
        });
      });

      catalogGrid.appendChild(card);
    });
  }

  // =========================================================================
  // 8. DWO ADMIN & SIDH HUB
  // =========================================================================
  function setupAdminDashboard() {
    renderAdminDashboard();

    // Sync button
    btnSyncSidh.addEventListener('click', () => {
      const candidates = window.apiService.getCandidateQueue();
      candidates.forEach(c => c.status = 'FORWARDED_TO_SIDH');
      renderAdminDashboard();
      showToast('Skill India Digital Hub (SIDH) API batch sync completed successfully!', 'success');
    });

    // Queue search & status filter
    queueSearchInput.addEventListener('input', () => renderCandidateTable());
    queueStatusSelect.addEventListener('change', () => renderCandidateTable());
  }

  function renderAdminDashboard() {
    renderCandidateTable();
    renderDistrictDemandCards();
  }

  function renderCandidateTable() {
    if (!enrollmentsTableBody) return;
    enrollmentsTableBody.innerHTML = '';

    const queue = window.apiService.getCandidateQueue();
    const query = (queueSearchInput.value || '').toLowerCase().trim();
    const statusFilter = queueStatusSelect.value;

    const filtered = queue.filter(item => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (query) {
        const str = `${item.name} ${item.district} ${item.phone} ${item.trade_name}`.toLowerCase();
        return str.includes(query);
      }
      return true;
    });

    filtered.forEach(can => {
      const tr = document.createElement('tr');
      const langBadge = can.language === 'ahr-IN'
        ? '<span class="badge ahr">Ahirani</span>'
        : (can.language === 'te-IN' ? '<span class="badge tel">Telugu</span>' : '<span class="badge">Marathi</span>');

      const statusBadge = can.status === 'FORWARDED_TO_SIDH'
        ? '<span class="badge sidh-synced">FORWARDED_TO_SIDH</span>'
        : (can.status === 'BATCH_ENROLLED' ? '<span class="badge match-high">BATCH_ENROLLED</span>' : '<span class="badge pending">PENDING</span>');

      tr.innerHTML = `
        <td><strong>${can.name}</strong><br><small style="color:var(--text-dim);">${can.phone}</small></td>
        <td>${langBadge} ${can.district}</td>
        <td><strong>${can.trade_name}</strong><br><small style="color:#818cf8;">${can.selected_qp}</small></td>
        <td>${can.center_name}</td>
        <td><span class="badge match-high">${can.match_score}%</span></td>
        <td>${statusBadge}</td>
        <td>
          <button class="table-action-btn btn-view-slip-record" data-canid="${can.id}">
            View Slip
          </button>
        </td>
      `;

      tr.querySelector('.btn-view-slip-record').addEventListener('click', () => {
        openEnrollmentModal({
          qp_code: can.selected_qp,
          trade_name: can.trade_name,
          candidate_name: can.name,
          phone: can.phone,
          district: can.district,
          village: can.village,
          training_center: { center_name: can.center_name, address: 'Near District Training Hub' }
        });
      });

      enrollmentsTableBody.appendChild(tr);
    });
  }

  function renderDistrictDemandCards() {
    if (!districtListContainer) return;
    districtListContainer.innerHTML = '';

    const demandMap = window.apiService.getDistrictDemand();
    Object.keys(demandMap).forEach(key => {
      const d = demandMap[key];
      const item = document.createElement('div');
      item.className = 'district-item';

      const langTag = d.language === 'ahr-IN'
        ? '<span class="badge ahr">Ahirani Belt</span>'
        : '<span class="badge tel">Telugu Belt</span>';

      item.innerHTML = `
        <div class="district-header">
          <strong>${d.district_name} (${d.state})</strong>
          ${langTag}
        </div>
        <p>High Demand Sectors: ${d.high_demand_sectors.join(', ')}</p>
        <div class="priority-tags">
          ${Object.keys(d.priority_qp_weights).map(qp => `<span class="priority-tag">${qp} (${Math.round(d.priority_qp_weights[qp] * 100)}%)</span>`).join('')}
        </div>
      `;

      districtListContainer.appendChild(item);
    });
  }

  // =========================================================================
  // 9. MODALS: ENROLLMENT SLIP & SYLLABUS DRAWER
  // =========================================================================
  function setupModals() {
    // Enrollment Modal Closes
    btnCloseEnrollModal.addEventListener('click', () => enrollmentModal.style.display = 'none');
    btnCloseSlipBtn.addEventListener('click', () => enrollmentModal.style.display = 'none');
    enrollmentModal.addEventListener('click', (e) => {
      if (e.target === enrollmentModal) enrollmentModal.style.display = 'none';
    });

    // Print Button
    btnPrintSlip.addEventListener('click', () => {
      window.print();
    });

    // Share to WhatsApp / SMS
    btnShareWa.addEventListener('click', () => {
      showToast('Acknowledgment slip sent to beneficiary WhatsApp and SMS (+91-98765-XXXXX)', 'success');
    });

    // Syllabus Modal Closes
    btnCloseSyllabus.addEventListener('click', () => syllabusModal.style.display = 'none');
    syllabusModal.addEventListener('click', (e) => {
      if (e.target === syllabusModal) syllabusModal.style.display = 'none';
    });

    // Pre-Enroll button in syllabus drawer
    sylEnrollBtn.addEventListener('click', () => {
      syllabusModal.style.display = 'none';
      if (currentSelectedQp) {
        openEnrollmentModal({
          qp_code: currentSelectedQp.qp_code,
          trade_name: currentSelectedQp.trade_name,
          nsqf_level: currentSelectedQp.nsqf_level,
          stipend: currentSelectedQp.stipend_monthly,
          training_center: window.apiService.getTrainingCenters()[0]
        });
      }
    });
  }

  function openEnrollmentModal(rec) {
    const isAhr = currentLanguage === 'ahr-IN';
    const isTel = currentLanguage === 'te-IN';

    const candidateName = rec.candidate_name || (isAhr ? 'Ramesh Patil' : (isTel ? 'Lakshmi Devi' : 'Aniket Jadhav'));
    const phone = rec.phone || '+91-98765-43210';
    const district = rec.district || (isTel ? 'Guntur (Andhra Pradesh)' : 'Dhule (Maharashtra)');
    const village = rec.village || (isTel ? 'Mangalagiri Rural' : 'Avadhan Gram Panchayat');

    const tc = rec.training_center || window.apiService.getTrainingCenters()[0];

    document.getElementById('slipAppId').textContent = `APP-ID: PMAJAY-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    document.getElementById('slipCandidateName').textContent = candidateName;
    document.getElementById('slipPhoneNumber').textContent = phone;
    document.getElementById('slipDistrict').textContent = district;
    document.getElementById('slipVillage').textContent = village;
    document.getElementById('slipTradeName').textContent = `${rec.trade_name} (${rec.qp_code})`;
    document.getElementById('slipNsqfLevel').textContent = `Level ${rec.nsqf_level || 4} • 360 Hours (NSQF Accredited)`;
    document.getElementById('slipCenterName').textContent = tc.center_name;
    document.getElementById('slipCenterAddress').textContent = tc.address || 'Near Main Highway, Training Hub';
    document.getElementById('slipStipend').textContent = rec.stipend || '₹1,500/Month (DBT)';

    enrollmentModal.style.display = 'flex';

    // Register in backend/mock queue
    window.apiService.enrollBeneficiary(rec.qp_code, {
      beneficiaryName: candidateName,
      phoneNumber: phone,
      qpCode: rec.qp_code,
      centerId: tc.center_id,
      centerName: tc.center_name,
      district: district,
      village: village,
      language: currentLanguage
    });

    showToast('Provisional Pre-Enrollment generated and forwarded to SIDH.', 'success');
  }

  function openSyllabusModal(qpCode) {
    const pack = window.apiService.getAllNsqfPacks().find(q => q.qp_code === qpCode);
    if (!pack) return;

    currentSelectedQp = pack;

    document.getElementById('sylSector').textContent = pack.sector_name;
    document.getElementById('sylTitle').textContent = pack.trade_name;
    document.getElementById('sylQpCode').textContent = `QP Code: ${pack.qp_code} • NSQF Level ${pack.nsqf_level}`;
    document.getElementById('sylHours').textContent = `${pack.duration_hours} Hours`;
    document.getElementById('sylEntry').textContent = pack.entry_qualification_minimum;
    document.getElementById('sylModality').textContent = pack.is_self_employment_oriented ? 'Self-Employment / SHG' : 'Wage Employment';
    document.getElementById('sylStipend').textContent = pack.stipend_monthly.split(' ')[0];
    document.getElementById('sylDesc').textContent = pack.description;

    const modulesList = document.getElementById('sylModulesList');
    modulesList.innerHTML = '';
    pack.syllabus_modules.forEach(m => {
      const li = document.createElement('li');
      li.textContent = m;
      modulesList.appendChild(li);
    });

    const centersList = document.getElementById('sylCentersList');
    centersList.innerHTML = '';
    const centers = window.apiService.getTrainingCenters().filter(c => c.offered_qp_codes.includes(pack.qp_code));
    if (centers.length > 0) {
      centers.forEach(c => {
        const item = document.createElement('div');
        item.className = 'syl-center-item';
        item.innerHTML = `
          <strong>${c.center_name}</strong>
          <small>${c.address} • Contact: ${c.contact_phone}</small>
        `;
        centersList.appendChild(item);
      });
    } else {
      centersList.innerHTML = `<div class="syl-center-item"><small>All PMKK District Centers across Maharashtra & Andhra Pradesh.</small></div>`;
    }

    syllabusModal.style.display = 'flex';
  }

  // =========================================================================
  // 11. MOBILE APPLICATION INTERFACE (PWA) CONTROLLER
  // =========================================================================
  function setupMobileApp() {
    const mobNavItems = document.querySelectorAll('.mob-nav-item');
    const mobScreens = document.querySelectorAll('.mob-screen');
    const btnMobStartVoiceHero = document.getElementById('btnMobStartVoiceHero');
    const mobMicBtn = document.getElementById('mobMicBtn');
    const mobReplayBtn = document.getElementById('mobReplayBtn');
    const mobGlowOrb = document.getElementById('mobGlowOrb');
    const mobWaves = document.getElementById('mobWaves');
    const mobVoiceStatus = document.getElementById('mobVoiceStatus');
    const mobChatStream = document.getElementById('mobChatStream');
    const mobQuickReplies = document.getElementById('mobQuickReplies');
    const btnMobLangToggle = document.getElementById('btnMobLangToggle');
    const mobLangLabel = document.getElementById('mobLangLabel');
    const mobSyncPill = document.getElementById('mobSyncPill');
    const mobVoiceSelect = document.getElementById('mobVoiceSelect');
    const mobCadenceSelect = document.getElementById('mobCadenceSelect');
    const chkLowBandwidth = document.getElementById('chkLowBandwidth');

    // Bottom Navigation switching
    mobNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.dataset.target;
        mobNavItems.forEach(nav => nav.classList.remove('active'));
        mobScreens.forEach(scr => scr.classList.remove('active'));

        item.classList.add('active');
        const targetScreen = document.getElementById(targetId);
        if (targetScreen) targetScreen.classList.add('active');

        if (targetId === 'mobScreenCourses') {
          renderMobileCourses();
        }
      });
    });

    // Hero banner click -> switches to Voice Screen
    if (btnMobStartVoiceHero) {
      btnMobStartVoiceHero.addEventListener('click', () => {
        const voiceNav = document.querySelector('.mob-nav-item[data-target="mobScreenVoice"]');
        if (voiceNav) voiceNav.click();
      });
    }

    // Language Toggle inside mobile topbar
    if (btnMobLangToggle) {
      btnMobLangToggle.addEventListener('click', () => {
        if (currentLanguage === 'ahr-IN') {
          currentLanguage = 'te-IN';
          mobLangLabel.textContent = 'తెలుగు';
          document.getElementById('mobGreetingName').textContent = 'నమస్కారం, లక్ష్మీ దేవి!';
          const userLoc = document.querySelector('.mob-user-loc');
          if (userLoc) userLoc.textContent = '📍 మంగళగిరి గ్రామం, గుంటూరు (ఆంధ్రప్రదేశ్)';
        } else {
          currentLanguage = 'ahr-IN';
          mobLangLabel.textContent = 'अहिराणी';
          document.getElementById('mobGreetingName').textContent = 'राम राम, रमेश पाटील!';
          const userLoc = document.querySelector('.mob-user-loc');
          if (userLoc) userLoc.textContent = '📍 अवधान गाव, धुळे (महाराष्ट्र)';
        }
        langSelect.value = currentLanguage;
        updateDialectBadges();
        showToast(`Mobile dialect switched to: ${mobLangLabel.textContent}`, 'info');
      });
    }

    // Voice Screen Interactions (Mobile Mic FAB)
    let isMobRecording = false;
    if (mobMicBtn) {
      mobMicBtn.addEventListener('click', async () => {
        if (!isMobRecording) {
          isMobRecording = true;
          mobMicBtn.classList.add('recording');
          mobGlowOrb.className = 'mob-glow-orb listening';
          mobWaves.classList.add('active');
          mobVoiceStatus.textContent = 'ऐकत आहे... (Listening... Speak now)';

          await window.audioController.startRecording(currentLanguage);
        } else {
          isMobRecording = false;
          mobMicBtn.classList.remove('recording');
          mobGlowOrb.className = 'mob-glow-orb';
          mobWaves.classList.remove('active');
          mobVoiceStatus.textContent = 'प्रक्रिया सुरू आहे (AI analyzing...)...';

          await window.audioController.stopRecording();
          await submitMobileVoiceDialogue(currentLanguage === 'ahr-IN' ? 'मी धुळे अवधान गावचा आहे, कापूस व सोलर काम' : 'గుంటూరు మంగళగిరి, చేనేత పని');
        }
      });
    }

    // Mobile Audio Replay
    if (mobReplayBtn) {
      mobReplayBtn.addEventListener('click', () => {
        const lastMsg = mobChatStream.querySelector('.mob-bubble.assistant:last-child');
        if (lastMsg) {
          window.audioController.speakText(lastMsg.textContent, currentLanguage);
        }
      });
    }

    // Quick Suggested Replies in Mobile
    if (mobQuickReplies) {
      mobQuickReplies.querySelectorAll('.mob-reply-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const replyText = btn.dataset.reply;
          await submitMobileVoiceDialogue(replyText);
        });
      });
    }

    async function submitMobileVoiceDialogue(userText) {
      // Add user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'mob-bubble user';
      userBubble.textContent = userText;
      mobChatStream.appendChild(userBubble);
      mobChatStream.scrollTop = mobChatStream.scrollHeight;

      mobGlowOrb.className = 'mob-glow-orb speaking';
      mobVoiceStatus.textContent = 'AI उत्तर देत आहे (Synthesizing voice)...';

      const isAhr = currentLanguage === 'ahr-IN';
      const aiReply = isAhr
        ? "छान! तुमच्यासाठी कापूस जिनिंग (AGR/Q0108) आणि सौर पंप तंत्रज्ञ (ELE/Q5901) हे कोर्सेस निवडले आहेत. मोफत प्रवेशासाठी कोर्सेस टॅब तपासा."
        : "చాలా మంచిది! మీ కోసం చేనేత జకార్డ్ (AMH/Q1001) మరియు మిరప ప్రాసెసింగ్ కోర్సులు ఎంపిక చేయబడ్డాయి. ఉచిత ప్రవేశానికి కోర్సుల ట్యాబ్ చూడండి.";

      setTimeout(() => {
        const aiBubble = document.createElement('div');
        aiBubble.className = 'mob-bubble assistant';
        aiBubble.textContent = aiReply;
        mobChatStream.appendChild(aiBubble);
        mobChatStream.scrollTop = mobChatStream.scrollHeight;

        mobGlowOrb.className = 'mob-glow-orb';
        mobVoiceStatus.textContent = 'माईक बटण दाबा आणि बोला (Tap mic to speak)';

        window.audioController.speakText(aiReply, currentLanguage);
      }, 700);
    }

    // Mobile Course Search & Filters
    renderMobileCourses();

    const mobCourseSearch = document.getElementById('mobCourseSearch');
    if (mobCourseSearch) {
      mobCourseSearch.addEventListener('input', () => renderMobileCourses());
    }

    const mChips = document.querySelectorAll('.m-chip');
    mChips.forEach(chip => {
      chip.addEventListener('click', () => {
        mChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderMobileCourses();
      });
    });

    // Mobile Settings Listeners
    if (mobVoiceSelect) {
      mobVoiceSelect.addEventListener('change', (e) => {
        changeSpokespersonVoice(e.target.value, true);
        if (spokespersonSelect) spokespersonSelect.value = e.target.value;
      });
    }

    if (mobCadenceSelect) {
      mobCadenceSelect.addEventListener('change', (e) => {
        speechCadence = parseFloat(e.target.value);
        if (audioCadenceSelect) audioCadenceSelect.value = e.target.value;
        showToast(`Speech cadence set to ${speechCadence}x speed.`, 'info');
      });
    }

    if (chkLowBandwidth) {
      chkLowBandwidth.addEventListener('change', (e) => {
        const isOffline = e.target.checked;
        if (isOffline) {
          mobSyncPill.className = 'mob-offline-badge offline';
          mobSyncPill.innerHTML = '<span class="sync-dot"></span> 2G Mode';
          showToast('Low-Bandwidth 2G Data Saver Mode Active.', 'info');
        } else {
          mobSyncPill.className = 'mob-offline-badge online';
          mobSyncPill.innerHTML = '<span class="sync-dot"></span> Synced';
          showToast('Online 5G Real-Time Cloud Sync Active.', 'success');
        }
      });
    }

    // Card Actions in Mobile
    const btnSaveMobCard = document.getElementById('btnSaveMobCard');
    if (btnSaveMobCard) {
      btnSaveMobCard.addEventListener('click', () => {
        showToast('Digital PM-AJAY Beneficiary Card saved to phone storage!', 'success');
      });
    }

    const btnShareMobCard = document.getElementById('btnShareMobCard');
    if (btnShareMobCard) {
      btnShareMobCard.addEventListener('click', () => {
        showToast('Digital Card Pass shared via WhatsApp & SMS (+91-98765-XXXXX)', 'success');
      });
    }

    // Mobile Showcase Panel 1-Click Simulation Buttons
    const btnSimMobVoiceFlow = document.getElementById('btnSimMobVoiceFlow');
    if (btnSimMobVoiceFlow) {
      btnSimMobVoiceFlow.addEventListener('click', () => {
        const voiceNav = document.querySelector('.mob-nav-item[data-target="mobScreenVoice"]');
        if (voiceNav) voiceNav.click();
        submitMobileVoiceDialogue('मी धुळे अवधान गावचा आहे, कापूस व सोलर काम शिकायचं आहे');
      });
    }

    const btnSimMobSmartCard = document.getElementById('btnSimMobSmartCard');
    if (btnSimMobSmartCard) {
      btnSimMobSmartCard.addEventListener('click', () => {
        const cardNav = document.querySelector('.mob-nav-item[data-target="mobScreenCard"]');
        if (cardNav) cardNav.click();
      });
    }

    const btnSimMobOfflineMode = document.getElementById('btnSimMobOfflineMode');
    if (btnSimMobOfflineMode) {
      btnSimMobOfflineMode.addEventListener('click', () => {
        chkLowBandwidth.checked = !chkLowBandwidth.checked;
        chkLowBandwidth.dispatchEvent(new Event('change'));
      });
    }
  }

  function renderMobileCourses() {
    const list = document.getElementById('mobCoursesList');
    if (!list) return;
    list.innerHTML = '';

    const allPacks = window.apiService.getAllNsqfPacks();
    const query = (document.getElementById('mobCourseSearch')?.value || '').toLowerCase().trim();
    const activeChip = document.querySelector('.m-chip.active')?.dataset.mfilter || 'ALL';

    const filtered = allPacks.filter(pack => {
      if (activeChip !== 'ALL' && !pack.sector_name.includes(activeChip)) return false;
      if (query) {
        const str = `${pack.trade_name} ${pack.trade_name_ahirani} ${pack.qp_code} ${pack.description}`.toLowerCase();
        return str.includes(query);
      }
      return true;
    });

    filtered.forEach(pack => {
      const card = document.createElement('div');
      card.className = 'mob-course-card';

      card.innerHTML = `
        <div class="mob-card-head">
          <h6>${pack.trade_name_ahirani || pack.trade_name}</h6>
          <span class="mob-match-tag">${pack.qp_code}</span>
        </div>
        <div class="mob-course-meta">
          <span>Level ${pack.nsqf_level}</span>
          <span>•</span>
          <span>${pack.duration_hours} Hrs</span>
          <span>•</span>
          <span style="color:#34d399;">${pack.stipend_monthly.split(' ')[0]}</span>
        </div>
        <button class="mob-apply-btn" data-qp="${pack.qp_code}">
          मोफत प्रवेश घ्या (Apply Now)
        </button>
      `;

      card.querySelector('.mob-apply-btn').addEventListener('click', () => {
        // Update Smart Card Details
        document.getElementById('cardTradeTitle').textContent = `${pack.trade_name} (${pack.qp_code})`;
        document.getElementById('cardCenterTitle').textContent = `PMKK Center (Level ${pack.nsqf_level} • ${pack.duration_hours} Hrs)`;

        // Switch to Smart Card Screen
        const cardNav = document.querySelector('.mob-nav-item[data-target="mobScreenCard"]');
        if (cardNav) cardNav.click();

        showToast(`Pre-enrolled in ${pack.trade_name}! Smart Card generated.`, 'success');
      });

      list.appendChild(card);
    });
  }

  // =========================================================================
  // 10. TOAST NOTIFICATION UTILITY
  // =========================================================================
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
