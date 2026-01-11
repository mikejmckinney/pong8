---
agent: agent
---

# Domain Rules: UI & Graphics (Synthwave/Pong)

This file contains the visual and mobile design constraints for the Pong game.

## Aesthetic Guidelines

**Style**: 1980s Retro Futurism / Synthwave

### Color Palette

| Element | Hex Code | Visual Effect | CSS/Phaser Usage |
|---------|----------|---------------|------------------|
| **Background** | `#090D40` | Deep Void Blue | `backgroundColor: '#090D40'` |
| **Grid Lines** | `#2b2b2b` | Perspective scroll | Tiled sprite, vertical scroll |
| **Player 1** | `#FF005C` | Neon Pink | Apply Bloom effect (strength 2.0) |
| **Player 2** | `#00C4FF` | Cyber Cyan | Apply Bloom effect (strength 2.0) |
| **Ball** | `#FFFFFF` | White Core | Add particle trail |
| **Score Text** | `#FF005C` / `#00C4FF` | Match player colors | |
| **Menu Text** | `#FF005C` | Neon Pink with glow | `text-shadow` or PostFX |

### Typography

- **Font**: "Press Start 2P" (Google Fonts)
- **Loading**: Use WebFontLoader or CSS `@import`
- **Fallback**: `monospace`

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.game-text {
  font-family: 'Press Start 2P', monospace;
}
```

### Visual Effects

#### Bloom/Glow Effect (WebGL Required)

```javascript
// In Phaser scene create():
if (this.game.renderer.type === Phaser.WEBGL) {
  this.paddle.postFX.addBloom(0xffffff, 1, 1, 2, 1.2);
}
```

#### CRT Scanline Overlay

```css
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

/* Optional: CRT flicker animation */
@keyframes flicker {
  0% { opacity: 0.97; }
  50% { opacity: 1; }
  100% { opacity: 0.98; }
}

.crt-overlay {
  animation: flicker 0.15s infinite;
}
```

#### Vignette Effect

```css
.vignette {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 150px rgba(0, 0, 0, 0.9);
  pointer-events: none;
  z-index: 11;
}
```

#### Background Grid (Perspective Effect)

```javascript
// Create tiled grid sprite that scrolls vertically
this.gridBackground = this.add.tileSprite(400, 300, 800, 600, 'grid');
this.gridBackground.setTint(0x2b2b2b);

// In update():
this.gridBackground.tilePositionY -= 1; // Scroll effect
```

## Mobile Responsiveness

### Scale Manager Configuration

```javascript
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: 800,
  height: 600,
  parent: 'game-container'
}
```

**Key Rules**:
- **MUST** use `Phaser.Scale.FIT` (not ENVELOP which crops)
- **MUST** use `autoCenter: Phaser.Scale.CENTER_BOTH`
- **NEVER** use hardcoded pixel coordinates

### Relative Positioning

❌ **Wrong**:
```javascript
this.paddle.x = 50;
this.scoreText.setPosition(400, 50);
```

✅ **Correct**:
```javascript
const width = this.cameras.main.width;
const height = this.cameras.main.height;

this.paddle.x = width * 0.05;
this.scoreText.setPosition(width * 0.5, height * 0.08);
```

### Responsive UI Elements

```javascript
// Score positioning
const centerX = this.cameras.main.width * 0.5;
const scoreY = this.cameras.main.height * 0.1;

