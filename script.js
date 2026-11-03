/* ==========================================================================
   Language Translation Tool - Application Logic
   CodeAlpha Artificial Intelligence Internship - Task 1
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------------------
  const sourceLangSelect = document.getElementById("sourceLanguage");
  const targetLangSelect = document.getElementById("targetLanguage");
  const swapLanguagesBtn = document.getElementById("swapLanguagesBtn");
  
  const sourceText = document.getElementById("sourceText");
  const targetText = document.getElementById("targetText");
  const charCount = document.getElementById("charCount");
  
  const translateBtn = document.getElementById("translateBtn");
  const clearInputBtn = document.getElementById("clearInputBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const statusBadge = document.getElementById("statusBadge");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const apiIndicator = document.getElementById("apiIndicator");
  
  const micBtn = document.getElementById("micBtn");
  const speakSourceBtn = document.getElementById("speakSourceBtn");
  const copySourceBtn = document.getElementById("copySourceBtn");
  
  const speakTargetBtn = document.getElementById("speakTargetBtn");
  const copyTargetBtn = document.getElementById("copyTargetBtn");
  const saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
  
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  
  const historyBtn = document.getElementById("historyBtn");
  const historyModal = document.getElementById("historyModal");
  const closeHistoryBtn = document.getElementById("closeHistoryBtn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const historyList = document.getElementById("historyList");
  const emptyHistoryState = document.getElementById("emptyHistoryState");
  const historyCountBadge = document.getElementById("historyCountBadge");
  const toastContainer = document.getElementById("toastContainer");

  // -------------------------------------------------------------------------
  // State Management & Audio Handles
  // -------------------------------------------------------------------------
  let isTranslating = false;
  let recognition = null;
  let isListening = false;
  let translationHistory = [];
  let currentAudio = null;
  let availableVoices = [];
  let detectedSourceLang = null;

  const STORAGE_KEY_HISTORY = "codealpha_translation_history";
  const STORAGE_KEY_THEME = "codealpha_theme";

  // BCP 47 Language Tag Mapping for Accurate Speech Synthesis & Recognition
  const BCP47_MAP = {
    en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT",
    pt: "pt-PT", ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR",
    ar: "ar-SA", hi: "hi-IN", bn: "bn-BD", ur: "ur-PK", tr: "tr-TR",
    nl: "nl-NL", pl: "pl-PL", sv: "sv-SE", no: "no-NO", da: "da-DK",
    fi: "fi-FI", el: "el-GR", cs: "cs-CZ", ro: "ro-RO", hu: "hu-HU",
    id: "id-ID", ms: "ms-MY", th: "th-TH", vi: "vi-VN", uk: "uk-UA",
    he: "he-IL", fa: "fa-IR", sw: "sw-KE", am: "am-ET", om: "om-ET",
    ti: "ti-ET", ta: "ta-IN", te: "te-IN", mr: "mr-IN", gu: "gu-IN",
    pa: "pa-IN", fil: "fil-PH", af: "af-ZA", sq: "sq-AL", bg: "bg-BG",
    ca: "ca-ES", hr: "hr-HR", sk: "sk-SK", sl: "sl-SI", et: "et-EE",
    lv: "lv-LV", lt: "lt-LT"
  };

  // Preload Voices for SpeechSynthesis
  function loadVoices() {
    if ("speechSynthesis" in window) {
      availableVoices = window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          availableVoices = window.speechSynthesis.getVoices();
        };
      }
    }
  }
  loadVoices();

  // -------------------------------------------------------------------------
  // 1. Language Initialization
  // -------------------------------------------------------------------------
  function populateLanguages() {
    if (typeof SUPPORTED_LANGUAGES === "undefined") {
      console.error("Language dataset not found!");
      return;
    }

    // Populate Source (first option is Auto Detect)
    SUPPORTED_LANGUAGES.forEach(lang => {
      const optSource = document.createElement("option");
      optSource.value = lang.code;
      optSource.textContent = `${lang.flag} ${lang.name} (${lang.native})`;
      if (lang.code === "en") optSource.selected = true; // Default source: English
      sourceLangSelect.appendChild(optSource);

      const optTarget = document.createElement("option");
      optTarget.value = lang.code;
      optTarget.textContent = `${lang.flag} ${lang.name} (${lang.native})`;
      if (lang.code === "es") optTarget.selected = true; // Default target: Spanish
      targetLangSelect.appendChild(optTarget);
    });
  }

  // -------------------------------------------------------------------------
  // 2. Translation Engines with Multi-API Fallback
  // -------------------------------------------------------------------------
  
  /**
   * Primary Engine: Google GTX Single Translation API
   * Fast, reliable, supports auto-detection, multi-sentence translation.
   */
  async function translateWithGoogleGtx(text, sourceLang, targetLang) {
    const sl = sourceLang === "auto" ? "auto" : sourceLang;
    const tl = targetLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google API returned status ${response.status}`);
    const data = await response.json();
    
    if (data && data[0]) {
      const translatedText = data[0].map(item => item[0]).join("");
      const detectedLang = data[2] || (sourceLang === "auto" ? "en" : sourceLang);
      return { translatedText, detectedLang, engine: "Google Translate Engine" };
    }
    throw new Error("Invalid structure returned by Google Translate");
  }

  /**
   * Secondary Engine: MyMemory Translation API
   * Widely used open translation service.
   */
  async function translateWithMyMemory(text, sourceLang, targetLang) {
    const sl = sourceLang === "auto" ? "en" : sourceLang;
    const langpair = `${sl}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`MyMemory API returned status ${response.status}`);
    const data = await response.json();

    if (data && data.responseData && data.responseData.translatedText) {
      return { 
        translatedText: data.responseData.translatedText, 
        detectedLang: sl, 
        engine: "MyMemory API" 
      };
    }
    throw new Error(data.responseDetails || "MyMemory translation failed");
  }

  /**
   * Master Translation Controller
   */
  async function performTranslation() {
    const text = sourceText.value.trim();
    if (!text) {
      showToast("Please enter some text to translate", "info");
      sourceText.focus();
      return;
    }

    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;

    if (sourceLang !== "auto" && sourceLang === targetLang) {
      showToast("Source and target languages are identical", "info");
      targetText.value = text;
      return;
    }

    setLoadingState(true);
    setStatus("loading", "Translating...");

    try {
      let result = null;

      try {
        result = await translateWithGoogleGtx(text, sourceLang, targetLang);
      } catch (primaryErr) {
        console.warn("Primary engine failed, switching to backup:", primaryErr);
        result = await translateWithMyMemory(text, sourceLang, targetLang);
      }

      targetText.value = result.translatedText;
      detectedSourceLang = result.detectedLang;
      apiIndicator.textContent = `Translated via ${result.engine}`;
      setStatus("ready", "Done");
      showToast("Translation complete!", "success");

      // Save to Translation History
      saveToHistory({
        sourceText: text,
        translatedText: result.translatedText,
        sourceLang: sourceLang === "auto" && result.detectedLang ? `${result.detectedLang} (auto)` : sourceLang,
        targetLang: targetLang,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error("Translation Error:", err);
      setStatus("error", "Error");
      showToast("Failed to translate. Please check your internet connection.", "error");
      targetText.value = "Translation error occurred. Please try again.";
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(isLoading) {
    isTranslating = isLoading;
    translateBtn.disabled = isLoading;
    loadingOverlay.style.display = isLoading ? "flex" : "none";
    
    if (isLoading) {
      translateBtn.classList.add("loading");
      translateBtn.querySelector(".btn-text").textContent = "Translating...";
    } else {
      translateBtn.classList.remove("loading");
      translateBtn.querySelector(".btn-text").textContent = "Translate Now";
    }
  }

  function setStatus(type, label) {
    statusBadge.className = `status-badge ${type}`;
    let iconClass = "ri-check-line";
    if (type === "loading") iconClass = "ri-loader-4-line ri-spin";
    if (type === "error") iconClass = "ri-error-warning-line";
    statusBadge.innerHTML = `<i class="${iconClass}"></i> ${label}`;
  }

  // -------------------------------------------------------------------------
  // 3. Swap Languages
  // -------------------------------------------------------------------------
  function swapLanguages() {
    const currentSource = sourceLangSelect.value;
    const currentTarget = targetLangSelect.value;

    if (currentSource === "auto") {
      showToast("Select a specific source language before swapping", "info");
      return;
    }

    // Swap select values
    sourceLangSelect.value = currentTarget;
    targetLangSelect.value = currentSource;

    // Swap text values if target has text
    const currentSourceText = sourceText.value;
    const currentTargetText = targetText.value;

    if (currentTargetText.trim() !== "") {
      sourceText.value = currentTargetText;
      targetText.value = currentSourceText;
      updateCharCount();
    }

    swapLanguagesBtn.style.transform = "rotate(180deg)";
    setTimeout(() => {
      swapLanguagesBtn.style.transform = "";
    }, 250);

    showToast("Languages swapped", "info");
  }

  // -------------------------------------------------------------------------
  // 4. Robust Text-To-Speech (TTS) with Automatic Audio Fallback
  // -------------------------------------------------------------------------

  function stopAllSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    speakSourceBtn.classList.remove("speaking");
    speakTargetBtn.classList.remove("speaking");
  }

  /**
   * Cloud Audio Fallback using Google TTS Endpoint
   * Plays native pronunciation even if Windows has no local voice packs installed!
   */
  function speakViaAudioFallback(cleanText, langCode, buttonElement) {
    // Truncate to first 200 chars for instant audio stream
    const shortText = cleanText.length > 200 ? cleanText.substring(0, 200) : cleanText;
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(shortText)}`;
    
    const audio = new Audio(ttsUrl);
    currentAudio = audio;
    buttonElement.classList.add("speaking");

    audio.onended = () => {
      buttonElement.classList.remove("speaking");
      currentAudio = null;
    };

    audio.onerror = (e) => {
      console.warn("Audio fallback error:", e);
      buttonElement.classList.remove("speaking");
      currentAudio = null;
      showToast("Unable to play audio pronunciation.", "error");
    };

    audio.play().catch(playErr => {
      console.warn("Audio play prevented:", playErr);
      buttonElement.classList.remove("speaking");
      currentAudio = null;
      showToast("Click the page once to allow audio playback", "info");
    });
  }

  /**
   * Master Speak Controller
   * 1. Checks if already speaking -> stops it (toggle behavior).
   * 2. Tries Web Speech API (speechSynthesis) with exact voice matching.
   * 3. If no matching voice exists or error occurs -> falls back to Cloud Audio TTS.
   */
  function speakText(text, langCode, buttonElement) {
    const cleanText = text ? text.trim() : "";
    if (!cleanText) {
      showToast("No text to speak", "info");
      return;
    }

    // Toggle: If this button is already speaking, stop and return
    if (buttonElement.classList.contains("speaking")) {
      stopAllSpeech();
      return;
    }

    // Stop any active speech before starting new one
    stopAllSpeech();

    // Resolve Language Code
    let effectiveLang = langCode;
    if (effectiveLang === "auto") {
      effectiveLang = detectedSourceLang || "en";
    }

    const bcpTag = BCP47_MAP[effectiveLang] || effectiveLang;

    // Try Web Speech API first
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();

      // Look for a voice matching this language
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase() === bcpTag.toLowerCase() || 
        v.lang.toLowerCase().startsWith(effectiveLang.toLowerCase())
      );

      if (matchedVoice) {
        try {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
          utterance.rate = 0.95;
          utterance.pitch = 1.0;

          buttonElement.classList.add("speaking");

          utterance.onend = () => {
            buttonElement.classList.remove("speaking");
          };

          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis error, switching to Audio fallback:", e);
            buttonElement.classList.remove("speaking");
            // Fallback immediately
            speakViaAudioFallback(cleanText, effectiveLang, buttonElement);
          };

          window.speechSynthesis.speak(utterance);
          return;
        } catch (synthErr) {
          console.warn("SpeechSynthesis exception:", synthErr);
        }
      }
    }

    // Fallback: Cloud Audio Stream (works for all 50+ languages without OS voice packs)
    speakViaAudioFallback(cleanText, effectiveLang, buttonElement);
  }

  // -------------------------------------------------------------------------
  // 5. Speech Recognition (Speech to Text)
  // -------------------------------------------------------------------------
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      micBtn.title = "Speech recognition works best in Google Chrome or Microsoft Edge";
      micBtn.addEventListener("click", () => {
        showToast("Speech Recognition is supported in Chrome or Edge.", "info");
      });
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add("active");
      showToast("Listening... Speak now into your microphone", "info");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sourceText.value = sourceText.value ? `${sourceText.value} ${transcript}` : transcript;
      updateCharCount();
      showToast("Speech captured!", "success");
    };

    recognition.onerror = (event) => {
      console.warn("Speech Recognition Error:", event.error);
      isListening = false;
      micBtn.classList.remove("active");

      if (event.error === "not-allowed") {
        if (window.location.protocol === "file:") {
          showToast("Mic requires HTTP/HTTPS (deploy on GitHub Pages or use Live Server) due to browser security.", "error");
        } else {
          showToast("Microphone access was blocked. Please allow permissions in browser.", "error");
        }
      } else if (event.error === "no-speech") {
        showToast("No speech detected. Please try speaking again.", "info");
      } else {
        showToast(`Voice input: ${event.error}`, "error");
      }
    };

    recognition.onend = () => {
      isListening = false;
      micBtn.classList.remove("active");
    };

    micBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
      } else {
        let lang = sourceLangSelect.value;
        if (lang === "auto") lang = "en";
        recognition.lang = BCP47_MAP[lang] || lang;
        try {
          recognition.start();
        } catch (err) {
          console.warn("Recognition start failed:", err);
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. Copy to Clipboard
  // -------------------------------------------------------------------------
  async function copyToClipboard(text, label = "Text") {
    if (!text || text.trim() === "") {
      showToast(`No ${label.toLowerCase()} to copy`, "info");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = text;
        tempTextarea.style.position = "fixed";
        tempTextarea.style.left = "-9999px";
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextarea);
      }
      showToast(`${label} copied to clipboard!`, "success");
    } catch (err) {
      console.error("Clipboard Error:", err);
      showToast("Failed to copy to clipboard", "error");
    }
  }

  // -------------------------------------------------------------------------
  // 7. Character Counter & Clear Functions
  // -------------------------------------------------------------------------
  function updateCharCount() {
    const len = sourceText.value.length;
    charCount.textContent = len.toLocaleString();
    charCount.style.color = len >= 4900 ? "var(--danger)" : "";
  }

  function clearAll() {
    stopAllSpeech();
    sourceText.value = "";
    targetText.value = "";
    detectedSourceLang = null;
    updateCharCount();
    setStatus("ready", "Ready");
    showToast("Cleared all text", "info");
  }

  // -------------------------------------------------------------------------
  // 8. Translation History (localStorage)
  // -------------------------------------------------------------------------
  function loadHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      translationHistory = stored ? JSON.parse(stored) : [];
      updateHistoryBadge();
    } catch (e) {
      console.warn("Could not load history:", e);
      translationHistory = [];
    }
  }

  function saveToHistory(item) {
    if (translationHistory.length > 0 && 
        translationHistory[0].sourceText === item.sourceText && 
        translationHistory[0].targetLang === item.targetLang) {
      return;
    }

    translationHistory.unshift(item);
    if (translationHistory.length > 50) {
      translationHistory.pop();
    }

    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(translationHistory));
      updateHistoryBadge();
    } catch (e) {
      console.warn("Could not save to history:", e);
    }
  }

  function updateHistoryBadge() {
    const count = translationHistory.length;
    if (count > 0) {
      historyCountBadge.textContent = count > 99 ? "99+" : count;
      historyCountBadge.style.display = "inline-flex";
    } else {
      historyCountBadge.style.display = "none";
    }
  }

  function renderHistory() {
    historyList.innerHTML = "";
    if (translationHistory.length === 0) {
      emptyHistoryState.style.display = "block";
      clearHistoryBtn.style.display = "none";
      return;
    }

    emptyHistoryState.style.display = "none";
    clearHistoryBtn.style.display = "inline-flex";

    translationHistory.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "history-item";

      const timeAgo = formatTimestamp(item.timestamp);

      card.innerHTML = `
        <div class="history-meta">
          <span class="history-lang-badge">${getLangName(item.sourceLang)} → ${getLangName(item.targetLang)}</span>
          <span class="history-time">${timeAgo}</span>
        </div>
        <div class="history-text">${escapeHtml(item.sourceText)}</div>
        <div class="history-translation">${escapeHtml(item.translatedText)}</div>
        <div class="history-actions">
          <button class="history-action-btn load-btn" data-index="${index}">
            <i class="ri-arrow-up-line"></i> Load
          </button>
          <button class="history-action-btn copy-btn" data-index="${index}">
            <i class="ri-file-copy-line"></i> Copy
          </button>
          <button class="history-action-btn delete-btn" data-index="${index}">
            <i class="ri-delete-bin-line"></i> Delete
          </button>
        </div>
      `;

      card.querySelector(".load-btn").addEventListener("click", () => {
        sourceText.value = item.sourceText;
        targetText.value = item.translatedText;
        sourceLangSelect.value = item.sourceLang.replace(" (auto)", "");
        targetLangSelect.value = item.targetLang;
        updateCharCount();
        closeModal();
        showToast("Loaded translation into workspace", "info");
      });

      card.querySelector(".copy-btn").addEventListener("click", () => {
        copyToClipboard(item.translatedText, "Translation");
      });

      card.querySelector(".delete-btn").addEventListener("click", () => {
        translationHistory.splice(index, 1);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(translationHistory));
        updateHistoryBadge();
        renderHistory();
        showToast("Item deleted", "info");
      });

      historyList.appendChild(card);
    });
  }

  function getLangName(code) {
    if (!code) return "Unknown";
    if (code.includes("auto")) return "Auto";
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? found.name : code.toUpperCase();
  }

  function formatTimestamp(isoStr) {
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return "Recently";
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function openModal() {
    renderHistory();
    historyModal.classList.add("open");
    historyModal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    historyModal.classList.remove("open");
    historyModal.setAttribute("aria-hidden", "true");
  }

  // -------------------------------------------------------------------------
  // 9. Toast Notification System
  // -------------------------------------------------------------------------
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "ri-information-line";
    if (type === "success") icon = "ri-checkbox-circle-line";
    if (type === "error") icon = "ri-error-warning-line";

    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px) scale(0.96)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // -------------------------------------------------------------------------
  // 10. Theme Toggle (Light / Dark)
  // -------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === "dark") {
      themeIcon.className = "ri-sun-line";
      themeToggleBtn.title = "Switch to Light Mode";
    } else {
      themeIcon.className = "ri-moon-line";
      themeToggleBtn.title = "Switch to Dark Mode";
    }
  }

  // -------------------------------------------------------------------------
  // 11. Event Listeners Setup
  // -------------------------------------------------------------------------
  populateLanguages();
  initTheme();
  loadHistory();
  setupSpeechRecognition();

  sourceText.addEventListener("input", updateCharCount);
  translateBtn.addEventListener("click", performTranslation);

  // Keyboard Shortcuts: Ctrl+Enter or Cmd+Enter to translate
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      performTranslation();
    }
    if (e.key === "Escape") {
      closeModal();
    }
  });

  swapLanguagesBtn.addEventListener("click", swapLanguages);
  
  clearInputBtn.addEventListener("click", () => {
    sourceText.value = "";
    updateCharCount();
    sourceText.focus();
  });

  clearAllBtn.addEventListener("click", clearAll);

  copySourceBtn.addEventListener("click", () => {
    copyToClipboard(sourceText.value, "Source text");
  });

  copyTargetBtn.addEventListener("click", () => {
    copyToClipboard(targetText.value, "Translated text");
  });

  speakSourceBtn.addEventListener("click", () => {
    speakText(sourceText.value, sourceLangSelect.value, speakSourceBtn);
  });

  speakTargetBtn.addEventListener("click", () => {
    speakText(targetText.value, targetLangSelect.value, speakTargetBtn);
  });

  saveFavoriteBtn.addEventListener("click", () => {
    const s = sourceText.value.trim();
    const t = targetText.value.trim();
    if (!s || !t) {
      showToast("Translate text first before saving", "info");
      return;
    }
    saveToHistory({
      sourceText: s,
      translatedText: t,
      sourceLang: sourceLangSelect.value,
      targetLang: targetLangSelect.value,
      timestamp: new Date().toISOString()
    });
    showToast("Translation saved to history!", "success");
  });

  themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  historyBtn.addEventListener("click", openModal);
  closeHistoryBtn.addEventListener("click", closeModal);
  historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) closeModal();
  });

  clearHistoryBtn.addEventListener("click", () => {
    translationHistory = [];
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    updateHistoryBadge();
    renderHistory();
    showToast("History cleared", "info");
  });
});
