import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from "react-native";
import {
  TextInput,
  useTheme,
  Snackbar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { startRecording, stopRecording } from "../src/services/audio";
import { saveVoiceNote, updateTranscript, updateNoteStatus } from "../src/services/storage";
import { transcribeAudio } from "../src/services/transcription";
import { useLanguage } from "../src/context/LanguageContext";
import { useAuth } from "../src/context/AuthContext";
import { t, Language } from "../src/i18n";
import LanguageSelector from "../src/components/LanguageSelector";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function RecordScreen() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [meetingLang, setMeetingLang] = useState<Language>(language);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (saving) {
      // Pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [saving]);

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
      const { noteId, audioUrl } = await saveVoiceNote(uri, noteTitle, duration, meetingLang, user!.uid);

      try {
        // Use the Firebase Storage URL so Deepgram fetches directly — avoids
        // local file read issues and Content-Type guessing.
        const result = await transcribeAudio(audioUrl, meetingLang);
        await updateTranscript(noteId, result.fullTranscript, result.segments);
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
        {/* Card container */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <TextInput
            label={t("noteTitleLabel", language)}
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            disabled={isRecording || saving}
          />

          {/* Meeting language row */}
          <View style={styles.langRow}>
            <Text style={[styles.langLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t("meetingLanguage", language)}
            </Text>
            <LanguageSelector
              value={meetingLang}
              onChange={(lang) => !isRecording && !saving && setMeetingLang(lang)}
            />
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, { color: theme.colors.onSurface }]}>
            {formatTime(elapsed)}
          </Text>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={[styles.recordingDot, { backgroundColor: "#ef4444" }]} />
              <Text style={[styles.recordingText, { color: "#ef4444" }]}>
                {t("recording", language)}
              </Text>
            </View>
          )}
        </View>

        {/* Record / Stop button */}
        <View style={styles.controls}>
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.recordBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleStart}
              disabled={saving}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={36}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.recordBtn, { backgroundColor: "#ef4444" }]}
              onPress={handleStop}
              disabled={saving}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="stop"
                size={36}
                color="#ffffff"
              />
            </TouchableOpacity>
          )}
        </View>

      </View>

      {/* Loading overlay */}
      <Modal
        visible={saving}
        transparent
        animationType="fade"
      >
        <View style={[styles.overlay, { backgroundColor: theme.dark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.75)" }]}>
          <View style={[styles.loadingCard, { backgroundColor: theme.colors.surface }]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <MaterialCommunityIcons
                name="cloud-upload"
                size={48}
                color={theme.colors.primary}
              />
            </Animated.View>
            <Text style={[styles.loadingTitle, { color: theme.colors.onSurface }]}>
              {t("savingAndTranscribing", language)}
            </Text>
            <Text style={[styles.loadingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Esto puede tomar unos segundos...
            </Text>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{ label: t("ok", language), onPress: () => setError("") }}
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
  card: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  input: {
    marginBottom: 16,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  timer: {
    fontSize: 64,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
    letterSpacing: 4,
    fontFamily: "monospace",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  controls: {
    alignItems: "center",
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 240,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    opacity: 0.7,
  },
});
