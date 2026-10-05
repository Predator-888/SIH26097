/**
 * Audio Recorder & Speech Synthesis Service for PM-AJAY Voice Assistant.
 * Manages microphone capture via MediaRecorder, Web Speech Recognition,
 * and high-fidelity SpeechSynthesis voice personas (Empathetic Female / Calm Male / Melodious / Youth).
 */
class AudioController {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.recognition = null;
    this.voices = [];
    this.currentPersona = 'asha'; // Default: Asha (Empathetic Female Voice)
    this.customPitch = 1.15;
    this.customRate = 0.9;
    this.selectedVoiceURI = null;

    // Defined Spokesperson Voice Profiles
    this.voicePersonas = {
      asha: {
        id: 'asha',
        name: 'आशा (Asha)',
        title: 'Warm & Empathetic Female Spokesperson',
        gender: 'female',
        pitch: 1.18,
        rate: 0.92,
        testPhrases: {
          'ahr-IN': 'राम राम! मी आशा, पीएम-अजय योजनेची तुमची सहाय्यक. मी कशी मदत करू?',
          'te-IN': 'నమస్కారం! నేను ఆశా, పీఎం-అజయ్ సహాయకురాలిని. మీకు ఎలా సహాయపడగలను?',
          'mr-IN': 'नमस्कार! मी आशा, पीएम-अजय योजनेची सहाय्यक बोलत आहे.',
          'hi-IN': 'नमस्ते! मैं आशा बोल रही हूँ, पीएम-अजय योजना में आपका स्वागत है।'
        }
      },
      vikram: {
        id: 'vikram',
        name: 'विक्रम (Vikram)',
        title: 'Deep & Calm Male Rural Counselor',
        gender: 'male',
        pitch: 0.82,
        rate: 0.88,
        testPhrases: {
          'ahr-IN': 'राम राम! मी विक्रम बोलस. शेती आणि नवीन काम-धंद्यासाठी मी तुमाले मदत करस.',
          'te-IN': 'నమస్కారం! నేను విక్రమ్. ఉపాధి మరియు ఉచిత శిక్షణ వివరాలు మీకు తెలియజేస్తాను.',
          'mr-IN': 'नमस्कार! मी विक्रम, उपजीविका व कौशल्य मार्गदर्शक बोलत आहे.',
          'hi-IN': 'राम राम भाई! मैं विक्रम, आपके आजीविका और कौशल मार्गदर्शन के लिए उपस्थित हूँ।'
        }
      },
      kavita: {
        id: 'kavita',
        name: 'कविता (Kavita)',
        title: 'Clear Melodious Female Voice',
        gender: 'female',
        pitch: 1.28,
        rate: 0.95,
        testPhrases: {
          'ahr-IN': 'नमस्कार! मी कविता. पीएम-अजय योजनेचे सर्व कोर्सेस आपल्यासाठी उपलब्ध आहेत.',
          'te-IN': 'నమస్కారం! నేను కవిత. పీఎం-అజయ్ ఉచిత కోర్సుల వివరాలు ఇక్కడ ఉన్నాయి.',
          'mr-IN': 'नमस्कार! मी कविता बोलत आहे. आपले कौशल्य वाढवण्यासाठी आम्ही सोबत आहोत.',
          'hi-IN': 'नमस्ते! मैं कविता, आपको स्वरोजगार और सरकारी अनुदान की जानकारी दूंगी।'
        }
      },
      anand: {
        id: 'anand',
        name: 'आनंद (Anand)',
        title: 'Energetic Youth Livelihood Advisor',
        gender: 'male',
        pitch: 0.95,
        rate: 1.02,
        testPhrases: {
          'ahr-IN': 'जय हरी! मी आनंद. चला, नवीन तंत्रज्ञान आणि सोलर पंपचे काम शिकूया!',
          'te-IN': 'నమస్కారం! నేను ఆనంద్. నూతన నైపుణ్యాలతో ఉజ్వల భవిష్యత్తు నిర్మించుకుందాం!',
          'mr-IN': 'नमस्कार! मी आनंद. तरुणांसाठी आधुनिक रोजगाराच्या संधी शोधूया.',
          'hi-IN': 'नमस्ते! मैं आनंद, युवाओं के लिए नए रोजगार और तकनीकी प्रशिक्षण की जानकारी लाया हूँ।'
        }
      }
    };

