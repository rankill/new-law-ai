# Voice Notes AI

A simple, open-source voice notes app. Record meetings, get automatic transcriptions, and chat with AI about your notes.

Built with React Native (Expo), Firebase, and Material Design 3.

## Features

- **Record** meetings and voice notes with one tap
- **Transcribe** recordings automatically using Deepgram
- **Chat with AI** about your transcripts — ask for summaries, action items, key points
- **Material Design 3** clean UI with dark mode support
- **Cloud storage** via Firebase (audio files + transcripts)

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
   - Enable **Firestore Database** (start in test mode)
   - Enable **Storage** (start in test mode)
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

## Project Structure

```
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx         # Root layout with Material theme
│   ├── index.tsx           # Home — list of voice notes
│   ├── record.tsx          # Recording screen
│   └── chat/[id].tsx       # AI chat screen
├── src/
│   ├── components/         # UI components
│   │   ├── NoteCard.tsx    # Voice note list card
│   │   └── ChatBubble.tsx  # Chat message bubble
│   ├── config/
│   │   └── firebase.ts     # Firebase initialization
│   ├── services/
│   │   ├── audio.ts        # Recording (expo-av)
│   │   ├── storage.ts      # Firebase Storage + Firestore
│   │   ├── transcription.ts # Deepgram API
│   │   └── ai.ts           # AI chat (Groq/OpenAI-compatible)
│   └── theme.ts            # Material Design 3 theme
├── app.json                # Expo config
└── package.json
```

## License

MIT — see [LICENSE](LICENSE).
