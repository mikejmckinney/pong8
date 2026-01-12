---
agent: agent
---

# Domain Rules: Audio Engineering

This file contains the audio implementation guidelines for the Pong game.

## Key Principles

1. **No External Audio Files** - All sounds generated procedurally
2. **Mobile Browser Compatibility** - Handle autoplay restrictions
3. **Retro Sound Design** - 8-bit style using basic waveforms

## Web Audio API Fundamentals

### Audio Context Initialization

```javascript
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }
  
  // MUST be called on user interaction (click/tap)
  async init() {
    if (this.initialized) return true;
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume if suspended (Safari requirement)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      return false;
    }
  }
}
```

### Mobile Audio Unlock Pattern

Mobile browsers block audio until user interaction. Implement unlock on first touch:

```javascript
// In MenuScene or on first user input
document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

async function unlockAudio() {
  await soundManager.init();
  
  // Play silent buffer to "warm up" the audio context
  const buffer = soundManager.audioContext.createBuffer(1, 1, 22050);
  const source = soundManager.audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(soundManager.audioContext.destination);
  source.start(0);
  
  console.log('Audio unlocked');
}
```

## Sound Design Specifications

### Waveform Types

| Waveform | Character | Use Case |
|----------|-----------|----------|
| `sine` | Pure, clean | Score arpeggio, UI feedback |
| `square` | Harsh, retro | Paddle hit (8-bit classic) |
| `triangle` | Soft, mellow | Wall bounce |
| `sawtooth` | Buzzy, aggressive | Game over, warnings |

### Sound Effects

#### 1. Paddle Hit Sound

**Character**: Punchy, satisfying, retro "blip"

```javascript
playPaddleHit() {
  if (!this.initialized) return;
  
  const osc = this.audioContext.createOscillator();
  const gain = this.audioContext.createGain();
  
  // Square wave for that classic 8-bit sound
  osc.type = 'square';
  
  // Start at 220Hz, drop to 110Hz quickly
  osc.frequency.setValueAtTime(220, this.audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    110, 
    this.audioContext.currentTime + 0.1
  );
  
  // Quick attack, fast decay
  gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.01, 
    this.audioContext.currentTime + 0.1
  );
  
  osc.connect(gain);
  gain.connect(this.audioContext.destination);
  
  osc.start(this.audioContext.currentTime);
  osc.stop(this.audioContext.currentTime + 0.1);
}
```

#### 2. Wall Hit Sound

**Character**: Softer than paddle hit, subtle feedback

```javascript
playWallHit() {
  if (!this.initialized) return;
  
  const osc = this.audioContext.createOscillator();
  const gain = this.audioContext.createGain();
  
  // Triangle wave for softer sound
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
  
  // Short and subtle
  gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.01, 
    this.audioContext.currentTime + 0.05
  );
  
  osc.connect(gain);
  gain.connect(this.audioContext.destination);
  
  osc.start(this.audioContext.currentTime);
  osc.stop(this.audioContext.currentTime + 0.05);
}
```

#### 3. Score Sound

**Character**: Celebratory, ascending arpeggio

```javascript
playScore() {
  if (!this.initialized) return;
  
  // A major arpeggio: A4, C#5, E5, A5
  const frequencies = [440, 554, 659, 880];
  
  frequencies.forEach((freq, index) => {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    
    const startTime = this.audioContext.currentTime + (index * 0.1);
    
    // Quick fade in, longer fade out
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
}
```

#### 4. Victory Fanfare

**Character**: Triumphant, major chord progression

```javascript
playWin() {
  if (!this.initialized) return;
  
  // C major chord: C5, E5, G5, then resolve to C6
  const frequencies = [523, 659, 784, 1047];
  
  frequencies.forEach((freq, index) => {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    
    const startTime = this.audioContext.currentTime + (index * 0.15);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}
```

#### 5. Defeat Sound

**Character**: Descending, minor key, sad

```javascript
playLose() {
  if (!this.initialized) return;
  
  const osc = this.audioContext.createOscillator();
  const gain = this.audioContext.createGain();
  
  // Sawtooth for buzzy, sad quality
  osc.type = 'sawtooth';
  
  // Descending pitch
  osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    110, 
    this.audioContext.currentTime + 0.5
  );
  
  gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.01, 
    this.audioContext.currentTime + 0.5
  );
  
  osc.connect(gain);
  gain.connect(this.audioContext.destination);
  
  osc.start(this.audioContext.currentTime);
  osc.stop(this.audioContext.currentTime + 0.5);
}
```

#### 6. Power-Up Collect Sound

**Character**: Sparkly, magical pickup