    this._initSpeechRecognition();
    this._initVoices();
  }

  _initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  _initVoices() {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  setVoicePersona(personaId) {
    if (this.voicePersonas[personaId]) {
      this.currentPersona = personaId;
      const persona = this.voicePersonas[personaId];
      this.customPitch = persona.pitch;
      this.customRate = persona.rate;
      return persona;
    }
    return this.voicePersonas.asha;
  }

  getVoicePersona() {
    return this.voicePersonas[this.currentPersona] || this.voicePersonas.asha;
  }

  setPitch(pitch) {
    this.customPitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  setRate(rate) {
    this.customRate = Math.max(0.5, Math.min(1.5, rate));
  }

  // --- Microphone Recording via MediaRecorder & Web Audio Analyser ---
  async startRecording(langCode = 'ahr-IN', onTranscriptCallback = null) {
    if (this.isRecording) return;
    this.audioChunks = [];

    // Setup Web Speech Recognition
    if (this.recognition) {
      this.recognition.lang = langCode === 'te-IN' ? 'te-IN' : (langCode === 'hi-IN' ? 'hi-IN' : 'mr-IN');
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscriptCallback) {
          onTranscriptCallback(transcript);
        }
      };
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('SpeechRecognition start error:', e);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Real Web Audio Analyser for live wave-bar feedback
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 32;
          const source = this.audioCtx.createMediaStreamSource(stream);
          source.connect(this.analyser);
          this._animateWaves();
        }
      } catch (err) {
        console.warn('AudioContext visualization error:', err);
      }

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (e) {
      console.warn('Microphone access denied or simulated fallback active:', e);
      this.isRecording = true;
    }
  }

  _animateWaves() {
    if (!this.isRecording || !this.analyser) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    const waveBars = document.querySelectorAll('.wave-bar');
    if (waveBars && waveBars.length > 0) {
      waveBars.forEach((bar, index) => {
        const val = dataArray[index % bufferLength] || 10;
        const height = Math.max(6, Math.min(36, (val / 255) * 40));
        bar.style.height = `${height}px`;
      });
    }

    if (this.isRecording) {
      requestAnimationFrame(() => this._animateWaves());
    }
  }

  async stopRecording() {
    if (!this.isRecording) return null;
    this.isRecording = false;

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch (e) {}
    }

    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }

    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const base64 = await this._blobToBase64(audioBlob);
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
          resolve(base64);
        };
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // --- Speech Synthesis with Selected Spokesperson Persona ---
  speakText(text, langCode = 'ahr-IN', onEndCallback = null, rate = null) {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any overlapping speech

    const persona = this.voicePersonas[this.currentPersona] || this.voicePersonas.asha;
    const utterance = new SpeechSynthesisUtterance(text);

    // Language setting
    utterance.lang = langCode === 'te-IN' ? 'te-IN' : (langCode === 'hi-IN' ? 'hi-IN' : 'mr-IN');
    utterance.rate = rate || this.customRate || persona.rate;
    utterance.pitch = this.customPitch || persona.pitch;

    // Pick best matching system voice based on persona gender & language
    if (!this.voices || this.voices.length === 0) {
      this.voices = window.speechSynthesis.getVoices();
    }

    const targetLangPrefix = langCode === 'te-IN' ? 'te' : (langCode === 'hi-IN' ? 'hi' : 'mr');
    const isFemale = persona.gender === 'female';

    // Priority matching:
    // 1. Matching language + matching gender keyword
    // 2. Matching language
    // 3. Indian English / Hindi voice with gender matching
    let matchedVoice = this.voices.find(v => {
      const nameLower = v.name.toLowerCase();
      const langLower = v.lang.toLowerCase();
      const langMatch = langLower.includes(targetLangPrefix);
      if (!langMatch) return false;

      if (isFemale) {
        return nameLower.includes('female') || nameLower.includes('swara') || nameLower.includes('kalpana') || nameLower.includes('heera') || nameLower.includes('zira') || nameLower.includes('priya');
      } else {
        return nameLower.includes('male') || nameLower.includes('madhur') || nameLower.includes('hemant') || nameLower.includes('david') || nameLower.includes('ravi');
      }
    });

    if (!matchedVoice) {
      // Find any voice matching the target language
      matchedVoice = this.voices.find(v => v.lang.toLowerCase().includes(targetLangPrefix));
    }

    if (!matchedVoice) {
      // Fallback: Hindi or Indian English voice
      matchedVoice = this.voices.find(v => v.lang.toLowerCase().includes('hi') || v.lang.toLowerCase().includes('in'));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Quick Test of Active Spokesperson Voice
  testCurrentVoice(langCode = 'ahr-IN', onEndCallback = null) {
    const persona = this.voicePersonas[this.currentPersona] || this.voicePersonas.asha;
    const phrase = (persona.testPhrases && persona.testPhrases[langCode]) || persona.testPhrases['ahr-IN'];
    this.speakText(phrase, langCode, onEndCallback);
    return phrase;
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Global Singleton Export
window.audioController = new AudioController();
