---
agent: agent
---

# Phase 1: The Core Loop (Single-Player Foundation)

**Goal**: Create a working, local Pong game with no networking.

**Load These Rule Files**:
- `.github/prompts/pong/rules/domain-ui.prompt.md` (UI/Graphics)

## Objectives

Build the foundation of the Pong game with:
- Phaser 3 project setup
- Paddle and Ball with arcade physics
- Synthwave visual aesthetic
- Mobile touch input
- Responsive scaling

## Prerequisites

Ensure you have:
- Node.js 18+ installed
- npm or yarn package manager

## Step-by-Step Implementation

### Step 1.1: Project Setup

Create the project structure:

```bash
mkdir -p pong-game/client/src
cd pong-game/client
npm init -y
npm install phaser vite
```

Create `client/vite.config.js`:
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist'
  }
});
```

### Step 1.2: Initialize Phaser with Mobile Scaling

Create `client/src/main.js`:

```javascript
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';

const config = {
  type: Phaser.AUTO, // WebGL with Canvas fallback
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    parent: 'game-container'
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [MenuScene, GameScene],
  backgroundColor: '#090D40' // Deep Void Blue
};

new Phaser.Game(config);
```

### Step 1.3: Implement Game Scene with Physics

Create `client/src/scenes/GameScene.js`:

Key implementation requirements:
1. **Paddles**: Two paddles using `graphics.fillRect()` with Synthwave colors
2. **Ball**: White ball with collision detection against paddles and walls
3. **Score**: Display using "Press Start 2P" Google Font
4. **Physics**: Use Arcade Physics for collision and bouncing

```javascript
// Paddle collision should adjust ball angle based on hit position
// Ball velocity should increase slightly after each paddle hit
// Score updates when ball passes left/right boundaries
```

### Step 1.4: Implement Synthwave Visuals

Follow the color palette from `domain-ui.prompt.md`:
- Background: `#090D40` (Deep Void Blue)
- Grid Lines: `#2b2b2b` (Perspective scroll effect)
- Player 1 Paddle: `#FF005C` (Neon Pink) with Bloom
- Player 2 Paddle: `#00C4FF` (Cyber Cyan) with Bloom
- Ball: `#FFFFFF` (White)

Implement CRT effects:
```css
/* Add to index.html or CSS */
.crt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
}
```

### Step 1.5: Implement Touch Controls

For mobile devices, implement split-screen invisible touch zones:
- **Left 50% of screen**: Move paddle UP
- **Right 50% of screen**: Move paddle DOWN

```javascript
// In GameScene create():
if (!this.sys.game.device.os.desktop) {
  this.input.addPointer(2); // Support multi-touch
  
  this.input.on('pointerdown', (pointer) => {
    if (pointer.x < this.cameras.main.width * 0.5) {
      // Move UP
    } else {
      // Move DOWN
    }
  });
}
```

For desktop, map Arrow Keys:
```javascript
this.cursors = this.input.keyboard.createCursorKeys();
```

### Step 1.6: Create Menu Scene

Create `client/src/scenes/MenuScene.js`:
- Title: "SYNTHPONG" in neon pink with glow
- "Press Start" or "Tap to Play" text
- Transition to GameScene on input

## File Checklist

Create these files:

- [ ] `client/package.json`
- [ ] `client/vite.config.js`
- [ ] `client/index.html`
- [ ] `client/src/main.js`
- [ ] `client/src/scenes/MenuScene.js`
- [ ] `client/src/scenes/GameScene.js`
- [ ] `client/src/objects/Paddle.js`
- [ ] `client/src/objects/Ball.js`

## Validation Criteria

Before marking Phase 1 complete, verify:

- [ ] Ball bounces correctly off walls (top/bottom)
- [ ] Ball bounces off paddles with angle variation
- [ ] Score increments when ball passes boundaries
- [ ] Touch input works on mobile (test with Chrome DevTools device mode)
- [ ] Game scales correctly to different screen sizes
- [ ] CRT scanline effect is visible
- [ ] Synthwave colors are correctly applied
- [ ] "Press Start 2P" font is loaded and displayed

## Test Commands

```bash
cd client
npm run dev
# Open http://localhost:5173 in browser
# Test mobile by opening Chrome DevTools and toggling device toolbar
```

## Next Phase

Once all validation criteria pass, proceed to:
`02-phase2-networking.prompt.md`

---

*Remember to update `.context/state/active_task.md` with your progress.*