```javascript
playPowerUp() {
  if (!this.initialized) return;
  
  // Quick ascending sweep
  const osc = this.audioContext.createOscillator();
  const gain = this.audioContext.createGain();
  
  osc.type = 'sine';
  
  // Rapid ascending sweep
  osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    1600, 
    this.audioContext.currentTime + 0.15
  );
  
  gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.01, 
    this.audioContext.currentTime + 0.15
  );
  
  osc.connect(gain);
  gain.connect(this.audioContext.destination);
  
  osc.start(this.audioContext.currentTime);
  osc.stop(this.audioContext.currentTime + 0.15);
}
```

#### 7. Menu Select Sound

**Character**: Clean UI feedback

```javascript
playMenuSelect() {
  if (!this.initialized) return;
  
  const osc = this.audioContext.createOscillator();
  const gain = this.audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
  
  gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.01, 
    this.audioContext.currentTime + 0.08
  );
  
  osc.connect(gain);
  gain.connect(this.audioContext.destination);
  
  osc.start(this.audioContext.currentTime);
  osc.stop(this.audioContext.currentTime + 0.08);
}
```

## Complete Sound Manager Implementation

```javascript
export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.enabled = true;  // User can toggle
  }
  
  async init() {
    if (this.initialized) return true;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Warm-up with silent buffer
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      
      this.initialized = true;
      console.log('SoundManager initialized');
      return true;
    } catch (error) {
      console.error('SoundManager init failed:', error);
      return false;
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  isEnabled() {
    return this.enabled && this.initialized;
  }
  
  // Helper to create oscillator with standard settings
  createSound(type, frequency, duration, volume = 0.3) {
    if (!this.isEnabled()) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01, 
      this.audioContext.currentTime + duration
    );
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  }
  
  playPaddleHit() { /* ... as above */ }
  playWallHit() { /* ... as above */ }
  playScore() { /* ... as above */ }
  playWin() { /* ... as above */ }
  playLose() { /* ... as above */ }
  playPowerUp() { /* ... as above */ }
  playMenuSelect() { /* ... as above */ }
}

// Singleton
export const soundManager = new SoundManager();
```

## Integration with Phaser

```javascript
// In your scene's create():
create() {
  // Initialize audio on first input
  this.input.once('pointerdown', async () => {
    await soundManager.init();
  });
}

// Play sounds based on game events:

// When ball hits paddle
onPaddleCollision() {
  soundManager.playPaddleHit();
}

// When ball hits top/bottom wall
onWallCollision() {
  soundManager.playWallHit();
}

// When player scores
onScore(playerId) {
  soundManager.playScore();
}

// When game ends
onGameEnd(winner, localPlayerId) {
  if (winner === localPlayerId) {
    soundManager.playWin();
  } else {
    soundManager.playLose();
  }
}

// When power-up collected
onPowerUpCollect() {
  soundManager.playPowerUp();
}
```

## Server-Side Sound Triggers

For multiplayer, sound events should be synchronized. The server can send events:

```typescript
// Server sends events that trigger sounds
this.broadcast("soundEffect", { type: "paddleHit" });
this.broadcast("soundEffect", { type: "score", playerId: scoringPlayer });
```

```javascript
// Client listens and plays
room.onMessage("soundEffect", (data) => {
  switch (data.type) {
    case "paddleHit":
      soundManager.playPaddleHit();
      break;
    case "score":
      soundManager.playScore();
      break;
    // ... etc
  }
});
```

## Audio Settings UI (Optional)

```javascript
// Simple toggle button
const muteButton = document.createElement('button');
muteButton.textContent = '🔊';
muteButton.onclick = () => {
  const enabled = soundManager.isEnabled();
  soundManager.setEnabled(!enabled);
  muteButton.textContent = !enabled ? '🔊' : '🔇';
};
```

## Browser Compatibility Notes

| Browser | Notes |
|---------|-------|
| Chrome | Full support, autoplay policy requires user interaction |
| Firefox | Full support |
| Safari | Requires `webkitAudioContext`, strict autoplay policy |
| Mobile Chrome | Must unlock on first touch |
| Mobile Safari | Must unlock on first touch, may resume after app switch |

## Summary Checklist

- [ ] AudioContext created on user interaction (not page load)
- [ ] Silent buffer played to "warm up" context (mobile unlock)
- [ ] All sounds use Web Audio API oscillators (no external files)
- [ ] Paddle hit uses square wave (retro sound)
- [ ] Wall hit uses triangle wave (softer)
- [ ] Score uses ascending sine arpeggio
- [ ] Win/Lose sounds implemented
- [ ] Volume levels balanced (0.1 - 0.3 range)
- [ ] Sound enable/disable toggle available
- [ ] Works on iOS Safari (tested)
