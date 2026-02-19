import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, Chip, IconButton, useTheme } from "react-native-paper";
import { VoiceNote } from "../services/storage";

interface NoteCardProps {
  note: VoiceNote;
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

const statusLabels: Record<VoiceNote["status"], string> = {
  recording: "Recording...",
  transcribing: "Transcribing...",
  ready: "Ready",
  error: "Error",
};

export default function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const theme = useTheme();
  const isReady = note.status === "ready";

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
          {statusLabels[note.status]}
        </Chip>
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
  },
  chip: {
    alignSelf: "flex-start",
  },
});
