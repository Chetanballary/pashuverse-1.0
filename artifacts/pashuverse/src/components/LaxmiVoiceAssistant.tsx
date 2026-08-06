import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  X, 
  Sparkles, 
  PawPrint, 
  Stethoscope, 
  Bot, 
  User, 
  MessageSquare, 
  PhoneCall, 
  AlertCircle, 
  Radio, 
  Square,
  Globe,
  Languages,
  CheckCircle2,
  Pill,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'laxmi';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  diagnosisDetails?: {
    disease: string;
    reason: string;
    treatment: string;
    medicines: string[];
  };
}

export type SupportedLang = 'kn-IN' | 'hi-IN' | 'en-IN';

// Automatic Language Detector Engine (Kannada / Hindi / English)
export function detectInputLanguage(input: string, currentFallback: SupportedLang = 'kn-IN'): SupportedLang {
  const text = input.trim();
  if (!text) return currentFallback;

  // 1. Kannada Unicode Script (\u0C80 - \u0CFF)
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return 'kn-IN';
  }

  // 2. Hindi Devanagari Unicode Script (\u0900 - \u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi-IN';
  }

  // 3. Romanized Kannada Phonetic Keywords
  const lower = text.toLowerCase();
  const kannadaKeywords = [
    'hasu', 'hasuvige', 'jwara', 'halu', 'kalu', 'bayi', 'roga', 'gantu', 
    'kecchalu', 'tikke', 'chikitsae', 'aushadhi', 'niru', 'namaskara', 
    'turtu', 'kudu', 'hechhisalu', 'ilavari', 'yavaga', 'yen', 'yaake',
    'kannada', 'badidhe'
  ];
  if (kannadaKeywords.some(kw => lower.includes(kw))) {
    return 'kn-IN';
  }

  // 4. Romanized Hindi Phonetic Keywords
  const hindiKeywords = [
    'gay', 'gaay', 'bukhar', 'bimar', 'doodh', 'muh', 'paani', 'teeka', 
    'ilaj', 'dawai', 'saand', 'bhens', 'bhains', 'kya', 'hai', 'kaise', 
    'namaste', 'batao', 'rha', 'rhi', 'kro', 'kab'
  ];
  if (hindiKeywords.some(kw => lower.includes(kw))) {
    return 'hi-IN';
  }

  // 5. If purely English words detected
  if (/\b(fever|cow|buffalo|vaccine|milk|doctor|vet|cough|skin|lump|bloat|disease|help|treatment|medicine|dose)\b/i.test(text)) {
    return 'en-IN';
  }

  return currentFallback;
}

// Phonetic Preprocessor for High-Proficiency Natural Voice Readout
function phoneticPreprocess(text: string, lang: SupportedLang): string {
  let cleaned = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_#`~]/g, '')
    .replace(/\(.*?\)|\{.*?\}/g, '')
    .trim();

  if (lang === 'kn-IN') {
    cleaned = cleaned
      .replace(/0\.1%/g, 'ಸೊನ್ನೆ ಬಿಂದು ಒಂದು ಪ್ರತಿಶತ')
      .replace(/%/g, ' ಪ್ರತಿಶತ ')
      .replace(/100ml/gi, 'ನೂರು ಮಿಲಿಲೀಟರ್')
      .replace(/50ml/gi, 'ಐವತ್ತು ಮಿಲಿಲೀಟರ್')
      .replace(/200ml/gi, 'ಇನ್ನೂರು ಮಿಲಿಲೀಟರ್')
      .replace(/30L/gi, 'ಮೂವತ್ತು ಲೀಟರ್')
      .replace(/40L/gi, 'ನಲವತ್ತು ಲೀಟರ್')
      .replace(/FMD/gi, 'ಎಫ್ ಎಂ ಡಿ ಕಾಲುಬಾಯಿ ರೋಗ')
      .replace(/LSD/gi, 'ಎಲ್‌ ಎಸ್‌ ಡಿ ಗಂಟು ರೋಗ')
      .replace(/Meloxicam/gi, 'ಮೆಲೋಕ್ಸಿಕಮ್')
      .replace(/Ivermectin/gi, 'ಐವರ್ಮೆಕ್ಟಿನ್')
      .replace(/Ceftiofur/gi, 'ಸೆಫ್ಟಿಯೋಫರ್')
      .replace(/Topicure/gi, 'ಟಾಪಿಕೂರ್')
      .replace(/Amoxicillin/gi, 'ಅಮೋಕ್ಸಿಸಿಲಿನ್');
  } else if (lang === 'hi-IN') {
    cleaned = cleaned
      .replace(/0\.1%/g, 'शून्य दशमलव एक प्रतिशत')
      .replace(/%/g, ' प्रतिशत ')
      .replace(/100ml/gi, 'सौ मिलीलीटर')
      .replace(/200ml/gi, 'दो सौ मिलीलीटर')
      .replace(/FMD/gi, 'एफ एम डी खुरपका')
      .replace(/LSD/gi, 'एल एस डी लम्पी');
  }

  return cleaned;
}