this.player1Score = this.add.text(centerX - 100, scoreY, '0', {
  fontFamily: '"Press Start 2P"',
  fontSize: Math.min(32, this.cameras.main.width * 0.04) + 'px',
  color: '#FF005C'
}).setOrigin(0.5);
```

## Touch Input System

### Split-Screen Invisible Touch Zones

```javascript
// For mobile devices
if (!this.sys.game.device.os.desktop) {
  this.input.addPointer(2); // Support multi-touch
  
  // Track touch state
  this.touchingUp = false;
  this.touchingDown = false;
  
  this.input.on('pointerdown', (pointer) => {
    const halfWidth = this.cameras.main.width * 0.5;
    if (pointer.x < halfWidth) {
      this.touchingUp = true;
    } else {
      this.touchingDown = true;
    }
  });
  
  this.input.on('pointerup', (pointer) => {
    const halfWidth = this.cameras.main.width * 0.5;
    if (pointer.x < halfWidth) {
      this.touchingUp = false;
    } else {
      this.touchingDown = false;
    }
  });
  
  this.input.on('pointermove', (pointer) => {
    if (pointer.isDown) {
      const halfWidth = this.cameras.main.width * 0.5;
      this.touchingUp = pointer.x < halfWidth;
      this.touchingDown = pointer.x >= halfWidth;
    }
  });
}
```

### Desktop Keyboard Controls

```javascript
// Arrow keys for paddle movement
this.cursors = this.input.keyboard.createCursorKeys();

// In update():
if (this.cursors.up.isDown) {
  // Move paddle up
} else if (this.cursors.down.isDown) {
  // Move paddle down
}
```

### Device Detection

```javascript
const isMobile = !this.sys.game.device.os.desktop;
const isTouch = this.sys.game.device.input.touch;

if (isMobile || isTouch) {
  this.setupTouchControls();
} else {
  this.setupKeyboardControls();
}
```

## Landscape Mode Enforcement

```css
/* Rotate overlay for portrait mode */
.rotate-device {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #090D40;
  z-index: 1000;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #FF005C;
  font-family: 'Press Start 2P', monospace;
  text-align: center;
  padding: 20px;
}

.rotate-device-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: rotate 2s infinite;
}

@keyframes rotate {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(90deg); }
}

@media (orientation: portrait) {
  .rotate-device {
    display: flex;
  }
  
  #game-container {
    display: none;
  }
}
```

```html
<div class="rotate-device">
  <div class="rotate-device-icon">📱</div>
  <p>Please rotate your device to landscape mode</p>
</div>
```

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>SynthPong</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #090D40;
      touch-action: none; /* CRITICAL for mobile */
    }
    
    #game-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    canvas {
      display: block;
      touch-action: none;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <div class="crt-overlay"></div>
    <div class="vignette"></div>
  </div>
  <div class="rotate-device">
    <div class="rotate-device-icon">📱</div>
    <p>Please rotate your device</p>
  </div>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

## Asset Creation (Programmatic)

Since we use no external assets, create all graphics programmatically:

```javascript
// Create paddle texture
createPaddleTexture(color) {
  const graphics = this.make.graphics({ add: false });
  graphics.fillStyle(color);
  graphics.fillRoundedRect(0, 0, 15, 100, 5);
  graphics.generateTexture(`paddle_${color.toString(16)}`, 15, 100);
}

// Create ball texture
createBallTexture() {
  const graphics = this.make.graphics({ add: false });
  graphics.fillStyle(0xffffff);
  graphics.fillCircle(7.5, 7.5, 7.5);
  graphics.generateTexture('ball', 15, 15);
}

// Create grid texture for background
createGridTexture() {
  const graphics = this.make.graphics({ add: false });
  graphics.lineStyle(1, 0x2b2b2b);
  
  // Draw grid lines
  for (let x = 0; x <= 800; x += 40) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 40) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  graphics.generateTexture('grid', 800, 600);
}
```

## Summary Checklist

- [ ] Use `Phaser.Scale.FIT` mode
- [ ] Use `autoCenter: Phaser.Scale.CENTER_BOTH`
- [ ] All positions use relative values (percentage of width/height)
- [ ] Touch input uses split-screen zones
- [ ] Multi-touch supported (`addPointer(2)`)
- [ ] `touch-action: none` in CSS
- [ ] Landscape mode enforced via CSS media query
- [ ] "Press Start 2P" font loaded
- [ ] CRT scanline overlay implemented
- [ ] Bloom/glow on paddles (WebGL)
- [ ] Color palette matches specification
