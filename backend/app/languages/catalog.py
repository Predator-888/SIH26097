"""
Language Catalog for PM-AJAY Voice Assistant
Supports Ahirani (Khandeshi dialect, Maharashtra) and Telugu (AP / Telangana).
"""
from typing import Dict, Any

LANGUAGE_CATALOG: Dict[str, Dict[str, Any]] = {
    "ahr-IN": {
        "code": "ahr-IN",
        "name": "Ahirani",
        "native_name": "अहिराणी (खानदेशी)",
        "state": "Maharashtra",
        "primary_districts": ["Dhule", "Jalgaon", "Nandurbar"],
        "bhashini_source_lang": "mr",
        "dialect_label": "Khandeshi / Ahirani",
        "greeting_consent_prompt": "राम राम! मी गव्हर्मेंटच्या पीएम-अजय योजनेतून बोलस. तुमाले काम-धंद्याचं आणि मोफत ट्रेनिंगचं माहिती विचारायला चालस का? बोला, हो किंवा नाही?",
        "state_prompts": {
            "GREETING_AND_CONSENT": "राम राम! मी गव्हर्मेंटच्या पीएम-अजय योजनेतून बोलस. तुमाले काम-धंद्याचं आणि मोफत ट्रेनिंगचं माहिती विचारायला चालस का? बोला, हो किंवा नाही?",
            "IDENTITY_AND_LOCATION": "छान! तुम्ही कोणतं गाव किंवा तालुका मधून बोलस? तुमना गाव किंवा तालुक्याचं नाव सांगा.",
            "EDUCATION_AND_BACKGROUND": "बरोबर! तुम्ही कितवी पर्यंत शिकल्या आहात? शाळा शिकली का नाही ते सांगा.",
            "TRADITIONAL_AND_INFORMAL_SKILLS": "घरामा आधीपासून कोणतं काम चालस? शेती, कापूस, केळी, गवंडी काम, विणकाम किंवा दुसरं कोणतं काम येतं का तुमाले?",
            "MOBILITY_AND_MODALITY": "तुम्ही स्वतःचं दुकान/उद्योग सुरू करू इच्छिता की नोकरी? आणि शिकायला किती लांब जाऊ शकता?",
            "RECOMMENDATION_DELIVERY": "धन्यवाद! तुमनासाठी गव्हर्मेंटच्या पीएम-अजय योजनेअंतर्गत छान ट्रेनिंग सापडल्या आहेत. ऐका:",
            "COMPLETED": "तुमचं नाव आणि माहिती नोंदवली आहे. आमचे अधिकारी लवकरच संपर्क करतील. राम राम!"
        },
        "affirmative_words": ["हो", "व्हय", "चालंल", "होय", "सांगा", "चालेल", "बेश", "बरं"],
        "negative_words": ["नाही", "नको", "नाय"]
    },
    "te-IN": {
        "code": "te-IN",
        "name": "Telugu",
        "native_name": "తెలుగు",
        "state": "Andhra Pradesh & Telangana",
        "primary_districts": ["Guntur", "Warangal", "Nalgonda"],
        "bhashini_source_lang": "te",
        "dialect_label": "Standard & Rural Colloquial Telugu",
        "greeting_consent_prompt": "నమస్కారం! నేను పీఎం-అజయ్ ప్రభుత్వ పథకం నుండి మాట్లాడుతున్నాను. ఉచిత నైపుణ్య శిక్షణ మరియు ఉపాధి అవకాశాల కోసం మీ వివరాలు తెలుసుకోవచ్చా? అవును లేదా కాదు అని చెప్పండి.",
        "state_prompts": {
            "GREETING_AND_CONSENT": "నమస్కారం! నేను పీఎం-అజయ్ ప్రభుత్వ పథకం నుండి మాట్లాడుతున్నాను. ఉచిత నైపుణ్య శిక్షణ మరియు ఉపాధి అవకాశాల కోసం మీ వివరాలు తెలుసుకోవచ్చా? అవును లేదా కాదు అని చెప్పండి.",
            "IDENTITY_AND_LOCATION": "మంచిది! మీ ఊరు లేదా మండలం ఏది? మీ జిల్లా పేరు చెప్పండి.",
            "EDUCATION_AND_BACKGROUND": "మీ చదువు ఎంతవరకు సాగింది? ఏ తరగతి వరకు చదువుకున్నారు?",
            "TRADITIONAL_AND_INFORMAL_SKILLS": "మీ కుటుంబంలో సంప్రదాయకంగా చేసే పని ఏంటి? వ్యవసాయం, చేనేత, మిరప ప్రాసెసింగ్, లేదా పశుపోషణ వంటి పనులలో అనుభవం ఉందా?",
            "MOBILITY_AND_MODALITY": "మీరు స్వయం ఉపాధి లేదా వ్యాపారం చేయాలనుకుంటున్నారా లేక ఉద్యోగం కావాలా? శిక్షణ కోసం ఎంత దూరం వెళ్లగలరు?",
            "RECOMMENDATION_DELIVERY": "చాలా ధన్యవాదాలు! మీ కోసం పీఎం-అజయ్ కింద సరిపోయే శిక్షణా కోర్సులు సిద్ధంగా ఉన్నాయి. వినండి:",
            "COMPLETED": "మీ వివరాలు విజయవంతంగా నమోదయ్యాయి. మా అధికారులు త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు. నమస్కారం!"
        },
        "affirmative_words": ["అవును", "సరే", "చెప్పండి", "ఓకే", "వివరాలు చెప్పు"],
        "negative_words": ["వద్దు", "కాదు", "ఇష్టం లేదు"]
    }
}

def get_language_config(lang_code: str) -> Dict[str, Any]:
    """Retrieve configuration for supported language or fallback to Ahirani"""
    if lang_code in LANGUAGE_CATALOG:
        return LANGUAGE_CATALOG[lang_code]
    # Check prefixes or mappings
    if "te" in lang_code.lower():
        return LANGUAGE_CATALOG["te-IN"]
    return LANGUAGE_CATALOG["ahr-IN"]
