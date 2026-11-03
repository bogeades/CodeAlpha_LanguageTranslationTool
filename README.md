# CodeAlpha_LanguageTranslationTool

<p align="center">
  <img src="https://img.shields.io/badge/CodeAlpha-AI_Internship-4f46e5?style=for-the-badge&logo=codeforces" alt="CodeAlpha Internship">
  <img src="https://img.shields.io/badge/Task-Task_1:_Language_Translation_Tool-06b6d4?style=for-the-badge" alt="Task 1">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License MIT">
</p>

An intelligent, responsive, web-based **Language Translation Tool** developed as part of the **CodeAlpha Artificial Intelligence Internship (Task 1)**.

---

## 📌 Project Overview

The **Language Translation Tool** is designed to eliminate communication barriers by offering fast, accurate, and multi-modal text translation across **50+ languages**. Powered by translation API engines and the browser's native **Web Speech APIs**, it supports voice dictation (speech-to-text), audio pronunciation (text-to-speech), real-time language swapping, and local translation history tracking.

---

## 🎯 Task Objectives (CodeAlpha AI Task 1)

- [x] Create a user interface where users can enter text and select source & target languages.
- [x] Multi-language support: 50+ languages including Ethiopian languages (**Amharic / አማርኛ**, **Oromo / Afaan Oromoo**, **Tigrinya / ትግርኛ**).
- [x] Integrate translation APIs (Google Translate client engine & MyMemory API fallback).
- [x] Send user text to the API and receive translated responses asynchronously.
- [x] Display translated text clearly with real-time status feedback.
- [x] **Bonus / Optional Features:**
  - [x] 1-Click Copy button for both input and translated text.
  - [x] Text-to-Speech (TTS) feature with native pronunciation accents.
  - [x] Speech Recognition (Voice Input / Mic) for dictation.
  - [x] Dark / Light mode toggle.
  - [x] Translation History storage (powered by `localStorage`).
  - [x] Bidirectional language swap button.
  - [x] Keyboard shortcuts (`Ctrl + Enter` to translate, `Escape` to close modal).

---

## 🛠️ Technologies Used

- **HTML5:** Semantic architecture, accessible controls, and responsive containers.
- **CSS3:** Custom properties for theming, modern glassmorphism UI, CSS Grid & Flexbox, smooth transitions and animations.
- **JavaScript (Vanilla ES6+):** Asynchronous API management with `async/await`, DOM updates, and event handling.
- **Translation APIs:**
  - **Primary:** Google Translate GTX client endpoint (fast, accurate, multi-sentence support, auto-detection).
  - **Fallback:** MyMemory Machine Translation API (ensures high availability).
- **Web Speech API:**
  - `SpeechRecognition`: Converts user voice speech into written input.
  - `SpeechSynthesis`: Speaks translated text aloud in native target accents.
- **Web Storage API (`localStorage`):** Stores user history and theme preferences across sessions.

---

## 🚀 Getting Started

No installations, build steps, or API keys are required! The application runs completely in any modern web browser.

### Option 1: Direct File Launch
1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/CodeAlpha_LanguageTranslationTool.git
   cd CodeAlpha_LanguageTranslationTool
   ```
2. Open `index.html` directly in your favorite browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Run with VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Right-click on `index.html` and select **"Open with Live Server"**.
3. The app will launch at `http://127.0.0.1:5500`.

### Option 3: Deploy to GitHub Pages
1. Push this repository to your GitHub account under the name `CodeAlpha_LanguageTranslationTool`.
2. Go to **Settings** > **Pages**.
3. Under **Branch**, select `main` and root `/` folder, then click **Save**.
4. Your translation tool will be live at `https://your-username.github.io/CodeAlpha_LanguageTranslationTool/`.

---

## 💡 How to Use

1. **Enter Text:** Type your text into the left input box, or click the **Microphone** icon to dictate using your voice.
2. **Choose Languages:** Select the source language (or choose **🌐 Auto Detect**) and target language.
3. **Translate:** Click **Translate Now** or press `Ctrl + Enter`.
4. **Listen (TTS):** Click the **Speaker** icon on either box to hear the audio pronunciation.
5. **Copy:** Click the **Copy** icon to copy translated text to your clipboard.
6. **Swap:** Click the **⇄** swap button to quickly invert source and target languages.
7. **History:** Click the **History** button in the navigation bar to view, reload, or delete your past translation sessions.

---

## 📁 Project Structure

```
CodeAlpha_LanguageTranslationTool/
│
├── index.html           # Main semantic HTML structure & layout
├── style.css            # Stylesheet with light/dark theme & responsive grid
├── script.js            # Translation engine, speech APIs, history & DOM logic
├── languages.js         # Dataset of 50+ supported languages with flags & codes
├── DOCUMENTATION.md     # Detailed formal project documentation
└── README.md            # GitHub portfolio & submission overview
```

---

## 📢 LinkedIn Video & Submission Guide

According to the CodeAlpha internship instructions:
1. **GitHub Repository:** Push your code to a repository named `CodeAlpha_LanguageTranslationTool`.
2. **Video Demonstration:** Record a 1-2 minute video screen capture demonstrating:
   - Selecting languages and translating text.
   - Using the **Text-to-Speech** (Listen) feature.
   - Using the **Voice Input** (Microphone) feature.
   - Swapping languages and toggling between **Dark / Light mode**.
   - Opening the **Translation History** drawer.
3. **Post on LinkedIn:** Post your video tagging `@CodeAlpha` with your GitHub repository link.

### Sample LinkedIn Post Template:
```text
🚀 Excited to share my Task 1 project for the Artificial Intelligence Internship at @CodeAlpha!

I have built an AI-Powered Language Translation Tool using HTML5, CSS3, and JavaScript.

✨ Key Features:
- Real-time text translation across 50+ languages
- High availability with automated fallback translation APIs
- Speech-to-Text (Voice Input) & Text-to-Speech (Audio Pronunciation)
- Automatic language detection & bidirectional language swapping
- Persistent translation history & responsive Light/Dark mode

🔗 GitHub Repository: [Your Repo Link Here]
🌐 Live Demo: [Your GitHub Pages Link Here]

Thank you @CodeAlpha for this wonderful learning opportunity!

#CodeAlpha #ArtificialIntelligence #MachineLearning #WebDevelopment #JavaScript #AIInternship #Portfolio
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
