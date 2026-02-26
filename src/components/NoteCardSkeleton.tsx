import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function NoteCardSkeleton() {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const shimmer = theme.dark ? "#2d2d30" : "#e8e8eb";

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
      ]}
    >
      <Animated.View style={{ opacity }}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <View style={[styles.line, { width: "62%", height: 14, backgroundColor: shimmer }]} />
            <View style={[styles.line, { width: "38%", height: 11, backgroundColor: shimmer, marginTop: 7 }]} />
          </View>
          <View style={[styles.iconPlaceholder, { backgroundColor: shimmer }]} />
        </View>

        {/* Transcript preview lines */}
        <View style={[styles.line, { width: "100%", height: 11, backgroundColor: shimmer, marginTop: 14 }]} />
        <View style={[styles.line, { width: "72%", height: 11, backgroundColor: shimmer, marginTop: 6 }]} />

        {/* Audio player bar */}
        <View style={[styles.audioBar, { backgroundColor: shimmer }]} />

        {/* Badge */}
        <View style={styles.footer}>
          <View style={[styles.badge, { width: 56, backgroundColor: shimmer }]} />
          <View style={[styles.badge, { width: 28, backgroundColor: shimmer }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  titleArea: {
    flex: 1,
  },
  line: {
    borderRadius: 4,
  },
  iconPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: 10,
  },
  audioBar: {
    height: 26,
    borderRadius: 6,
    marginTop: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    height: 20,
    borderRadius: 10,
  },
});
