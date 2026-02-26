export type Language = "es" | "en";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

// Deepgram language codes
export const DEEPGRAM_LANG: Record<Language, string> = {
  es: "es",
  en: "en-US",
};

const strings = {
  // Home screen
  voiceNotes: { es: "Mis Notas", en: "My Notes" },
  record: { es: "Grabar", en: "Record" },
  noNotesYet: { es: "Aún no hay notas de voz", en: "No voice notes yet" },
  tapMicToRecord: {
    es: "Toca el micrófono para grabar tu primera nota",
    en: "Tap the mic button to record your first note",
  },

  // Record screen
  recordTitle: { es: "Grabar", en: "Record" },
  noteTitleLabel: {
    es: "Título de la nota (opcional)",
    en: "Note title (optional)",
  },
  recording: { es: "Grabando", en: "Recording" },
  savingAndTranscribing: {
    es: "Guardando y transcribiendo...",
    en: "Saving and transcribing...",
  },
  meetingLanguage: { es: "Idioma de la reunión", en: "Meeting language" },

  // Chat screen
  chat: { es: "Chat", en: "Chat" },
  showTranscript: {
    es: "Mostrar transcripción",
    en: "Show transcript",
  },
  hideTranscript: {
    es: "Ocultar transcripción",
    en: "Hide transcript",
  },
  transcript: { es: "Transcripción", en: "Transcript" },
  noTranscript: {
    es: "Transcripción no disponible.",
    en: "No transcript available.",
  },
  askAnything: {
    es: 'Pregunta lo que quieras sobre tu nota "{title}"',
    en: 'Ask anything about your note "{title}"',
  },
  askPlaceholder: {
    es: "Pregunta sobre tu nota...",
    en: "Ask about your note...",
  },
  aiThinking: { es: "La IA está pensando...", en: "AI is thinking..." },

  // Suggestions
  summarize: { es: "Resume esta nota", en: "Summarize this note" },
  keyPoints: {
    es: "¿Cuáles son los puntos clave?",
    en: "What are the key points?",
  },
  actionItems: {
    es: "Lista de tareas pendientes",
    en: "List action items",
  },

  // Note card
  statusRecording: { es: "Grabando...", en: "Recording..." },
  statusTranscribing: { es: "Transcribiendo...", en: "Transcribing..." },
  statusReady: { es: "Listo", en: "Ready" },
  statusError: { es: "Error", en: "Error" },

  // Auth
  appName: { es: "Voice Notes AI", en: "Voice Notes AI" },
  appTagline: {
    es: "Graba reuniones, transcribe y chatea con IA",
    en: "Record meetings, transcribe, and chat with AI",
  },
  email: { es: "Correo electrónico", en: "Email" },
  password: { es: "Contraseña", en: "Password" },
  signInOrCreate: {
    es: "Iniciar sesión / Crear cuenta",
    en: "Sign in / Create account",
  },
  signInHint: {
    es: "Si no tienes cuenta, se creará automáticamente",
    en: "If you don't have an account, one will be created automatically",
  },
  signInError: {
    es: "Error al iniciar sesión. Intenta de nuevo.",
    en: "Sign in failed. Please try again.",
  },
  signOut: { es: "Cerrar sesión", en: "Sign out" },

  // General
  ok: { es: "OK", en: "OK" },
  language: { es: "Idioma", en: "Language" },
} as const;

type StringKey = keyof typeof strings;

export function t(key: StringKey, lang: Language, vars?: Record<string, string>): string {
  let text: string = strings[key][lang];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}
