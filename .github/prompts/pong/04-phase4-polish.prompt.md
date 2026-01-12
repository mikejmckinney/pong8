---
agent: agent
---

# Phase 4: Polish, Audio, and Deployment

**Goal**: Add audio, visual polish, and deploy to production.

**Load These Rule Files**:
- `.github/prompts/pong/rules/domain-audio.prompt.md` (Audio)
- `.github/prompts/pong/rules/domain-qa.prompt.md` (Testing/QA)

## Objectives

Finalize the game for production:
- Implement procedural audio using Web Audio API
- Add visual "juice" (screen shake, particles)
- Configure CI/CD pipelines
- Deploy client and server

## Step-by-Step Implementation

### Step 4.1: Implement Procedural Audio

Create `client/src/audio/SoundManager.js`:

```javascript
export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }
  
  // Must be called on user interaction (mobile requirement)
  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Play silent buffer to "warm up" audio context (mobile unlock)
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      
      this.initialized = true;
      console.log("Audio initialized");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }
  
  // Paddle hit sound - Square wave (retro/harsh)
  playPaddleHit() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
  
  // Wall hit sound - Triangle wave (softer)
  playWallHit() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }
  
  // Score sound - Ascending sine waves
  playScore() {
    if (!this.initialized) return;
    
    const frequencies = [440, 554, 659, 880]; // A4, C#5, E5, A5
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      
      const startTime = this.audioContext.currentTime + (index * 0.1);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }
  
  // Win sound - Victory fanfare
  playWin() {
    if (!this.initialized) return;
    
    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      
      const startTime = this.audioContext.currentTime + (index * 0.15);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }
  
  // Lose sound - Descending tones
  playLose() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }
}

// Singleton instance
export const soundManager = new SoundManager();
```

### Step 4.2: Add Visual "Juice"

Add screen shake effect to GameScene:

```javascript
// In GameScene.js

shakeScreen(intensity = 10, duration = 100) {
  this.cameras.main.shake(duration, intensity / 1000);
}

// Call on score events:
onScore(scoringPlayerId) {
  this.shakeScreen(15, 150);
  soundManager.playScore();
  
  // Flash score text
  const scoreText = scoringPlayerId === this.localId ? this.localScoreText : this.remoteScoreText;
  this.tweens.add({
    targets: scoreText,
    scale: 1.5,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
}
```

Add particle trail to ball:

```javascript
// In GameScene.js create():

// Create particle emitter for ball trail
this.ballParticles = this.add.particles(0, 0, 'particle', {
  speed: 0,
  scale: { start: 0.5, end: 0 },
  alpha: { start: 0.6, end: 0 },
  lifespan: 200,
  frequency: 20,
  follow: this.ball,
  blendMode: 'ADD'
});

// If no particle texture, create one programmatically:
createParticleTexture() {
  const graphics = this.make.graphics({ add: false });
  graphics.fillStyle(0xffffff);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('particle', 16, 16);
}
```

### Step 4.3: Implement Power-Ups (Server-Side)

Add to `server/src/schemas/GameState.ts`:

```typescript
export class PowerUp extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("string") type: string = ""; // "enlarge" | "speed" | "freeze"
  @type("boolean") active: boolean = true;
}

export class GameState extends Schema {
  // ... existing fields
  @type({ map: PowerUp }) powerUps = new MapSchema<PowerUp>();
}
```

Add power-up logic to GameRoom:

