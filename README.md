# Voice Notes AI

A simple, open-source voice notes app. Record meetings, get automatic transcriptions, and chat with AI about your notes.

Built with React Native (Expo), Firebase, and Material Design 3.

## Features

- **Record** meetings and voice notes with one tap
- **Transcribe** recordings automatically using Deepgram
- **Chat with AI** about your transcripts — ask for summaries, action items, key points
- **Bilingual** — full Spanish/English support (UI, transcription, AI chat). Spanish by default
- **Firebase Auth** — email sign-in with per-user data isolation
- **Material Design 3** clean UI with dark mode support
- **Cloud storage** via Firebase (audio files + transcripts, scoped per user)

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- A [Firebase](https://console.firebase.google.com/) project
- A [Deepgram](https://deepgram.com/) API key (free tier: 12,000 min/month)
- A [Groq](https://console.groq.com/) API key (free tier) — or any OpenAI-compatible API

### Setup

1. **Clone the repo**

```bash
git clone https://github.com/your-username/voice-notes-ai.git
cd voice-notes-ai
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Firebase**

   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Authentication** → Sign-in method → **Email/Password**
   - Enable **Firestore Database** (start in test mode, then deploy `firestore.rules`)
   - Enable **Storage** (start in test mode, then deploy `storage.rules`)
   - Copy your web app config

4. **Configure environment variables**

```bash
cp .env.example .env
```

Fill in your API keys in `.env`:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_DEEPGRAM_API_KEY=your-deepgram-key
EXPO_PUBLIC_AI_API_KEY=your-groq-key
```

5. **Run the app**

```bash
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## AI Provider

The app defaults to **Groq** (free, fast Llama models) but works with any OpenAI-compatible API. To switch providers, set these env vars:

| Provider | `EXPO_PUBLIC_AI_BASE_URL` | `EXPO_PUBLIC_AI_MODEL` |
|----------|--------------------------|------------------------|
| Groq (default) | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| MiniMax | `https://api.minimax.chat/v1` | `MiniMax-Text-01` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| Ollama (local) | `http://localhost:11434/v1` | `llama3` |

## Security Rules

The repo includes ready-to-deploy Firestore and Storage security rules that enforce per-user data isolation:

```bash
# Deploy with Firebase CLI
firebase deploy --only firestore:rules,storage
```

See `firestore.rules` and `storage.rules` for details.

## Project Structure

```
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx         # Root layout + auth gate
│   ├── sign-in.tsx         # Sign-in / create account
│   ├── index.tsx           # Home — list of voice notes
│   ├── record.tsx          # Recording screen
│   └── chat/[id].tsx       # AI chat screen
├── src/
│   ├── components/         # UI components
│   │   ├── NoteCard.tsx    # Voice note list card
│   │   ├── ChatBubble.tsx  # Chat message bubble
│   │   └── LanguageToggle.tsx # ES/EN language switcher
│   ├── config/
│   │   └── firebase.ts     # Firebase init (Auth + Firestore + Storage)
│   ├── context/
│   │   ├── AuthContext.tsx  # Firebase Auth state
│   │   └── LanguageContext.tsx # App language preference
│   ├── services/
│   │   ├── audio.ts        # Recording (expo-av)
│   │   ├── storage.ts      # Firebase Storage + Firestore (user-scoped)
│   │   ├── transcription.ts # Deepgram API (ES/EN)
│   │   └── ai.ts           # AI chat (Groq/OpenAI-compatible, ES/EN)
│   ├── i18n.ts             # UI strings (Spanish + English)
│   └── theme.ts            # Material Design 3 theme
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
├── app.json                # Expo config
└── package.json
```

## License

MIT — see [LICENSE](LICENSE).
