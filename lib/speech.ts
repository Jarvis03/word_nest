const VOICE_KEY = "word-nest:voice";
const RATE_KEY = "word-nest:playback-rate";

export function saveSpeechPreferences(voiceName: string | null, rate: number) {
  window.localStorage.setItem(VOICE_KEY, voiceName ?? "");
  window.localStorage.setItem(RATE_KEY, String(rate));
}

export function getSpeechPreferences() {
  const storedRate = Number(window.localStorage.getItem(RATE_KEY));
  return {
    voiceName: window.localStorage.getItem(VOICE_KEY) || null,
    rate: Number.isFinite(storedRate) && storedRate >= 0.5 && storedRate <= 1.5 ? storedRate : 0.92,
  };
}

export function chooseEnglishVoice(voices: SpeechSynthesisVoice[], preferredName?: string | null) {
  if (preferredName) {
    const preferred = voices.find((voice) => voice.name === preferredName);
    if (preferred) return preferred;
  }

  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const qualityNames = ["natural", "aria", "jenny", "guy", "google", "samantha", "daniel", "ava"];
  return english.find((voice) => qualityNames.some((name) => voice.name.toLowerCase().includes(name)))
    ?? english.find((voice) => voice.default)
    ?? english[0]
    ?? null;
}

export function speakEnglish(text: string) {
  if (!("speechSynthesis" in window) || !text.trim()) return;
  const synthesis = window.speechSynthesis;
  const preferences = getSpeechPreferences();
  let spoken = false;

  const play = () => {
    if (spoken) return;
    spoken = true;
    synthesis.cancel();
    const voice = chooseEnglishVoice(synthesis.getVoices(), preferences.voiceName);
    const chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
    chunks.forEach((chunk) => {
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      utterance.lang = "en-US";
      utterance.rate = preferences.rate;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;
      synthesis.speak(utterance);
    });
  };

  if (synthesis.getVoices().length) {
    play();
    return;
  }

  synthesis.addEventListener("voiceschanged", play, { once: true });
  window.setTimeout(play, 300);
}