```typescript
// Constants
const POWERUP_SPAWN_INTERVAL = 15000; // Every 15 seconds
const POWERUP_DURATION = 5000; // 5 second effect

private powerUpTimer: NodeJS.Timer | null = null;

// Track which player last hit the ball (for power-up attribution)
private lastHitPlayer: string | null = null;

private startPowerUpSpawning() {
  this.powerUpTimer = setInterval(() => {
    if (this.state.status === "playing") {
      this.spawnPowerUp();
    }
  }, POWERUP_SPAWN_INTERVAL);
}

private stopPowerUpSpawning() {
  if (this.powerUpTimer) {
    clearInterval(this.powerUpTimer);
    this.powerUpTimer = null;
  }
}

// IMPORTANT: Call stopPowerUpSpawning() in these lifecycle methods:
// - In stopGameLoop(): this.stopPowerUpSpawning();
// - In onDispose(): this.stopPowerUpSpawning();
// This prevents resource leaks when the room is disposed.

private spawnPowerUp() {
  const types = ["enlarge", "speed", "freeze"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const powerUp = new PowerUp();
  powerUp.x = 300 + Math.random() * 200; // Center area
  powerUp.y = 100 + Math.random() * 400;
  powerUp.type = type;
  powerUp.active = true;
  
  const id = `powerup_${Date.now()}`;
  this.state.powerUps.set(id, powerUp);
  
  // Remove after 10 seconds if not collected
  setTimeout(() => {
    if (this.state.powerUps.has(id)) {
      this.state.powerUps.delete(id);
    }
  }, 10000);
}

// In tick(), check ball collision with power-ups
private checkPowerUpCollision() {
  this.state.powerUps.forEach((powerUp, id) => {
    if (!powerUp.active) return;
    
    const ball = this.state.ball;
    const distance = Math.sqrt((ball.x - powerUp.x) ** 2 + (ball.y - powerUp.y) ** 2);
    
    if (distance < 30) {
      // Determine which player gets the power-up (last paddle hit)
      this.applyPowerUp(powerUp.type, this.lastHitPlayer);
      this.state.powerUps.delete(id);
    }
  });
}

private applyPowerUp(type: string, playerId: string) {
  switch (type) {
    case "enlarge":
      // Increase paddle height by 50% on the server
      const player = this.state.players.get(playerId);
      if (!player) {
        break;
      }
      const originalHeight = player.paddleHeight;
      player.paddleHeight = originalHeight * 1.5;
      this.broadcast("powerUpEffect", { type, playerId, effect: "paddleEnlarge" });
      setTimeout(() => {
        const resetPlayer = this.state.players.get(playerId);
        if (resetPlayer) {
          resetPlayer.paddleHeight = originalHeight;
        }
        this.broadcast("powerUpEffect", { type, playerId, effect: "paddleReset" });
      }, POWERUP_DURATION);
      break;
      
    case "speed":
      // Increase ball speed by 25%
      this.state.ball.velocityX *= 1.25;
      this.state.ball.velocityY *= 1.25;
      break;
      
    case "freeze":
      // Slow opponent paddle (handled on client)
      const opponentId = Array.from(this.state.players.keys()).find(id => id !== playerId);
      if (opponentId) {
        this.broadcast("powerUpEffect", { type, playerId: opponentId, effect: "freeze" });
        setTimeout(() => {
          this.broadcast("powerUpEffect", { type, playerId: opponentId, effect: "unfreeze" });
        }, POWERUP_DURATION);
      }
      break;
  }
}
```

### Step 4.4: Setup Firebase Leaderboard

Create `client/src/firebase/leaderboard.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function submitScore(playerName, score, wins) {
  try {
    await addDoc(collection(db, 'leaderboard'), {
      name: playerName,
      score: score,
      wins: wins,
      timestamp: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
}

export async function getTopScores(count = 10) {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('wins', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
}
```

### Step 4.5: Configure CI/CD Pipeline

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-client:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './client/package-lock.json'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run build
      - run: npm test --if-present

  test-server:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './server/package-lock.json'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run build
      - run: npm test --if-present

  deploy-client:
    needs: [test-client, test-server]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      # Pinned to v3.9.3 commit SHA for security (avoid supply chain attacks)
      - uses: peaceiris/actions-gh-pages@884a022509302f1c350073a05fed143bdd96e9c7
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./client/dist
```

### Step 4.6: Create Dockerfile for Server

Create `server/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Create `server/.dockerignore`:

```
node_modules
src
*.ts
tsconfig.json
```

### Step 4.7: Deployment Configuration

For Render/Railway/Fly.io, create configuration files:

`render.yaml` (for Render):
```yaml
services:
  - type: web
    name: pong-server
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

`fly.toml` (for Fly.io):
```toml
app = "pong-game-server"
primary_region = "iad"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
```

## File Checklist

Create these files:

- [ ] `client/src/audio/SoundManager.js`
- [ ] `client/src/firebase/leaderboard.js`
- [ ] `server/src/schemas/PowerUp.ts` (or add to GameState.ts)
- [ ] `.github/workflows/ci.yml`
- [ ] `server/Dockerfile`
- [ ] `server/.dockerignore`
- [ ] Deployment config (render.yaml or fly.toml)

## Validation Criteria

Before marking Phase 4 complete, verify:

### Audio
- [ ] Audio initializes on first user interaction
- [ ] Paddle hit plays square wave sound
- [ ] Wall hit plays triangle wave sound
- [ ] Score plays ascending arpeggio
- [ ] Win/Lose sounds play correctly

### Visual Polish
- [ ] Screen shakes on score
- [ ] Ball has particle trail
- [ ] Score text scales on update
- [ ] CRT scanline effect visible

### Power-Ups
- [ ] Power-ups spawn periodically
- [ ] Collision detection works
- [ ] Effects apply correctly
- [ ] Effects expire after duration

### Deployment
- [ ] CI pipeline passes
- [ ] Client builds successfully
- [ ] Server builds to Docker image
- [ ] Deployed URL is accessible

## Test Commands

```bash
# Run full test suite
cd client && npm test
cd server && npm test

# Build production assets
cd client && npm run build
cd server && npm run build

# Test Docker build
cd server && docker build -t pong-server .
docker run -p 3000:3000 pong-server
```

## Deployment Steps

1. **Client** → Deploy to GitHub Pages, Netlify, or Vercel
2. **Server** → Deploy to Render, Railway, or Fly.io
3. **Update** client WebSocket URL to production server

## Final Checklist

- [ ] All four phases validated
- [ ] CI pipeline green
- [ ] Client deployed and accessible
- [ ] Server deployed and accepting connections
- [ ] Two players can complete a full game
- [ ] Leaderboard stores and displays scores
- [ ] Mobile experience tested on real device

---

*Congratulations! You have completed the Pong game development.*
