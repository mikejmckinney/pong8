/**
 * AudioManager - Procedural audio using Web Audio API
 * Generates retro 8-bit style sounds without external files
 */

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
        this.playTone(440, 0.1, 'square');
    }

    /**
     * Play a wall hit sound - Triangle wave, lower frequency
     */
    playWallHit() {
        if (!this.isUnlocked) return;
        this.playTone(220, 0.08, 'triangle');
    }

    /**
     * Play score sound - Rising tone sequence
     */
    playScore() {
        if (!this.isUnlocked) return;
        this.playTone(523, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(784, 0.15, 'sine'), 200);
    }

    /**
     * Play game start sound
     */
    playStart() {
        if (!this.isUnlocked) return;
        this.playTone(262, 0.08, 'square');
        setTimeout(() => this.playTone(330, 0.08, 'square'), 80);
        setTimeout(() => this.playTone(392, 0.08, 'square'), 160);
        setTimeout(() => this.playTone(523, 0.15, 'square'), 240);
    }

    /**
     * Play win sound - Victory fanfare
     */
    playWin() {
        if (!this.isUnlocked) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'square'), i * 150);
        });
    }

    /**
     * Play lose sound - Descending tones
     */
    playLose() {
        if (!this.isUnlocked) return;
        const notes = [392, 330, 262, 196];
        notes.forEach((freq, i) => {
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
