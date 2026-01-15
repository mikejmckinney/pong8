export class AudioManager {
  constructor() {
    this.context = null;
    this.unlocked = false;
  }

  ensureContext() {
    if (this.context) {
      return this.context;
    }
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext || null;
    if (!AudioContextClass) {
      return null;
    }
    this.context = new AudioContextClass();
    return this.context;
  }

  unlock() {
    const context = this.ensureContext();
    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume();
    }

    if (this.unlocked) {
      return;
    }

    const buffer = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);

    this.unlocked = true;
  }

  playTone({ frequency, duration, type, gain }) {
    const context = this.ensureContext();
    if (!context || !this.unlocked) {
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = gain;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  playPaddleHit() {
    this.playTone({
      frequency: 520,
      duration: 0.06,
      type: "square",
      gain: 0.05,
    });
  }

  playWallHit() {
    this.playTone({
      frequency: 240,
      duration: 0.04,
      type: "triangle",
      gain: 0.04,
    });
  }

  playScore() {
    const context = this.ensureContext();
    if (!context || !this.unlocked) {
      return;
    }

    const now = context.currentTime;
    const baseGain = context.createGain();
    baseGain.gain.value = 0.05;
    baseGain.connect(context.destination);

    const frequencies = [660, 880, 1100];
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(baseGain);
      const start = now + index * 0.05;
      oscillator.start(start);
      oscillator.stop(start + 0.08);
    });
  }
}

export const audioManager = new AudioManager();
