import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { audioManager } from "../services/audioManager";

interface AudioPlayerProps {
  url: string;
  duration?: number; // seconds, for display before load
  compact?: boolean; // small inline version for list cards
}

function formatTime(seconds: number): string {
  // Handle invalid values
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
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
  const [total, setTotal] = useState(duration > 0 ? duration : 1);
  const [loading, setLoading] = useState(false);

  // Use native HTML5 audio on web - much more reliable
  if (Platform.OS === 'web') {
    return (
      <View style={compact ? styles.compactRow : styles.webPlayerContainer}>
        <audio
          controls
          preload={compact ? "metadata" : "auto"} // Full player preloads, compact doesn't
          src={url}
          style={{
            width: '100%',
            height: compact ? 32 : 40,
            borderRadius: 8,
          }}
          onPlay={() => {
            // Stop other audios when this one plays
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach((audio) => {
              if (audio.src !== url && !audio.paused) {
                audio.pause();
              }
            });
          }}
        />
      </View>
    );
  }

  useEffect(() => {
    // Preload audio for full player (not compact) on mobile
    if (!compact && Platform.OS !== 'web') {
      load().catch(err => console.error("Preload error:", err));
    }

    return () => {
      if (soundRef.current) {
        audioManager.clearCurrent(soundRef.current);
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const load = async () => {
    if (soundRef.current) return soundRef.current;
    setLoading(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
        (status) => {
          if (!status.isLoaded) return;

          // Update position if not sliding
          if (!isSlidingRef.current) {
            const posSeconds = (status.positionMillis || 0) / 1000;
            setPosition(isFinite(posSeconds) ? Math.max(0, posSeconds) : 0);
          }

          // Update duration
          const durSeconds = (status.durationMillis || duration * 1000) / 1000;
          setTotal(isFinite(durSeconds) && durSeconds > 0 ? durSeconds : 1);

          // Handle audio finish
          if (status.didJustFinish) {
            setPlaying(false);
            setPosition(0);
            if (soundRef.current) {
              audioManager.clearCurrent(soundRef.current);
            }
          }
        }
      );
      soundRef.current = sound;
      setLoading(false);
      return sound;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const togglePlay = async () => {
    try {
      const sound = await load();

      if (playing) {
        // Pause
        await sound.pauseAsync();
        setPlaying(false);
        audioManager.clearCurrent(sound);
      } else {
        // Play
        // Register this sound with audio manager (stops others)
        await audioManager.setCurrentSound(sound, () => {
          setPlaying(false);
        });

        // Reset if at end
        if (position >= total - 0.5) {
          await sound.setPositionAsync(0);
          setPosition(0);
        }

        await sound.playAsync();
        setPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setPlaying(false);
    }
  };

  const handleSeek = async (val: number) => {
    isSlidingRef.current = false;
    const sound = soundRef.current;

    if (!sound || !isFinite(val) || val < 0) return;

    try {
      const seekPosition = Math.min(val, total);
      await sound.setPositionAsync(seekPosition * 1000);

      // If we seeked to near the end while playing, pause
      if (seekPosition >= total - 0.5 && playing) {
        await sound.pauseAsync();
        setPlaying(false);
        audioManager.clearCurrent(sound);
      }
    } catch (error) {
      console.error("Seek error:", error);
    }
  };

  // Ensure valid slider values
  const safePosition = isFinite(position) && position >= 0 ? Math.min(position, total) : 0;
  const safeTotal = isFinite(total) && total > 0 ? total : 1;
  const sliderMax = safeTotal;

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
          {loading ? (
            <MaterialCommunityIcons name="loading" size={16} color={primary} />
          ) : (
            <MaterialCommunityIcons
              name={playing ? "pause" : "play"}
              size={18}
              color={primary}
            />
          )}
        </TouchableOpacity>

        <Slider
          style={styles.compactSlider}
          value={safePosition}
          minimumValue={0}
          maximumValue={sliderMax}
          onSlidingStart={() => { isSlidingRef.current = true; }}
          onValueChange={(val) => {
            if (isFinite(val) && val >= 0) {
              setPosition(val);
            }
          }}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor={primary}
          maximumTrackTintColor={trackBg}
          thumbTintColor={primary}
          disabled={loading}
        />

        <Text style={[styles.time, { color: textColor }]}>
          {formatTime(safeTotal)}
        </Text>
      </View>
    );
  }

  // Full player (for chat/detail screens)
  return (
    <View style={[styles.player, { backgroundColor: theme.colors.surfaceVariant }]}>
      <TouchableOpacity
        onPress={togglePlay}
        disabled={loading}
        style={styles.playBtn}
        accessibilityLabel={playing ? "Pause" : "Play"}
      >
        {loading ? (
          <MaterialCommunityIcons name="loading" size={24} color={primary} />
        ) : (
          <MaterialCommunityIcons
            name={playing ? "pause" : "play"}
            size={28}
            color={primary}
          />
        )}
      </TouchableOpacity>

      <Text style={[styles.timeLabel, { color: textColor }]}>
        {formatTime(safePosition)}
      </Text>

      <Slider
        style={styles.slider}
        value={safePosition}
        minimumValue={0}
        maximumValue={sliderMax}
        onSlidingStart={() => { isSlidingRef.current = true; }}
        onValueChange={(val) => {
          if (isFinite(val) && val >= 0) {
            setPosition(val);
          }
        }}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor={primary}
        maximumTrackTintColor={theme.colors.outline}
        thumbTintColor={primary}
        disabled={loading}
      />

      <Text style={[styles.timeLabel, { color: textColor }]}>
        {formatTime(safeTotal)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Web player container
  webPlayerContainer: {
    marginVertical: 6,
  },

  // Full player
  player: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
    gap: 8,
  },
  playBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeLabel: {
    fontSize: 13,
    minWidth: 40,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  // Compact player (for cards)
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  compactBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  compactSlider: {
    flex: 1,
    height: 32,
  },
  time: {
    fontSize: 12,
    minWidth: 38,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});
