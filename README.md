# VIGIL
### Verify Impairment. Guard Innocent Lives.

> A pre-drive wellness intelligence system targeting **UN SDG 3.6** — halving global road traffic deaths by 2030.

---

## The Problem

**1.35 million people die in road crashes every year.** A massive contributing factor is *subjective impairment* — drivers self-assessing that they are "fine to drive" when suffering from severe sleep deficits, acute stress, compounding emotional states, or residual chemical influences. 

Humans are notoriously bad at judging their own cognitive readiness. VIGIL exists to make that judgment objective and non-negotiable.

---

## The Solution

VIGIL is a compound biometric risk engine wrapped in a premium, defense-grade Human-Machine Interface. By assessing sleep, stress, emotions, and chemical influences, it computes a definitive **Readiness Score (0–100)**. 

To elevate the experience, VIGIL integrates cutting-edge AI and native web APIs to create an immersive, cinematic "Impossible UI".

---

## Key Features & The "Impossible UI"

| Feature | Description |
|---|---|
| **Gemini 2.5 Flash Integration** | A secure Node.js backend streams risk data to Google's Gemini 2.5 Flash API to generate hyper-personalized, clinical safety briefings in real-time. |
| **OPTIC.LINK (Retinal Scan HUD)** | An optional WebRTC-powered live camera feed that applies high-contrast cyan filters, scanlines, and rotating crosshairs to simulate a biometric retinal scan. |
| **Audible AI Briefings** | Utilizes the native Web Speech API to read the Gemini safety assessment out loud, complete with a reactive UI waveform. |
| **Tactile Audio Engine** | A custom Web Audio API synthesizer generates futuristic UI clicks, boot-up frequencies, and high-tech telemetry sounds. |
| **Cinematic Boot Sequence** | A terminal-style initialization overlay greets the user, simulating a secure neural link boot-up. |
| **Compound Risk Engine** | Algorithmically calculates impairment by understanding how sleep deficits multiply the risks of stress and chemical factors. |

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS, HTML5, CSS3 (Glassmorphism, CSS Glitch FX, Parallax) |
| Backend | Node.js, Express.js |
| AI / LLM | Google Gemini 2.5 Flash API |
| Native Web APIs | WebRTC (Camera), Web Audio API (Synth), Web Speech API (Voice) |
| Security | `dotenv` for server-side API key management |

---

## Screenshots

*Note: Add updated screenshots of the Boot Sequence, the Optic Link HUD, and the AI Safety Briefing here.*

![Dashboard Example](assets/screenshot-dashboard.png)

---

## How to Run Locally

VIGIL now uses a secure backend to ensure your API keys are never exposed to the frontend.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vigil.git
   cd vigil
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Environment:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Engine:**
   ```bash
   npm start
   ```
   *The server will start on `http://localhost:8080`.*

---

## UN SDG Alignment

### SDG 3 — Good Health & Well-Being
**Target 3.6:** *By 2030, halve the number of global deaths and injuries from road traffic accidents.*

VIGIL directly targets the **human-error component** of road accidents by providing an objective, undeniable assessment of driver readiness — empowering operators to make safer decisions *before* the vehicle is in motion.

---

<sub>⚠ VIGIL is a supplementary wellness indicator, not a medical or legal clearance device. The ultimate responsibility for safe vehicle operation rests solely with the operator.</sub>
