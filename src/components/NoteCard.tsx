import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "react-native-paper";
import { VoiceNote } from "../services/storage";
import { Language, t, LANGUAGES } from "../i18n";
import AudioPlayer from "./AudioPlayer";

interface NoteCardProps {
  note: VoiceNote;
  language: Language;
  onPress: () => void;
  onDelete: () => Promise<void>;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_COLORS = {
  light: {
    recording: { bg: "#fef3c7", text: "#d97706" },
    transcribing: { bg: "#dbeafe", text: "#2563eb" },
    ready: { bg: "#f0fdf4", text: "#16a34a" },
    error: { bg: "#fef2f2", text: "#dc2626" },
  },
  dark: {
    recording: { bg: "#451a03", text: "#fbbf24" },
    transcribing: { bg: "#1e3a8a", text: "#60a5fa" },
    ready: { bg: "#052e16", text: "#4ade80" },
    error: { bg: "#450a0a", text: "#f87171" },
  },
};

export default function NoteCard({ note, language, onPress, onDelete }: NoteCardProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusKey = {
    recording: "statusRecording",
    transcribing: "statusTranscribing",
    ready: "statusReady",
    error: "statusError",
  } as const;

  const palette = isDark ? STATUS_COLORS.dark : STATUS_COLORS.light;
  const badge = palette[note.status] ?? palette.error;
  const noteLang = LANGUAGES.find((l) => l.code === note.language);

  const overlayColor = isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.45)";

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <Pressable
            style={styles.titleArea}
            onPress={onPress}
            android_ripple={{ color: theme.colors.surfaceVariant }}
          >
            <Text
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {note.title}
            </Text>
            <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(note.createdAt)} · {formatDuration(note.duration)}
            </Text>
          </Pressable>

          {/* Delete button — shows spinner while deleting */}
          <TouchableOpacity
            onPress={() => setConfirmOpen(true)}
            style={styles.deleteBtn}
            hitSlop={10}
            accessibilityLabel="Delete note"
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={theme.colors.onSurfaceVariant} />
            ) : (
              <Text style={[styles.deleteIcon, { color: theme.colors.onSurfaceVariant }]}>
                ···
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Transcript preview */}
        {note.transcript ? (
          <Text
            numberOfLines={2}
            style={[styles.preview, { color: theme.colors.onSurfaceVariant }]}
          >
            {note.transcript}
          </Text>
        ) : null}

        {/* Audio player - non-interactive, doesn't navigate */}
        <AudioPlayer url={note.audioUrl} duration={note.duration} compact />

        {/* Footer with badges and open button */}
        <View style={styles.footer}>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {t(statusKey[note.status], language)}
              </Text>
            </View>
            {noteLang && (
              <Text style={[styles.badgeText, { color: theme.colors.onSurfaceVariant }]}>
                {noteLang.flag}
              </Text>
            )}
          </View>

          {/* Open note button */}
          <TouchableOpacity
            style={[styles.openBtn, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.openBtnText, { color: theme.colors.onPrimaryContainer }]}>
              {t("open", language)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete confirm dialog */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setConfirmOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: overlayColor }]}
          onPress={() => !deleting && setConfirmOpen(false)}
        >
          <Pressable
            style={[
              styles.dialog,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
            ]}
          >
            <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>
              Delete note?
            </Text>
            <Text style={[styles.dialogBody, { color: theme.colors.onSurfaceVariant }]}>
              "{note.title}" and its audio will be permanently removed.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogBtn, { borderColor: theme.colors.outline }]}
                onPress={() => setConfirmOpen(false)}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <Text style={[styles.dialogBtnText, { color: theme.colors.onSurface }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.deleteConfirmBtn]}
                onPress={handleConfirmDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : null}
                <Text style={[styles.dialogBtnText, { color: "#fff" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
    gap: 4,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  deleteBtn: {
    paddingLeft: 12,
    paddingTop: 2,
    minWidth: 28,
    alignItems: "center",
  },
  deleteIcon: {
    fontSize: 16,
    letterSpacing: 1,
    lineHeight: 18,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.85,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
    flexWrap: "wrap",
    alignItems: "center",
  },
  openBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  openBtnText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  // Confirm dialog
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  dialog: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  dialogBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 8,
  },
  dialogBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  deleteConfirmBtn: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  dialogBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
