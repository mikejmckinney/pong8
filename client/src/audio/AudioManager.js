/**
 * AudioManager - Procedural audio using Web Audio API
 * Generates retro 8-bit style sounds without external files
 */

// Musical note frequencies (Hz) - standard equal temperament tuning
const NOTES = {
    G3: 196,    // G below middle C
    C4: 262,    // Middle C
    E4: 330,    // E above middle C
    G4: 392,    // G above middle C
    A4: 440,    // A above middle C (standard tuning reference)
    C5: 523,    // C one octave above middle C
    E5: 659,    // E one octave above middle C
    G5: 784,    // G one octave above middle C
    C6: 1047    // C two octaves above middle C
};

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isUnlocked = false;
    }

    /**
     * Initialize audio context - must be called after user interaction
     */
    unlock() {
        if (this.isUnlocked) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            
            // Resume audio context if suspended (mobile requirement)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.isUnlocked = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    /**
     * Play a paddle hit sound - Square wave
     */
    playPaddleHit() {
        if (!this.isUnlocked) return;
        this.playTone(NOTES.A4, 0.1, 'square');
    }

    /**
     * Play a wall hit sound - Triangle wave, lower frequency
     */
    playWallHit() {
        if (!this.isUnlocked) return;
        this.playTone(NOTES.G3 + 24, 0.08, 'triangle'); // ~220Hz
    }

    /**
     * Play score sound - Rising C major arpeggio (C5, E5, G5)
     */
    playScore() {
        if (!this.isUnlocked) return;
        this.playTone(NOTES.C5, 0.1, 'sine');
        setTimeout(() => this.playTone(NOTES.E5, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(NOTES.G5, 0.15, 'sine'), 200);
    }

    /**
     * Play game start sound - C major arpeggio (C4, E4, G4, C5)
     */
    playStart() {
        if (!this.isUnlocked) return;
        this.playTone(NOTES.C4, 0.08, 'square');
        setTimeout(() => this.playTone(NOTES.E4, 0.08, 'square'), 80);
        setTimeout(() => this.playTone(NOTES.G4, 0.08, 'square'), 160);
        setTimeout(() => this.playTone(NOTES.C5, 0.15, 'square'), 240);
    }

    /**
     * Play win sound - Victory fanfare (C5, E5, G5, C6)
     */
    playWin() {
        if (!this.isUnlocked) return;
        const winNotes = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6];
        winNotes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'square'), i * 150);
        });
    }

    /**
     * Play lose sound - Descending tones (G4, E4, C4, G3)
     */
    playLose() {
        if (!this.isUnlocked) return;
        const loseNotes = [NOTES.G4, NOTES.E4, NOTES.C4, NOTES.G3];
        loseNotes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sawtooth'), i * 150);
        });
    }

    /**
     * Generate and play a tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, triangle, sawtooth)
     */
    playTone(frequency, duration, type = 'square') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Envelope for smoother sound
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0.3, now + duration - 0.02);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Set master volume
     * @param {number} value - Volume from 0 to 1
     */
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }

    /**
     * Mute/unmute audio
     * @param {boolean} muted
     */
    setMuted(muted) {
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : 0.3;
        }
    }
}
