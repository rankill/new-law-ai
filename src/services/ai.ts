/**
 * AI Chat service using Groq API (free tier with Llama models)
 *
 * Sign up at https://console.groq.com and get a free API key.
 * Set EXPO_PUBLIC_AI_API_KEY in your .env file.
 *
 * You can swap this to any OpenAI-compatible API by changing the base URL:
 *   - Groq: https://api.groq.com/openai/v1 (default, free)
 *   - MiniMax: https://api.minimax.chat/v1
 *   - OpenAI: https://api.openai.com/v1
 *   - Ollama (local): http://localhost:11434/v1
 */

import { Language } from "../i18n";

const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || "";
const AI_BASE_URL =
  process.env.EXPO_PUBLIC_AI_BASE_URL || "https://api.groq.com/openai/v1";
const AI_MODEL =
  process.env.EXPO_PUBLIC_AI_MODEL || "llama-3.3-70b-versatile";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPTS: Record<Language, string> = {
  es: `Eres un asistente útil que analiza transcripciones de reuniones y notas de voz.
Respondes preguntas sobre el contenido, resumes puntos clave, extraes tareas pendientes,
y ayudas al usuario a entender sus notas. Sé conciso y útil. SIEMPRE responde en español.`,
  en: `You are a helpful assistant that analyzes meeting transcripts and voice notes.
You answer questions about the content, summarize key points, extract action items,
and help the user understand their notes. Be concise and helpful. ALWAYS respond in English.`,
};

const TRANSCRIPT_INTROS: Record<Language, string> = {
  es: "Aquí está la transcripción de la nota de voz/reunión:",
  en: "Here is the transcript of the voice note/meeting:",
};

export async function chat(
  transcript: string,
  messages: ChatMessage[],
  language: Language = "es"
): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error(
      "AI API key not set. Add EXPO_PUBLIC_AI_API_KEY to your .env file."
    );
  }

  const fullMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPTS[language] },
    {
      role: "system",
      content: `${TRANSCRIPT_INTROS[language]}\n\n${transcript}`,
    },
    ...messages,
  ];

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI chat failed: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response from AI.";
}