export interface LaxmiVoiceAssistantProps {
  mode?: 'float' | 'page';
}

export default function LaxmiVoiceAssistant({ mode = 'float' }: LaxmiVoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(mode === 'page');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('kn-IN'); // Default to Kannada
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Initial Welcome Messages per Language
  const getWelcomeMessage = (lang: SupportedLang): string => {
    switch (lang) {
      case 'kn-IN':
        return 'ನಮಸ್ಕಾರ! ನಾನು ಲಕ್ಷ್ಮಿ, ನಿಮ್ಮ ಪಶುವರ್ಸ್ ಎಐ ಮಿತ್ರ 🐄. ನಿಮ್ಮ ದನ ಅಥವಾ ಎಮ್ಮೆಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ, ಜ್ವರ, ಹಾಲು ಇಳುವರಿ ಅಥವಾ ಯಾವುದೇ ಲಕ್ಷಣವನ್ನು ಧ್ವನಿಯಲ್ಲಿ ತಿಳಿಸಿ. ನಾನು ನೀವು ನೀಡುವ ಭಾಷೆಯಲ್ಲೇ ತಕ್ಷಣವೇ ರೋಗ ನಿವಾರಣೆ ಮತ್ತು ಔಷಧಿ ನೀಡುತ್ತೇನೆ!';
      case 'hi-IN':
        return 'नमस्ते जी! मैं लक्ष्मी, आपकी पशुपति AI मित्रा 🐄. आप अपनी गाय या भैंस की बीमारी या लक्षण बोलकर बताएं, मैं उसी भाषा में तुरंत सटीक इलाज और दवाई दूंगी!';
      default:
        return 'Welcome! I am Laxmi, your Pashuverse AI Mitra 🐄. Speak your livestock symptoms in any language, and I will reply back in that exact same language!';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'laxmi',
      text: getWelcomeMessage('kn-IN'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Switch Active Assistant Language
  const handleLanguageChange = (lang: SupportedLang) => {
    setSelectedLang(lang);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const welcome = getWelcomeMessage(lang);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'laxmi',
        text: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    speakText(welcome, lang);
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // High Quality Cloud TTS Engine (Sarvam AI Key: ap2_10401a92-7883-4304-a630-b8f2bfc5e6a9) + Web Speech Fallback
  const speakText = async (text: string, overrideLang?: SupportedLang) => {
    if (!audioEnabled) return;

    // Stop previous audio playback or browser speech
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Clean text for speech output (remove markdown, brackets & emojis)
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~]/g, '')
      .replace(/\(.*?\)|\{.*?\}/g, '')
      .trim();

    if (!cleanText) return;

    const targetLang = overrideLang || selectedLang;
    setIsSpeaking(true);

    // 1. Call Sarvam AI Text-to-Speech API (API Key: ap2_10401a92-7883-4304-a630-b8f2bfc5e6a9)
    try {
      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          targetLanguage: targetLang,
          speaker: 'meera'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audios && data.audios[0]) {
          const audioSrc = `data:audio/wav;base64,${data.audios[0]}`;
          const audio = new Audio(audioSrc);
          activeAudioRef.current = audio;
          
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => speakBrowserFallback(cleanText, targetLang);
          
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Sarvam API TTS call failed, falling back to SpeechSynthesis:", err);
    }

    // 2. Fallback to Browser Speech Synthesis
    speakBrowserFallback(cleanText, targetLang);
  };

  const speakBrowserFallback = (cleanText: string, targetLang: SupportedLang) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    utterance.rate = targetLang === 'kn-IN' ? 0.88 : 0.92;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    let chosenVoice = null;

    if (targetLang === 'kn-IN') {
      chosenVoice = voices.find(v => 
        v.lang.toLowerCase().includes('kn') || 
        v.name.toLowerCase().includes('kannada') || 
        v.name.includes('Google ಕನ್ನಡ')
      );
    } else if (targetLang === 'hi-IN') {
      chosenVoice = voices.find(v => 
        v.lang.toLowerCase().includes('hi') || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.includes('Google हिंदी')
      );
    }

    if (!chosenVoice) {
      chosenVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0])) || 
                    voices.find(v => v.name.toLowerCase().includes('female')) || 
                    voices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Web Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setInputText(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleSendMessage(transcript, true);
          setTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [transcript, selectedLang]);

  const toggleListening = () => {
    stopSpeaking();

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setTranscript('');
        setInputText('');
        try {
          recognitionRef.current.lang = selectedLang;
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn("Could not start speech recognition:", e);
        }
      } else {
        alert("Speech Recognition is not supported on this browser. Please type your query.");
      }
    }
  };

  // Multi-lingual Diagnostic Logic matching the Input Language EXACTLY
  const diagnoseSymptomsAndRespond = async (userText: string, lang: SupportedLang): Promise<{ 
    reply: string; 
    actionUrl?: string; 
    actionLabel?: string;
    diagnosisDetails?: {
      disease: string;
      reason: string;
      treatment: string;
      medicines: string[];
    }
  }> => {
    const text = userText.toLowerCase();

    // Call API backend in background
    try {
      fetch('/api/disease-predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animalId: 1, symptoms: userText })
      }).catch(err => console.log("API log warning:", err));
    } catch (e) {}

    // ----------------------------------------------------
    // 1. KANNADA LANGUAGE INPUT -> KANNADA REPLY
    // ----------------------------------------------------
    if (lang === 'kn-IN') {
      if (text.includes("ಜ್ವರ") || text.includes("fever") || text.includes("ಕಾವು") || text.includes("ಬಿಸಿ") || text.includes("ಕಾಯುತ್ತಿದೆ") || text.includes("jwara")) {
        return {
          reply: "ನಿಮ್ಮ ಹಸುವಿಗೆ ಜ್ವರವಿದ್ದರೆ, ತಕ್ಷಣವೇ ಅದನ್ನು ನೆರಳಿರುವ ಗಾಳಿಯಾಡುವ ಸ್ಥಳದಲ್ಲಿ ಕಟ್ಟಿರಿ. ಬೆನ್ನಿನ ಮೇಲೆ ತಣ್ಣೀರು ಚಿಮುಕಿಸಿ, ಮೆಲೋಕ್ಸಿಕಮ್ ಮಾತ್ರೆ (Meloxicam) ನೀಡಿ ಮತ್ತು ರಾಗಿ ಗಂಜಿ ನೀಡಿ. ಇದು ಶೀಘ್ರ ಗುಣಮುಖ ನೀಡುತ್ತದೆ.",
          actionUrl: "/appointments",
          actionLabel: "ಪಶುವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ 📹",
          diagnosisDetails: {
            disease: "ಸಾಮಾನ್ಯ ಜ್ವರ (Bovine Pyrexia)",
            reason: "ಹವಾಮಾನ ಬದಲಾವಣೆ ಅಥವಾ ವೈರಲ್ ಸೋಂಕಿನಿಂದ ದೇಹದ ಉಷ್ಣತೆ ಹೆಚ್ಚಾಗಿದೆ.",
            treatment: "ತಣ್ಣೀರಿನಿಂದ ಮೈ ಒರೆಸಿ, ಮೆಲೋಕ್ಸಿಕಮ್ (Meloxicam 0.5mg/kg) ಮಾತ್ರೆ ನೀಡಿ. ದಿನಕ್ಕೆ 30 ಲೀಟರ್ ಶುದ್ಧ ನೀರು ಕುಡಿಸಿ.",
            medicines: ["Meloxicam & Paracetamol Bolus", "Ceftiofur Injection", "Electrolyte Supplement"]
          }
        };
      }

      if (text.includes("ಗಂಟು") || text.includes("lumpy") || text.includes("lsd") || text.includes("ಚರ್ಮ") || text.includes("ಗುಳ್ಳೆ") || text.includes("gantu")) {
        return {
          reply: "ಇದು ಗಂಟು ಚರ್ಮ ರೋಗದ (LSD) ಲಕ್ಷಣವಾಗಿದೆ. ಚರ್ಮದ ಗಂಟುಗಳ ಮೇಲೆ ಕಹಿಬೇವು ಮತ್ತು ಅರಿಶಿನದ ಪೇಸ್ಟ್ ಹಚ್ಚಿ. ಐವರ್ಮೆಕ್ಟಿನ್ ಇಂಜೆಕ್ಷನ್ ಮತ್ತು ಗೋಟ್ ಪಾಕ್ಸ್ ಲಸಿಕೆ ನೀಡುವುದು ಅತ್ಯಗತ್ಯ.",
          actionUrl: "/vaccinations",
          actionLabel: "ಎಲ್‌ಎಸ್‌ಡಿ ಲಸಿಕೆ ಪರಿಶೀಲಿಸಿ 💉",
          diagnosisDetails: {
            disease: "ಗಂಟು ಚರ್ಮ ರೋಗ (Lumpy Skin Disease - LSD)",
            reason: "ನೊಣಗಳು, ಸೊಳ್ಳೆಗಳು ಮತ್ತು ಉಣ್ಣೆಗಳಿಂದ ಕ್ಯಾಪ್ರಿಪಾಕ್ಸ್ ವೈರಸ್ ಪಸರಿಸುತ್ತದೆ.",
            treatment: "ಕಹಿಬೇವು ಮತ್ತು ಅರಿಶಿನದ ಪೇಸ್ಟ್ ಹಚ್ಚಿ. ಐವರ್ಮೆಕ್ಟಿನ್ ಇಂಜೆಕ್ಷನ್ (Ivermectin S.C.) ನೀಡಿ.",
            medicines: ["Ivermectin 1% Injection", "Paracetamol Bolus", "Goat Pox Vaccine"]
          }
        };
      }

      if (text.includes("ಕಾಲುಬಾಯಿ") || text.includes("ಎಫ್‌ಎಂಡಿ") || text.includes("fmd") || text.includes("ಬಾಯಿ ಹುಣ್ಣು") || text.includes("ಕಾಲು ಹುಣ್ಣು") || text.includes("bayi")) {
        return {
          reply: "ಇದು ಕಾಲುಬಾಯಿ ರೋಗದ (FMD) ಲಕ್ಷಣವಾಗಿದೆ. 0.1% ಪೊಟ್ಯಾಸಿಯಮ್ ಪರ್ಮಾಂಗನೇಟ್ ನೀರಿನಿಂದ ಬಾಯಿ ಮತ್ತು ಕಾಲಿನ ಗಾಯಗಳನ್ನು ತೊಳೆಯಿರಿ. ಟಾಪಿಕೂರ್ ಸ್ಪ್ರೇ ಹಚ್ಚಿ.",
          actionUrl: "/vaccinations",
          actionLabel: "ಎಫ್‌ಎಂಡಿ ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ 💉",
          diagnosisDetails: {
            disease: "ಕಾಲುಬಾಯಿ ರೋಗ (Foot and Mouth Disease - FMD)",
            reason: "ಅಫ್ತೋವೈರಸ್ ನಂಜಿನಿಂದ ದನಗಳಲ್ಲಿ ಬಾಯಿ ಮತ್ತು ಖುರಗಳಲ್ಲಿ ಹುಣ್ಣುಂಟಾಗುತ್ತದೆ.",
            treatment: "0.1% Potassium Permanganate ನೀರಿನಿಂದ ಬಾಯಿ ತೊಳೆಯಿರಿ. ಟಾಪಿಕೂರ್ ಸ್ಪ್ರೇ ಹಚ್ಚಿ.",
            medicines: ["Topicure Antiseptic Spray", "Ceftiofur Injection", "FMD Vaccine"]
          }
        };
      }

      if (text.includes("ಕೆಚ್ಚಲು") || text.includes("ಹಾಲು") || text.includes("ರಕ್ತ") || text.includes("ಮಾಸ್ಟೈಟಿಸ್") || text.includes("halu")) {
        return {
          reply: "ಇದು ಕೆಚ್ಚಲು ಊತದ (Mastitis) ಲಕ್ಷಣವಾಗಿದೆ. ರೋಗಪೀಡಿತ ಕೆಚ್ಚಲನ್ನು ದಿನಕ್ಕೆ 4 ಬಾರಿ ಪೂರ್ಣವಾಗಿ ಕರೆಯಿರಿ. ಅಮೋಕ್ಸಿಸಿಲಿನ್ ಇಂಟ್ರಾಮಾಮರಿ ಟ್ಯೂಬ್ ಬಳಸಿ.",
          actionUrl: "/appointments",
          actionLabel: "ಡಾಕ್ಟರ್ ಸಂಪರ್ಕಿಸಿ 📹",
          diagnosisDetails: {
            disease: "ಕೆಚ್ಚಲು ಊತ ರೋಗ (Acute Bovine Mastitis)",
            reason: "ಶುಚಿತ್ವದ ಕೊರತೆ ಅಥವಾ ಬ್ಯಾಕ್ಟೀರಿಯಾಗಳು ಕೆಚ್ಚಲಿನ ರಂಧ್ರದ ಮೂಲಕ ಒಳಗೆ ಹೋಗಿ ಸೋಂಕುಂಟುಮಾಡುತ್ತವೆ.",
            treatment: "ಕೆಚ್ಚಲನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಕರೆಯಿರಿ. ಅಮೋಕ್ಸಿಸಿಲಿನ್ ಟ್ಯೂಬ್ ಇಂಟ್ರಾಮಾಮರಿ ನೀಡಿ.",
            medicines: ["Amoxicillin Intramammary Infusion", "0.5% Iodine Teat Dip"]
          }
        };
      }

      if (text.includes("ಹೊಟ್ಟೆ") || text.includes("ಉಬ್ಬರ") || text.includes("ಗ್ಯಾಸ್") || text.includes("bloat")) {
        return {
          reply: "ಹೊಟ್ಟೆ ಊತಕ್ಕೆ (Rumen Bloat) ತಕ್ಷಣವೇ ಪಶುವಿಗೆ 200ml ಸಾಸಿವೆ ಎಣ್ಣೆಯನ್ನು ನೀಡಿ. ಪಶುವನ್ನು ನಿಧಾನವಾಗಿ ನಡೆಸಿ, ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ನಿಲ್ಲಿಸಿ.",
          actionUrl: "/appointments",
          actionLabel: "ಪಶುವೈದ್ಯರ ಸಲಹೆ 📹",
          diagnosisDetails: {
            disease: "ಹೊಟ್ಟೆ ಊತ / ಗ್ಯಾಸ್ (Rumen Bloat)",
            reason: "ಅತಿಯಾದ ಹಸಿರು ಹುಲ್ಲು ಅಥವಾ ಜೀರ್ಣಕ್ರಿಯೆಯಲ್ಲಿ ಗ್ಯಾಸ್ ಉಂಟಾಗುವುದು.",
            treatment: "200ml ಸಾಸಿವೆ ಎಣ್ಣೆ ಕೊಡಿ. ಪಶುವನ್ನು ನಡೆಸಿಕೊಂಡು ಹೋಗಿ.",
            medicines: ["Anti-Bloat Bloatosil Emulsion", "Mustard Oil"]
          }
        };
      }

      return {
        reply: "ನಿಮ್ಮ ಪಶುವಿನ ಲಕ್ಷಣಗಳನ್ನು ಆಲಿಸಿದ್ದೇನೆ. ಪಶುವಿಗೆ ಶುದ್ಧ ನೀರು ಮತ್ತು ನರಮ್ ಗಂಜಿ ನೀಡಿ. ತೀವ್ರ ಲಕ್ಷಣವಿದ್ದರೆ ನಮ್ಮ ಟೆಲಿ-ವೆಟ್ ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        actionUrl: "/appointments",
        actionLabel: "ಪಶುವೈದ್ಯರ ನೇರ ಸಂಪರ್ಕ 📹",
        diagnosisDetails: {
          disease: "ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ತಪಾಸಣೆ (Supportive Livestock Care)",
          reason: "ಋತುಮಾನ ಬದಲಾವಣೆ ಅಥವಾ ಜೀರ್ಣಕ್ರಿಯೆಯಲ್ಲಿ ವ್ಯತ್ಯಾಸ.",
          treatment: "ಶುದ್ಧ ನೀರು ಮತ್ತು ಪ್ರೋಟೀನ್ ಆಹಾರ ನೀಡಿ.",
          medicines: ["Vitamin & Mineral Mixture", "Calcium Oral Tonic"]
        }
      };
    }

    // ----------------------------------------------------
    // 2. HINDI LANGUAGE INPUT -> HINDI REPLY
    // ----------------------------------------------------
    if (lang === 'hi-IN') {
      if (text.includes("fever") || text.includes("bukhar") || text.includes("garam") || text.includes("bimar")) {
        return {
          reply: "आपकी गाय को बुखार है. तुरंत ठंडे स्थान पर बांधें, पीठ पर ठंडा पानी डालें और मेलोक्सिकैम टेबलेट दें. इससे तुरंत आराम मिलेगा.",
          actionUrl: "/appointments",
          actionLabel: "डॉक्टर से बात करें 📹",
          diagnosisDetails: {
            disease: "बुखार (Bovine Pyrexia / Fever)",
            reason: "मौसम में बदलाव या वायरल इन्फेक्शन.",
            treatment: "पीठ पर ठंडा पानी डालें. मेलोक्सिकैम (Meloxicam 0.5mg/kg) दें.",
            medicines: ["Meloxicam Bolus", "Ceftiofur Injection", "Electrolytes"]
          }
        };
      }

      if (text.includes("lsd") || text.includes("lumpy") || text.includes("gath") || text.includes("skin")) {
        return {
          reply: "लम्पी स्किन बीमारी के लक्षणों में त्वचा की गांठों पर नीम और हल्दी का लेप लगाएं. आइवरमेक्टिन इंजेक्शन और गोट पॉक्स वैक्सीन लगवाएं.",
          actionUrl: "/vaccinations",
          actionLabel: "टीकाकरण देखें 💉",
          diagnosisDetails: {
            disease: "लम्पी स्किन रोग (Lumpy Skin Disease - LSD)",
            reason: "मक्खियों और मच्छरों से कैप्रीपॉक्स वायरस का फैलाव.",
            treatment: "नीम और हल्दी का लेप लगाएं. आइवरमेक्टिन इंजेक्शन दें.",
            medicines: ["Ivermectin 1% Injection", "Paracetamol Bolus", "Goat Pox Vaccine"]
          }
        };
      }

      if (text.includes("fmd") || text.includes("khurpaka") || text.includes("muhpaka") || text.includes("chhale")) {
        return {
          reply: "खुरपका-मुंहपका (FMD) में 0.1% लाल दवा (पोटैशियम परमैंगनेट) पानी से छालों को धोएं. टॉपीक्योर स्प्रे लगाएं और नरम दलिया खिलाएं.",
          actionUrl: "/vaccinations",
          actionLabel: "FMD वैक्सीन देखें 💉",
          diagnosisDetails: {
            disease: "खुरपका-मुंहपका (Foot & Mouth Disease - FMD)",
            reason: "एफ़थोवायरस संक्रमण से मुंह और खुरों में छाले.",
            treatment: "0.1% Potassium Permanganate पानी से छाले धोएं. टॉपीक्योर स्प्रे लगाएं.",
            medicines: ["Topicure Antiseptic Spray", "Ceftiofur Sodium Injection"]
          }
        };
      }

      if (text.includes("doodh") || text.includes("fat") || text.includes("milk")) {
        return {
          reply: "दूध और फैट बढ़ाने के लिए रोजाना 100ml कैल्शियम टॉनिक, पशु-न्यूट्री प्रोटीन फीड और हरा चारा दें.",
          actionUrl: "/marketplace",
          actionLabel: "पशु आहार खरीदें 🛒",
          diagnosisDetails: {
            disease: "दूध उत्पादन वृद्धि (Milk Yield Enhancement)",
            reason: "पोषक तत्वों और कैल्शियम की कमी.",
            treatment: "100ml कैल्शियम और बाईपास फैट दें.",
            medicines: ["Pashu-Nutri High Protein Feed", "Calcium Tonic 100ml"]
          }
        };
      }

      return {
        reply: "आपके पशु के लक्षण दर्ज कर लिए गए हैं. साफ पानी और दलिया दें. अधिक सहायता के लिए हमारे टेली-वेट डॉक्टर से बात करें.",
        actionUrl: "/appointments",
        actionLabel: "टेली-वेट डॉक्टर 📹",
        diagnosisDetails: {
          disease: "सामान्य स्वास्थ्य सलाह (Supportive Care)",
          reason: "मौसम में बदलाव या पाचन संबंधी समस्या.",
          treatment: "ताजा पानी और सुपाच्य आहार दें.",
          medicines: ["Mineral Mixture", "Calcium Tonic"]
        }
      };
    }

    // ----------------------------------------------------
    // 3. ENGLISH LANGUAGE INPUT -> ENGLISH REPLY
    // ----------------------------------------------------
    if (text.includes("fever") || text.includes("temp") || text.includes("hot")) {
      return {
        reply: "High fever detected in cattle. Immediately isolate the animal in a cool shaded shed. Apply cold water compresses, administer Meloxicam 0.5mg/kg bolus, and offer soft cereal mash.",
        actionUrl: "/appointments",
        actionLabel: "Consult Tele-Vet 📹",
        diagnosisDetails: {
          disease: "Bovine Pyrexia (Fever)",
          reason: "Viral or bacterial immune response due to weather change.",
          treatment: "Cold compress, hydration, Meloxicam administration.",
          medicines: ["Meloxicam Injection", "Ceftiofur Sodium Injection", "Oral Electrolytes"]
        }
      };
    }

    if (text.includes("lumpy") || text.includes("lsd") || text.includes("skin") || text.includes("nodule")) {
      return {
        reply: "Lumpy Skin Disease (LSD) indicated. Apply neem and turmeric paste to skin nodules. Administer Ivermectin S.C. injection and Goat Pox vaccine for protection.",
        actionUrl: "/vaccinations",
        actionLabel: "View Vaccine Schedule 💉",
        diagnosisDetails: {
          disease: "Lumpy Skin Disease (LSD)",
          reason: "Capripoxvirus vector transmission via biting insects.",
          treatment: "Neem paste on nodules, Ivermectin administration.",
          medicines: ["Ivermectin 1% Injection", "Paracetamol Bolus", "Goat Pox Vaccine"]
        }
      };
    }

    if (text.includes("fmd") || text.includes("foot") || text.includes("mouth") || text.includes("lesion") || text.includes("saliva")) {
      return {
        reply: "Foot and Mouth Disease (FMD) symptoms recognized. Wash mouth and hoof sores with 0.1% Potassium Permanganate solution. Apply Topicure spray.",
        actionUrl: "/vaccinations",
        actionLabel: "Check FMD Vaccine 💉",
        diagnosisDetails: {
          disease: "Foot and Mouth Disease (FMD)",
          reason: "Aphthovirus contagion spread via contaminated feed or aerosols.",
          treatment: "Wash lesions with 0.1% Potassium Permanganate. Apply Topicure spray.",
          medicines: ["Topicure Spray", "Ceftiofur Injection", "FMD Polyvalent Vaccine"]
        }
      };
    }

    if (text.includes("milk") || text.includes("yield") || text.includes("fat")) {
      return {
        reply: "To boost milk yield and fat content, provide 100ml Calcium Tonic daily, Pashu-Nutri high protein feed, and plenty of clean fresh water.",
        actionUrl: "/marketplace",
        actionLabel: "Browse Pashu-Nutri Feed 🛒",
        diagnosisDetails: {
          disease: "Milk Yield Enhancement",
          reason: "Nutritional shortfall or calcium deficit.",
          treatment: "Daily 100ml Calcium Tonic & bypass fat supplementation.",
          medicines: ["Pashu-Nutri Protein Feed", "Oral Calcium Tonic 100ml"]
        }
      };
    }

    return {
      reply: "Your livestock symptoms have been evaluated. Provide fresh water and soft mash feed. If symptoms persist, consult our Tele-Vet doctor.",
      actionUrl: "/appointments",
      actionLabel: "Consult Tele-Vet Doctor 📹",
      diagnosisDetails: {
        disease: "Supportive Livestock Care",
        reason: "Mild digestive or environmental adjustment.",
        treatment: "Provide fresh water, shade, and balanced mineral mix.",
        medicines: ["Mineral Mixture Powder", "Calcium Oral Tonic"]
      }
    };
  };

  const handleSendMessage = async (textToSend?: string, isVoiceInput = false) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // AUTOMATICALLY DETECT INPUT LANGUAGE (Kannada / Hindi / English)
    const detectedLanguage = detectInputLanguage(query, selectedLang);
    if (detectedLanguage !== selectedLang) {
      setSelectedLang(detectedLanguage);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: isVoiceInput,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsDiagnosing(true);

    // Run AI Diagnosis Engine in the EXACT DETECTED INPUT LANGUAGE
    const laxmiResponse = await diagnoseSymptomsAndRespond(query, detectedLanguage);
    
    setTimeout(() => {
      const laxmiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'laxmi',
        text: laxmiResponse.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl: laxmiResponse.actionUrl,
        actionLabel: laxmiResponse.actionLabel,
        diagnosisDetails: laxmiResponse.diagnosisDetails
      };

      setMessages(prev => [...prev, laxmiMsg]);
      setIsDiagnosing(false);

      // Speak Laxmi's diagnosis & answer aloud in Sarvam AI Cloud TTS in the DETECTED LANGUAGE
      speakText(laxmiResponse.reply, detectedLanguage);
    }, 500);
  };

  return (
    <>
      {/* Floating Trigger Widget (Bottom-Right) */}
      {mode === 'float' && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setIsOpen(true)}
                className="bg-slate-900/95 border-2 border-primary/60 text-white px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur cursor-pointer hover:border-primary transition-all flex items-center gap-3 group ring-1 ring-primary/20"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                </div>
                <div>
                  <span className="text-xs font-bold font-display block text-white flex items-center gap-1">
                    ಲಕ್ಷ್ಮಿ AI Auto-Language Mitra <Languages className="w-3 h-3 text-primary" />
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">Auto-Detects Your Spoken Language</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full shadow-2xl cursor-pointer relative overflow-hidden transition-all duration-300 ${
              isOpen ? 'bg-slate-900 border-2 border-slate-700 text-white' : 'bg-primary hover:bg-primary/90 text-slate-950 font-bold'
            }`}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Bot className="w-7 h-7 text-slate-950" />
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Main Laxmi Voice & Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={mode === 'float' ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 0, y: 15 }}
            animate={mode === 'float' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0 }}
            exit={mode === 'float' ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className={
              mode === 'page'
                ? "w-full max-w-4xl h-[70vh] flex flex-col rounded-3xl border-2 border-primary/40 bg-slate-950/95 text-white shadow-2xl overflow-hidden glass-panel backdrop-blur-2xl mx-auto"
                : "fixed bottom-24 right-4 md:right-8 z-50 w-[92vw] sm:w-[450px] max-h-[85vh] flex flex-col rounded-3xl border-2 border-primary/50 bg-slate-950/95 text-white shadow-2xl overflow-hidden glass-panel backdrop-blur-2xl"
            }
          >
            {/* Laxmi Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-primary/20 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg font-display">
                    🐮
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-950">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-white">Laxmi Auto-Language Voice AI</h3>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-1.5 py-0">
                      {selectedLang === 'kn-IN' ? 'ಕನ್ನಡ Active' : selectedLang === 'hi-IN' ? 'हिंदी Active' : 'English Active'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">REPLIES IN YOUR SPOKEN LANGUAGE</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Audio Speech Toggle */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setAudioEnabled(!audioEnabled);
                  }}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-white"
                  title={audioEnabled ? "Mute Laxmi Voice" : "Enable Laxmi Voice"}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </Button>

                {mode === 'float' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Dynamic Active Language Selector Bar */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-primary" /> Active Language (ಸ್ವಯಂಚಾಲಿತ):
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleLanguageChange('kn-IN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === 'kn-IN' ? 'bg-primary text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
                <button
                  onClick={() => handleLanguageChange('hi-IN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === 'hi-IN' ? 'bg-primary text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => handleLanguageChange('en-IN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === 'en-IN' ? 'bg-primary text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Voice Status Bar */}
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isListening ? (
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold animate-pulse">
                    <Radio className="w-3.5 h-3.5" /> 
                    {selectedLang === 'kn-IN' ? 'ಧ್ವನಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ... (ಮಾತನಾಡಿ)' : selectedLang === 'hi-IN' ? 'आवाज़ सुनी जा रही है...' : 'Listening to your voice...'}
                  </span>
                ) : isSpeaking ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" /> 
                    {selectedLang === 'kn-IN' ? 'ಲಕ್ಷ್ಮಿ ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ (Sarvam AI Voice)...' : 'Laxmi Speaking (Sarvam AI Voice)...'}
                  </span>
                ) : isDiagnosing ? (
                  <span className="flex items-center gap-1.5 text-primary font-bold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> AI Diagnosing in your language...
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    {selectedLang === 'kn-IN' ? 'ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ (Tap Mic to Speak)' : 'Tap Mic to Speak'}
                  </span>
                )}
              </div>

              {isSpeaking && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={stopSpeaking}
                  className="h-6 px-2 text-[10px] border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Square className="w-3 h-3 mr-1" /> Stop
                </Button>
              )}
            </div>

            {/* Chat Conversation Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[46vh] custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-primary text-slate-950 font-bold rounded-br-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {msg.sender === 'laxmi' && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs text-primary font-extrabold uppercase font-display border-b border-slate-800 pb-1">
                        <Bot className="w-3.5 h-3.5" /> Laxmi AI Response ({selectedLang})
                      </div>
                    )}
                    
                    <p className="whitespace-pre-wrap leading-relaxed font-semibold text-slate-100">{msg.text}</p>

                    {/* Diagnostic Breakdown Card */}
                    {msg.diagnosisDetails && (
                      <div className="mt-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5 shadow-inner">
                        <div className="flex items-center justify-between text-primary font-extrabold text-xs">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {msg.diagnosisDetails.disease}
                          </span>
                        </div>

                        <div className="text-sm text-slate-100 leading-relaxed">
                          <strong className="text-slate-300">Reason / ಕಾರಣ:</strong> {msg.diagnosisDetails.reason}
                        </div>

                        <div className="text-sm text-slate-100 leading-relaxed">
                          <strong className="text-slate-300">Treatment / ಚಿಕಿತ್ಸೆ:</strong> {msg.diagnosisDetails.treatment}
                        </div>

                        {msg.diagnosisDetails.medicines && msg.diagnosisDetails.medicines.length > 0 && (
                          <div className="pt-2.5 border-t border-slate-800">
                            <span className="text-xs font-bold text-emerald-400 block mb-1.5 flex items-center gap-1">
                              <Pill className="w-3.5 h-3.5" /> Prescribed Medicines:
                            </span>
                            <ul className="list-disc list-inside text-sm text-slate-100 space-y-1 font-mono">
                              {msg.diagnosisDetails.medicines.map((m, idx) => (
                                <li key={idx} className="font-semibold">{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Shortcut Button */}
                    {msg.actionUrl && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <a href={msg.actionUrl} onClick={() => setIsOpen(false)}>
                          <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold text-[11px] h-7 cursor-pointer">
                            {msg.actionLabel || "View Action →"}
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800 overflow-x-auto whitespace-nowrap custom-scrollbar flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">Quick Input:</span>
              <button
                onClick={() => handleSendMessage("ನನ್ನ ಹಸುವಿಗೆ ಜ್ವರ ಬಂದಿದೆ", false)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-semibold cursor-pointer shrink-0"
              >
                🐮 ಕನ್ನಡ: ಹಸುವಿಗೆ ಜ್ವರ
              </button>
              <button
                onClick={() => handleSendMessage("गाय को बुखार है", false)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-semibold cursor-pointer shrink-0"
              >
                🐮 हिंदी: गाय को बुखार
              </button>
              <button
                onClick={() => handleSendMessage("My cow has high fever and blisters", false)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-semibold cursor-pointer shrink-0"
              >
                🐮 English: Cow Fever
              </button>
            </div>

            {/* Input & Voice Controls Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              {/* Main Prominent Mic Button */}
              <Button
                type="button"
                onClick={toggleListening}
                className={`w-11 h-11 rounded-xl shrink-0 cursor-pointer shadow-lg transition-all ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-500/40' 
                    : 'bg-primary hover:bg-primary/90 text-slate-950 font-bold'
                }`}
                title="Tap to Speak in any language"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                className="flex-1 flex items-center gap-2"
              >
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening 
                      ? "Listening to your voice..." 
                      : "Speak or type in Kannada, Hindi or English..."
                  }
                  className="bg-slate-950 border-slate-800 text-white text-xs h-10"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!inputText.trim()}
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-primary" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
