import { Router, type IRouter } from "express";

const router: IRouter = Router();
const SARVAM_API_KEY = process.env.SARVAM_TTS_API_KEY || "ap2_10401a92-7883-4304-a630-b8f2bfc5e6a9";

// High-Proficiency Phonetic Preprocessor for Sarvam AI TTS Engine
function phoneticPreprocess(text: string, lang: string): string {
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
      .replace(/FMD/gi, 'ಎಫ್ ಎಂ ಡಿ ಕಾಲುಬಾಯಿ')
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

router.post("/tts/speak", async (req, res): Promise<void> => {
  try {
    const { text, targetLanguage = "kn-IN", speaker = "meera" } = req.body || {};

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text prompt is required" });
      return;
    }

    const processedText = phoneticPreprocess(text, targetLanguage);

    // Sarvam AI Text-to-Speech Endpoint
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [processedText.substring(0, 500)],
        target_language_code: targetLanguage || "kn-IN",
        speaker: speaker || "meera",
        pitch: 0,
        pace: 0.95, // Native spoken pacing for maximum clarity
        loudness: 1.5,
        speech_sample_rate: 16000,
        enable_preprocessing: true,
        model: "bulbul:v1"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Sarvam TTS API response non-ok:", response.status, errText);
      res.status(response.status).json({ error: "TTS API failed", details: errText });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error calling Sarvam TTS API:", error);
    res.status(500).json({ error: "Internal server error calling TTS API", details: error.message });
  }
});

export default router;
