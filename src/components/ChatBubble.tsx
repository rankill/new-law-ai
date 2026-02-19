import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const theme = useTheme();
  const isUser = role === "user";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser
              ? theme.colors.primaryContainer
              : theme.colors.surfaceVariant,
            alignSelf: isUser ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text
          variant="bodyMedium"
          style={{
            color: isUser
              ? theme.colors.onPrimaryContainer
              : theme.colors.onSurfaceVariant,
          }}
        >
          {content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  rowUser: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
});
