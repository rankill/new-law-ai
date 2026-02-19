/**
 * Transcription service using Deepgram API (free tier: 12,000 min/month)
 *
 * Sign up at https://deepgram.com and get a free API key.
 * Set EXPO_PUBLIC_DEEPGRAM_API_KEY in your .env file.
 */

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY || "";
const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen";

export async function transcribeAudio(audioUrl: string): Promise<string> {
  if (!DEEPGRAM_API_KEY) {
    throw new Error(
      "Deepgram API key not set. Add EXPO_PUBLIC_DEEPGRAM_API_KEY to your .env file."
    );
  }

  const response = await fetch(DEEPGRAM_URL + "?model=nova-2&smart_format=true&paragraphs=true", {
    method: "POST",
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: audioUrl }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcription failed: ${error}`);
  }

  const data = await response.json();

  // Extract transcript from Deepgram response
  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ||
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    "";

  return transcript;
}
