import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, Chip, IconButton, useTheme } from "react-native-paper";
import { VoiceNote } from "../services/storage";
import { Language, t, LANGUAGES } from "../i18n";

interface NoteCardProps {
  note: VoiceNote;
  language: Language;
  onPress: () => void;
  onDelete: () => void;
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

export default function NoteCard({ note, language, onPress, onDelete }: NoteCardProps) {
  const theme = useTheme();
  const isReady = note.status === "ready";

  const statusKey = {
    recording: "statusRecording",
    transcribing: "statusTranscribing",
    ready: "statusReady",
    error: "statusError",
  } as const;

  const noteLang = LANGUAGES.find((l) => l.code === note.language);

  return (
    <Card
      style={styles.card}
      mode="elevated"
      onPress={isReady ? onPress : undefined}
    >
      <Card.Title
        title={note.title}
        subtitle={`${formatDate(note.createdAt)} · ${formatDuration(note.duration)}`}
        right={(props) => (
          <IconButton
            {...props}
            icon="delete-outline"
            onPress={onDelete}
          />
        )}
      />
      {note.transcript ? (
        <Card.Content>
          <Text variant="bodySmall" numberOfLines={2} style={styles.preview}>
            {note.transcript}
          </Text>
        </Card.Content>
      ) : null}
      <Card.Content style={styles.chipRow}>
        <Chip
          icon={isReady ? "check-circle" : "clock-outline"}
          compact
          style={[
            styles.chip,
            {
              backgroundColor: isReady
                ? theme.colors.primaryContainer
                : theme.colors.surfaceVariant,
            },
          ]}
        >
          {t(statusKey[note.status], language)}
        </Chip>
        {noteLang && (
          <Chip compact style={[styles.chip, styles.langChip]}>
            {noteLang.flag}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  preview: {
    opacity: 0.7,
  },
  chipRow: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    alignSelf: "flex-start",
  },
  langChip: {
    minWidth: 0,
  },
});
