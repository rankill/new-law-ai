import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  IconButton,
  TextInput,
  Button,
  useTheme,
  Snackbar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { startRecording, stopRecording } from "../src/services/audio";
import { saveVoiceNote, updateTranscript, updateNoteStatus } from "../src/services/storage";
import { transcribeAudio } from "../src/services/transcription";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = async () => {
    try {
      await startRecording();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (e: any) {
      setError(e.message || "Failed to start recording");
    }
  };

  const handleStop = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setSaving(true);

      const { uri, duration } = await stopRecording();
      setIsRecording(false);

      const noteTitle = title.trim() || `Note ${new Date().toLocaleDateString()}`;

      // Save to Firebase
      const noteId = await saveVoiceNote(uri, noteTitle, duration);

      // Transcribe in background
      try {
        const audioUrl = uri; // Will use the Firebase URL from storage
        const transcript = await transcribeAudio(audioUrl);
        await updateTranscript(noteId, transcript);
      } catch (e: any) {
        console.warn("Transcription failed:", e.message);
        await updateNoteStatus(noteId, "error");
      }

      router.back();
    } catch (e: any) {
      setError(e.message || "Failed to save recording");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <TextInput
          label="Note title (optional)"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          disabled={isRecording || saving}
        />

        <View style={styles.timerContainer}>
          <Text
            variant="displayLarge"
            style={[styles.timer, { color: theme.colors.onSurface }]}
          >
            {formatTime(elapsed)}
          </Text>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View
                style={[
                  styles.recordingDot,
                  { backgroundColor: theme.colors.error },
                ]}
              />
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.error }}
              >
                Recording
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          {!isRecording ? (
            <IconButton
              icon="microphone"
              mode="contained"
              size={48}
              containerColor={theme.colors.primary}
              iconColor={theme.colors.onPrimary}
              onPress={handleStart}
              disabled={saving}
            />
          ) : (
            <IconButton
              icon="stop"
              mode="contained"
              size={48}
              containerColor={theme.colors.error}
              iconColor={theme.colors.onPrimary}
              onPress={handleStop}
              disabled={saving}
            />
          )}
        </View>

        {saving && (
          <Text
            variant="bodyMedium"
            style={[styles.savingText, { color: theme.colors.onSurfaceVariant }]}
          >
            Saving and transcribing...
          </Text>
        )}
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{ label: "OK", onPress: () => setError("") }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  input: {
    width: "100%",
    marginBottom: 48,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  timer: {
    fontVariant: ["tabular-nums"],
    letterSpacing: 4,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  savingText: {
    marginTop: 24,
  },
});
