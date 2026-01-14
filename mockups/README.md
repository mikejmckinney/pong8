# SynthPong Game Mockups

These mockups demonstrate the visual design of the SynthPong game, based on the Synthwave/80s Retro Futurism aesthetic defined in the project documentation.

## Visual Design Specifications

The mockups follow the design guidelines from:
- `AI_REPO_GUIDE.md` - Core visual conventions
- `.github/prompts/pong/rules/domain-ui.prompt.md` - Detailed UI specifications
- `docs/AI Agent Prompt for Retro Pong Game.md` - Technical specifications

### Color Palette

| Element | Hex Code | Description |
|---------|----------|-------------|
| Background | `#090D40` | Deep Void Blue |
| Grid Lines | `#FF005C` | Neon Pink (30% opacity) |
| Player 1 | `#FF005C` | Neon Pink with bloom |
| Player 2 | `#00C4FF` | Cyber Cyan with bloom |
| Ball | `#FFFFFF` | White core |
| Sun Top | `#FF005C` | Neon Pink |
| Sun Middle | `#FF6B00` | Orange |
| Sun Bottom | `#FFD93D` | Yellow |

### Typography
- **Font**: "Press Start 2P" (Google Fonts)
- **Style**: Retro arcade pixelated

### Effects
- **Synthwave Sun** - Gradient sun at horizon with horizontal stripe lines
- **Animated Perspective Grid** - Receding grid scrolling toward viewer
- **CRT scanline overlay** - Simulated monitor lines
- **Vignette effect** - Darkened edges
- **Neon glow/bloom** - Box-shadow based bloom on paddles
- **Particle trails** - Ball motion trail

## Screenshots

### Menu Screen
![Menu Screen](menu-screen.png)

The main menu features:
- Glowing "SYNTHPONG" title in neon pink
- Subtitle in cyber cyan
- Menu options with selection indicator
- Decorative paddles showing player colors
- **Synthwave sun at horizon** with gradient colors and stripe lines
- **Animated perspective grid** receding into the horizon
- Gradient neon border lines
- CRT scanline and vignette effects

### Gameplay Screen
![Gameplay Screen](gameplay-screen.png)

The gameplay view shows:
- Score display in player colors (pink/cyan)
- Neon paddles with bloom effects
- White ball with motion trail
- Dashed center line
- Power-up indicator (enlarge power-up shown)
- **Subtle synthwave sun** in background (reduced opacity)
- **Animated perspective grid** as floor effect
- Player labels at bottom

### Mobile Portrait View
![Mobile Portrait](mobile-portrait.png)

When device is in portrait orientation:
- "Please Rotate" message displayed
- Animated phone icon
- Landscape mode enforcement
- Maintains Synthwave aesthetic

## HTML Mockup Files

The mockups are implemented as static HTML/CSS files that can be viewed in any browser:

- `menu-screen.html` - Main menu mockup with animated grid
- `gameplay-screen.html` - Active gameplay mockup with animated grid
- `mobile-portrait.html` - Mobile rotation prompt mockup

### Viewing the Mockups

```bash
# Start a local server in the mockups directory
cd mockups
python3 -m http.server 8080

# Open in browser
# http://localhost:8080/menu-screen.html
# http://localhost:8080/gameplay-screen.html
# http://localhost:8080/mobile-portrait.html
```

## Synthwave Background Implementation

### Sun Effect (CSS)
```css
.synthwave-sun {
  background: linear-gradient(to bottom, #FF005C, #FF6B00, #FFD93D);
  border-radius: 50%;
  clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
  box-shadow: 0 0 60px #FF005C, 0 0 100px #FF6B00;
}
```

### Animated Grid (CSS)
```css
.perspective-grid {
  transform: perspective(150px) rotateX(45deg);
  animation: gridScroll 1.5s linear infinite;
}

@keyframes gridScroll {
  0% { background-position-y: 0; }
  100% { background-position-y: 40px; }
}
```

## Implementation Notes

These mockups are purely visual representations created with HTML/CSS. The actual game will be implemented using:

- **Phaser 3** for game rendering and physics
- **WebGL** with PostFX pipeline for bloom effects
- **Colyseus** for multiplayer networking

The CSS effects shown (bloom via `box-shadow`, CRT via `linear-gradient`, perspective grid via CSS transforms) demonstrate the intended look. In the Phaser implementation, native PostFX effects and tileSprite scrolling will provide higher quality rendering.
