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

#### Synthwave Sun (Horizon Element)

The synthwave aesthetic features a gradient sun at the horizon with horizontal stripe lines:

**Sun Colors (top to bottom gradient)**:
| Position | Hex Code | Color |
|----------|----------|-------|
| 0-20% | `#FF005C` | Neon Pink |
| 40% | `#FF6B00` | Orange |
| 60-100% | `#FFD93D` | Yellow |

**Implementation (CSS)**:
```css
.synthwave-sun {
  position: absolute;
  bottom: 8%;  /* Position near bottom of screen */
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 220px;
  background: linear-gradient(to bottom, #FF005C 0%, #FF6B00 40%, #FFD93D 100%);
  border-radius: 50%;
  clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
  box-shadow: 0 0 60px #FF005C, 0 0 100px #FF6B00;
}

/* Horizontal stripe lines on sun */
.synthwave-sun::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 100%;
  height: 50%;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 8px,
    #090D40 8px, #090D40 12px
  );
}
```

**Implementation (Phaser)**:
```javascript
// Create sun with gradient texture
createSunTexture() {
  const graphics = this.make.graphics({ add: false });
  const colors = [0xFF005C, 0xFF6B00, 0xFFD93D];
  
  // Draw gradient circle
  for (let i = 0; i < 90; i++) {
    const colorIndex = Math.floor((i / 90) * colors.length);
    graphics.fillStyle(colors[Math.min(colorIndex, colors.length - 1)]);
    graphics.fillRect(0, i, 180, 1);
  }
  
  graphics.generateTexture('sun', 180, 90);
}

// Add sun to scene
this.sun = this.add.image(400, 300, 'sun');
this.sun.postFX.addGlow(0xFF005C, 4, 0, false, 0.5, 32);
```

#### Background Grid (Animated Perspective Effect)

The grid recedes into the horizon with a scrolling animation:

**Grid Specifications**:
- Line color: `#FF005C` (Neon Pink) at 30% opacity
- Cell size: 60px x 30px (perspective adjusted)
- Scroll speed: 30px per second (moving toward viewer)
- Perspective angle: 45-60 degrees

**Implementation (CSS)**:
```css
.perspective-grid {
  position: absolute;
  bottom: 0;
  left: -50%;
  width: 200%;
  height: 42%;
  background-image: 
    linear-gradient(transparent 95%, #FF005C 95%),
    linear-gradient(90deg, transparent 49.5%, #FF005C 50.5%, transparent 50.5%);
  background-size: 80px 40px;
  transform: perspective(150px) rotateX(45deg);
  transform-origin: center top;
  animation: gridScroll 1.5s linear infinite;
}

@keyframes gridScroll {
  0% { background-position-y: 0; }
  100% { background-position-y: 40px; }
}
```

**Implementation (Phaser)**:
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
  
  // Track touch state with pointer IDs to handle drag scenarios
  this.touchingUp = false;
  this.touchingDown = false;
  this.activeUpPointers = new Set();
  this.activeDownPointers = new Set();
  
  this.input.on('pointerdown', (pointer) => {
    const halfWidth = this.cameras.main.width * 0.5;
    if (pointer.x < halfWidth) {
      this.activeUpPointers.add(pointer.id);
      this.touchingUp = true;
    } else {
      this.activeDownPointers.add(pointer.id);
      this.touchingDown = true;
    }
  });
  
  this.input.on('pointerup', (pointer) => {
    // Clear touch state based on which side this pointer was contributing to,
    // rather than its current X position (handles drag-off scenarios)
    if (this.activeUpPointers.has(pointer.id)) {
      this.activeUpPointers.delete(pointer.id);
      this.touchingUp = this.activeUpPointers.size > 0;
    }
    if (this.activeDownPointers.has(pointer.id)) {
      this.activeDownPointers.delete(pointer.id);
      this.touchingDown = this.activeDownPointers.size > 0;
    }
  });
  
  this.input.on('pointermove', (pointer) => {
    if (pointer.isDown) {
      const halfWidth = this.cameras.main.width * 0.5;
      // Update pointer tracking if it crosses the midpoint
      const wasUp = this.activeUpPointers.has(pointer.id);
      const wasDown = this.activeDownPointers.has(pointer.id);
      const isNowUp = pointer.x < halfWidth;
      
      if (wasUp && !isNowUp) {
        this.activeUpPointers.delete(pointer.id);
        this.activeDownPointers.add(pointer.id);
      } else if (wasDown && isNowUp) {
        this.activeDownPointers.delete(pointer.id);
        this.activeUpPointers.add(pointer.id);
      }
      
      this.touchingUp = this.activeUpPointers.size > 0;
      this.touchingDown = this.activeDownPointers.size > 0;
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
