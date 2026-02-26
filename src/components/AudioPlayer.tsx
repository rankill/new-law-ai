import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { useTheme } from "react-native-paper";

interface AudioPlayerProps {
  url: string;
  duration?: number; // seconds, for display before load
  compact?: boolean; // small inline version for list cards
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ url, duration = 0, compact = false }: AudioPlayerProps) {
  const theme = useTheme();
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSlidingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0); // seconds
  const [total, setTotal] = useState(duration);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const load = async () => {
    if (soundRef.current) return soundRef.current;
    setLoading(true);
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: false },
      (status) => {
        if (!status.isLoaded) return;
        if (!isSlidingRef.current) {
          setPosition((status.positionMillis || 0) / 1000);
        }
        setTotal((status.durationMillis || duration * 1000) / 1000);
        if (status.didJustFinish) {
          setPlaying(false);
          setPosition(0);
        }
      }
    );
    soundRef.current = sound;
    setLoading(false);
    return sound;
  };

  const togglePlay = async () => {
    try {
      const sound = await load();
      if (playing) {
        await sound.pauseAsync();
        setPlaying(false);
      } else {
        if (position >= total && total > 0) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
        setPlaying(true);
      }
    } catch {
      // ignore
    }
  };

  const handleSeek = async (val: number) => {
    isSlidingRef.current = false;
    const sound = soundRef.current;
    if (sound) {
      try {
        await sound.setPositionAsync(val * 1000);
      } catch {
        // ignore
      }
    }
  };

  const sliderMax = total > 0 ? total : 1;
  const primary = theme.colors.primary;
  const trackBg = theme.colors.surfaceVariant;
  const textColor = theme.colors.onSurfaceVariant;

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <TouchableOpacity
          onPress={togglePlay}
          disabled={loading}
          style={styles.compactBtn}
          accessibilityLabel={playing ? "Pause" : "Play"}
        >
          <Text style={[styles.compactIcon, { color: primary }]}>
            {playing ? "⏸" : "▶"}
          </Text>
        </TouchableOpacity>
        <Slider
          style={styles.compactSlider}
          value={position}
          minimumValue={0}
          maximumValue={sliderMax}
          onSlidingStart={() => { isSlidingRef.current = true; }}
          onValueChange={(val) => setPosition(val)}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor={primary}
          maximumTrackTintColor={trackBg}
          thumbTintColor={primary}
        />
        <Text style={[styles.time, { color: textColor }]}>
          {formatTime(position > 0 ? position : total)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.player, { backgroundColor: theme.colors.surfaceVariant }]}>
      <TouchableOpacity
        onPress={togglePlay}
        disabled={loading}
        style={styles.playBtn}
        accessibilityLabel={playing ? "Pause" : "Play"}
      >
        <Text style={[styles.playIcon, { color: primary }]}>
          {playing ? "⏸" : "▶"}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.timeLabel, { color: textColor }]}>{formatTime(position)}</Text>
      <Slider
        style={styles.slider}
        value={position}
        minimumValue={0}
        maximumValue={sliderMax}
        onSlidingStart={() => { isSlidingRef.current = true; }}
        onValueChange={(val) => setPosition(val)}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor={primary}
        maximumTrackTintColor={theme.colors.outline}
        thumbTintColor={primary}
      />
      <Text style={[styles.timeLabel, { color: textColor }]}>{formatTime(total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 4,
    gap: 4,
  },
  playBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 20,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeLabel: {
    fontSize: 12,
    minWidth: 36,
    textAlign: "center",
  },
  // compact
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compactBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  compactIcon: {
    fontSize: 14,
  },
  compactSlider: {
    flex: 1,
    height: 28,
  },
  time: {
    fontSize: 11,
    minWidth: 32,
    textAlign: "right",
  },
});
