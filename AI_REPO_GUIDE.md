# AI Repository Guide

This is the canonical guide for AI agents working in this repository. Read this file first before making any changes.

## What This Repo Does

This is a **mobile-optimized, retro-style Pong game** built with modern web technologies featuring:

- ✅ Synthwave/80s retro aesthetic (Neon Pink, Cyber Cyan, CRT effects)
- ✅ Mobile-first responsive design (touch controls, landscape orientation)
- ✅ Single-player mode with AI opponent
- ✅ Procedural audio using Web Audio API
- 🔜 Real-time multiplayer via WebSockets (Phase 2)
- 🔜 Power-up system and leaderboards (Phase 4)
- Phaser 3 game engine + Vite build system

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Game Engine** | Phaser 3.87 | 2D rendering, physics, input handling |
| **Build Tool** | Vite 6.x | Fast development and production builds |
| **Backend** | Node.js + Socket.io/Colyseus | Real-time multiplayer (future) |
| **Database** | Firebase Firestore | Leaderboards (future) |
| **Language** | JavaScript (ES6+) | Modern syntax with modules |
| **Hosting** | PaaS (Render, Railway, Fly.io) | Easy deployment |

## Folder Map

```
/
├── client/                # Game client application
│   ├── src/
│   │   ├── main.js        # Entry point, Phaser config
│   │   ├── scenes/        # Phaser scenes (Boot, Menu, Game)
│   │   ├── entities/      # Game objects (Paddle, Ball)
│   │   └── audio/         # Audio manager (Web Audio API)
│   ├── index.html         # HTML with CRT effects
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Dependencies
├── .cursor/               # Cursor AI configuration
├── .gemini/               # Gemini AI style guide
├── .github/
│   ├── agents/            # Custom agent definitions
│   ├── prompts/           # AI onboarding prompts
│   └── copilot-instructions.md
├── docs/                  # Technical specifications
├── AGENTS.md              # Agent instructions
├── AI_REPO_GUIDE.md       # This file
├── README.md              # Project overview
├── install.sh             # Codespace setup
└── test.sh                # Template verification
```

## Key Entry Points

- **Game Client**: `client/src/main.js` - Phaser 3 game initialization
- **Game Scenes**: `client/src/scenes/` - BootScene, MenuScene, GameScene
- **Game Entities**: `client/src/entities/` - Paddle.js, Ball.js
- **Audio**: `client/src/audio/AudioManager.js` - Procedural sound
- **Server**: Not yet implemented (Phase 2)

## Configuration Files

| File | Purpose |
|------|---------|
| `client/vite.config.js` | Vite build configuration |
| `client/package.json` | Game dependencies |
| `.github/copilot-instructions.md` | GitHub Copilot instructions |
| `.cursor/BUGBOT.md` | Cursor AI PR review rules |
| `.gemini/styleguide.md` | Gemini code review style guide |

## How to Run Locally

```bash
# 1. Verify template structure
bash test.sh

# 2. Install game dependencies
cd client && npm install

# 3. Run development server
npm run dev

# 4. Open in browser (usually http://localhost:3000)
```

### Production Build

```bash
cd client
npm run build    # Creates optimized build in dist/
npm run preview  # Preview production build locally
```

## How to Test

```bash
# Verify template files exist
bash test.sh

# Build game to check for errors
cd client && npm run build
```

## Conventions

### Code Style
- Use modern JavaScript/TypeScript (ES6+)
- Follow existing patterns in the codebase
- No hardcoded pixel values in Phaser - use relative positioning
- Server-authoritative architecture for multiplayer

### Visual Style (Synthwave Aesthetic)
- Background: `#090D40` (Deep Blue) or `#1b2853` (Indigo)
- Player 1: `#FF005C` (Neon Pink) with bloom effect
- Player 2: `#00C4FF` (Cyber Cyan) with bloom effect
- Ball: `#FFFFFF` (White)
- Font: "Press Start 2P" (Google Fonts)

### Mobile Requirements
- Use `Phaser.Scale.FIT` for responsive scaling
- Touch input: split-screen invisible zones (left/right)
- Require landscape orientation
- Apply `touch-action: none` CSS to prevent browser gestures

### Networking
- Server-authoritative model (server runs physics)
- Client-side prediction for local paddle
- Linear interpolation for remote entities
- WebSocket communication via Socket.io or Colyseus

## Where to Add Things

| Feature | Location | Notes |
|---------|----------|-------|
| Game scenes | `client/src/scenes/` | Phaser Scene classes |
| Game entities | `client/src/entities/` | Paddle, Ball, PowerUp classes |
| Server rooms | `server/src/rooms/` | Colyseus room handlers |
| Shared types | `shared/types/` | TypeScript interfaces |
| Tests | `tests/` | Jest + headless Phaser |
| CI workflows | `.github/workflows/` | GitHub Actions |

## Troubleshooting / Common Gotchas

### Template Verification Fails
- Run `bash test.sh` to see which files are missing
- Required files: `AI_REPO_GUIDE.md`, `AGENTS.md`, `README.md`, etc.

### Mobile Audio Not Playing
- Mobile browsers require user interaction before audio plays
- Implement "unlock audio" pattern on first touch

### WebSocket Connection Issues
- Ensure CORS is configured on the server
- Check that WebSocket port is accessible

### Game Desync in Multiplayer
- Use server-authoritative physics
- Implement client-side prediction with reconciliation
- Use interpolation for remote entities

## Development Phases

1. ✅ **Phase 1: Core Loop** - Single-player Pong with Phaser 3
   - Paddle and Ball entities with arcade physics
   - AI opponent with difficulty scaling
   - Synthwave visuals (glow effects, CRT overlay)
   - Procedural audio (Web Audio API)
   - Touch and keyboard controls
2. 🔜 **Phase 2: Network Plumbing** - Client-server connection with Colyseus
3. 🔜 **Phase 3: Authoritative Physics** - Server-side game logic
4. 🔜 **Phase 4: Polish** - Power-ups, leaderboards, deployment

## For AI Agents

- Always read this file first
- Follow `.github/copilot-instructions.md` for Copilot-specific guidance
- Use `AGENTS.md` for general agent behavior rules
- Update this file if you change commands, layout, or conventions
