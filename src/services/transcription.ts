/**
 * Transcription service using Deepgram API (free tier: 12,000 min/month)
 *
 * Sign up at https://deepgram.com and get a free API key.
 * Set EXPO_PUBLIC_DEEPGRAM_API_KEY in your .env file.
 */

import { Platform } from "react-native";
import { Language, DEEPGRAM_LANG } from "../i18n";

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY || "";
const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen";

// Expo HIGH_QUALITY preset: .m4a on iOS/Android, .webm on web
const NATIVE_CONTENT_TYPE = "audio/m4a";
const WEB_CONTENT_TYPE = "audio/webm";

export async function transcribeAudio(
  audioSource: string, // HTTPS URL (preferred) or local file:// URI
  language: Language = "es"
): Promise<string> {
  if (!DEEPGRAM_API_KEY) {
    throw new Error(
      "Deepgram API key not set. Add EXPO_PUBLIC_DEEPGRAM_API_KEY to your .env file."
    );
  }

  const langCode = DEEPGRAM_LANG[language];
  const params = new URLSearchParams({
    model: "nova-2",
    language: langCode,
    smart_format: "true",
    punctuate: "true",
  });

  let requestInit: RequestInit;

  if (audioSource.startsWith("https://") || audioSource.startsWith("http://")) {
    // Preferred path: Deepgram fetches the audio directly from the URL.
    // No Content-Type guessing needed — Deepgram handles format detection.
    requestInit = {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: audioSource }),
    };
  } else {
    // Fallback: upload raw bytes from a local file:// URI
    const fileResponse = await fetch(audioSource);
    if (!fileResponse.ok) {
      throw new Error(`Failed to read audio file (${fileResponse.status})`);
    }
    const audioBlob = await fileResponse.blob();

    // Use the blob's own MIME type when available (strips codec params),
    // otherwise fall back to the platform-appropriate default.
    const blobType = audioBlob.type?.split(";")[0].trim();
    const contentType =
      blobType && blobType !== "application/octet-stream" && blobType !== ""
        ? blobType
        : Platform.OS === "web"
        ? WEB_CONTENT_TYPE
        : NATIVE_CONTENT_TYPE;

    requestInit = {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": contentType,
      },
      body: audioBlob,
    };
  }

  const response = await fetch(`${DEEPGRAM_URL}?${params}`, requestInit);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Transcription failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript?.trim() ||
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ||
    "";

  return transcript;
}
