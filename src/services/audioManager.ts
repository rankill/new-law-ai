/**
 * Audio Manager - Singleton to ensure only one audio plays at a time
 */

import { Audio } from "expo-av";

class AudioManager {
  private static instance: AudioManager;
  private currentSound: Audio.Sound | null = null;
  private currentStopCallback: (() => void) | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Register a new sound as currently playing
   * Automatically stops any previously playing sound
   */
  async setCurrentSound(sound: Audio.Sound, stopCallback?: () => void) {
    // Stop any currently playing sound
    await this.stopCurrent();

    this.currentSound = sound;
    this.currentStopCallback = stopCallback || null;
  }

  /**
   * Stop the currently playing sound
   */
  async stopCurrent() {
    if (this.currentSound) {
      try {
        await this.currentSound.pauseAsync();
      } catch {
        // Ignore errors if sound is already stopped or unloaded
      }
    }

    // Call the stop callback to update UI state
    if (this.currentStopCallback) {
      this.currentStopCallback();
      this.currentStopCallback = null;
    }

    this.currentSound = null;
  }

  /**
   * Clear current sound reference without stopping
   * (useful when sound finishes naturally or is unloaded)
   */
  clearCurrent(sound: Audio.Sound) {
    if (this.currentSound === sound) {
      this.currentSound = null;
      this.currentStopCallback = null;
    }
  }

  /**
   * Check if a specific sound is currently playing
   */
  isCurrentSound(sound: Audio.Sound): boolean {
    return this.currentSound === sound;
  }
}

export const audioManager = AudioManager.getInstance();
