# Luna AI 🌙

**Your Safe, Intelligent Menstrual Health Companion**

Luna AI is a comprehensive menstrual health tracking application that uses **Opik** for AI observability and safety guardrails. Unlike typical health apps, Luna ensures AI responses are safe, traceable, and never give dangerous medical advice.

![Luna AI](https://img.shields.io/badge/Luna%20AI-Menstrual%20Health-ff69b4)
![Opik Powered](https://img.shields.io/badge/Powered%20by-Opik-00d4aa)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 🎯 The Problem

Health AI is broken. Generic AI chatbots in health applications:

- ❌ **Prescribe medications** without medical licenses
- ❌ **Give dangerous advice** without accountability
- ❌ **Have no guardrails** or observability
- ❌ **Leak sensitive data** or sell it to third parties

Women deserve better than AI that could harm them.

---

## ✨ Our Solution: Opik-Powered Safety

Luna AI integrates **Opik** to ensure every AI interaction is safe and accountable:

| Feature | How Opik Helps |
|---------|----------------|
| **Tracing** | Every AI response is traced for full observability |
| **Evaluation** | Guardrails detect and block dangerous medical advice |
| **Optimization** | Continuous improvement through feedback loops |
| **Datasets** | Store patterns for model improvement |

---

## 🚀 Features

### 4 Life Modes
- 🩸 **Period Tracking** - Cycle predictions, symptom logging
- 👶 **Trying to Conceive** - Fertile window alerts, ovulation tracking
- 🤰 **Pregnancy** - Week-by-week guidance, milestone tracking
- 🌿 **Perimenopause** - Symptom management, transition support

### AI Chat with Guardrails
- Safe health companion powered by LLMs
- Opik traces every response
- Blocks medical prescriptions automatically
- Suggests consulting doctors for serious concerns

### Smart Predictions
- Learn your unique cycle patterns
- Improve accuracy over time
- Personalized insights based on your data

### Premium Experience
- Glassmorphic UI design
- Smooth animations with Framer Motion
- Responsive across all devices
- Built-in presentation mode for demos

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Framer Motion |
| **Authentication** | Clerk, Privy |
| **AI Observability** | Opik SDK |
| **Payments** | x402 Micropayments |
| **State** | React Hooks, LocalStorage |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Clone the Repository

```bash
git clone https://github.com/Luna-AI-Labs/Luna-AI.git
cd Luna-AI
```

### Install Dependencies

```bash
cd client
npm install
```

### Install Server Dependencies

```bash
cd ../server
npm install
```

### Environment Variables

Create a `.env` file in the `client` directory:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Privy Authentication
VITE_PRIVY_APP_ID=your_privy_app_id

# Opik AI Observability
VITE_OPIK_API_KEY=your_opik_api_key
VITE_OPIK_WORKSPACE=your_opik_workspace

# API Configuration (optional)
VITE_API_URL=http://localhost:3001
```

For the server, create a `.env` file in the `server` directory (see `.env.example`).
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🏗️ Project Structure

```
luna-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── pages/      # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── HealthAssistant.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   └── ...
│   │   ├── lib/            # Utilities and helpers
│   │   ├── App.tsx         # Main application
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Backend API (optional)
└── README.md
```

---

## 🔐 Opik Integration

### How We Use Opik

Luna AI leverages Opik's core features for AI safety:

#### 1. Tracing
Every AI chat response is traced through Opik, providing full visibility into:
- Input prompts
- Model responses
- Response metadata
- Latency metrics

#### 2. Evaluation
We use Opik's evaluation framework to:
- Detect medical prescription attempts
- Flag potentially dangerous advice
- Score response quality
- Track accuracy over time

#### 3. Guardrails
Our guardrails block:
- Medication prescriptions
- Dosage recommendations
- Diagnostic statements
- Dangerous health advice

#### 4. Feedback Loops
User feedback is collected and sent to Opik for:
- Model optimization
- Response improvement
- Safety refinement

### Example Implementation

```typescript
import { Opik } from 'opik';

const opik = new Opik({
  apiKey: process.env.OPIK_API_KEY,
  workspace: process.env.OPIK_WORKSPACE
});

// Trace a health assistant response
const trace = opik.trace({
  name: 'health-assistant-response',
  input: userMessage,
  metadata: { mode: currentMode }
});

// Evaluate for safety
const evaluation = await opik.evaluate({
  traceId: trace.id,
  evaluators: ['medical-safety', 'response-quality']
});

// Block if unsafe
if (!evaluation.passed) {
  return safetyFallbackResponse();
}
```

---

## 📱 Usage Guide

### 1. Onboarding
When you first open Luna, you'll go through personalized onboarding:
- Select your life mode (Period, Conceive, Pregnancy, Perimenopause)
- Enter your cycle information
- Set notification preferences
- Create an account (optional)

### 2. Dashboard
The main dashboard shows:
- Current cycle day and phase
- Predictions for next period/fertile window
- Quick actions for logging
- AI insights

### 3. Calendar
Track your history:
- View past periods and predictions
- Log period start/end dates
- See fertility windows (Conceive mode)

### 4. AI Chat
Ask Luna health questions:
- "Why do I feel tired before my period?"
- "What foods help with cramps?"
- "When is my fertile window?"

Luna provides helpful information while always suggesting you consult a doctor for medical concerns.

### 5. Symptom Logging
Track daily symptoms:
- Mood and energy levels
- Physical symptoms
- Sleep quality
- Flow intensity

---

## 💰 Business Model

Luna uses a freemium model with x402 micropayments:

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic tracking, calendar, logging |
| **Premium** | Pay-per-chat | Advanced AI model, unlimited insights |

---

## 👥 Team

| Name | Role | Contribution |
|------|------|--------------|
| **Antony** | Software Engineer | Frontend, Architecture, Opik Integration |
| **Ruth** | Data Science | Prediction Models, AI Training |
| **Noreen** | Medical Doctor | Clinical Guidance, Safety Review |

---

## 🏆 Hackathon

Built for **Commit To Change: An AI Agents Hackathon** by Encode Club.

**Tracks:**
- 🏥 Health - Building healthier habits
- ⭐ Best Use of Opik - AI Observability & Safety

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **Demo**: [Live Demo URL]
- **Presentation**: Navigate to `/presentation` in the app
- **GitHub**: https://github.com/Luna-AI-Labs/Luna-AI

---

<p align="center">
  Made with 💜 by Team Luna
</p>
