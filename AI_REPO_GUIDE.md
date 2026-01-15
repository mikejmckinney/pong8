# AI Repository Guide

This is the canonical guide for AI agents working in this repository. Read this file first before making any changes.

## What This Repo Does

This is a template repository for building a **mobile-optimized, retro-style multiplayer web Pong game** using modern web technologies. It provides the scaffolding, documentation, and AI agent configuration files needed to guide AI-driven development of a complete game featuring:

- Synthwave/80s retro aesthetic
- Mobile-first responsive design
- Real-time multiplayer via WebSockets
- Power-up system and leaderboards
- Phaser 3 game engine + Colyseus/Socket.io server

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Game Engine** | Phaser 3 | 2D rendering, physics, input handling |
| **Backend** | Node.js + Socket.io/Colyseus | Real-time multiplayer, authoritative server |
| **Database** | Firebase Firestore | Leaderboards, persistence |
| **Language** | JavaScript/TypeScript | Modern ES6+ syntax |
| **Hosting** | PaaS (Render, Railway, Fly.io) | Easy deployment |

## Folder Map

```
/
├── .cursor/           # Cursor AI configuration (BUGBOT.md)
├── .gemini/           # Gemini AI style guide
├── .github/
│   ├── agents/        # Custom agent definitions (judge.agent.md)
│   ├── prompts/       # Onboarding prompts for AI agents
│   └── copilot-instructions.md  # GitHub Copilot instructions
├── client/            # Phaser 3 client app (Vite)
├── server/            # Colyseus server (TypeScript)
├── docs/              # Technical documentation and specifications
├── AGENTS.md          # Agent instructions (canonical)
├── AGENT.md           # Deprecated - points to AGENTS.md
├── AI_REPO_GUIDE.md   # This file - canonical guide for AI agents
├── README.md          # Project overview and documentation
├── install.sh         # Codespace/dotfiles setup script
└── test.sh            # Template verification script
```

## Key Entry Points

- **Game Client**: `client/` (Phaser 3 + Vite)
- **Game Server**: `server/` (Colyseus + Express)
- **Shared Types**: Will be in `shared/` for TypeScript interfaces
- **Agent Context**: `.context/` directory (to be created) for AI agent memory

## Configuration Files

| File | Purpose |
|------|---------|
| `.github/copilot-instructions.md` | GitHub Copilot agent instructions |
| `.cursor/BUGBOT.md` | Cursor AI PR review rules |
| `.gemini/styleguide.md` | Gemini code review style guide |
| `.github/agents/judge.agent.md` | Plan/diff review agent |

## How to Run Locally

This is a template repository. To start development:

```bash
# 1. Verify template structure
bash test.sh

# 2. Setup codespace environment (if in Codespaces)
bash install.sh
```

Run the client locally:
```bash
# Install dependencies
cd client
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Run the server locally:
```bash
# Install dependencies
cd server
npm install

# Start development server
npm run dev
```

## How to Test

```bash
# Verify all template files exist and are valid
bash test.sh
```

Expected output: All checks pass (21 passed, 0 failed)

## CI

GitHub Actions runs `ci.yml` to verify:

- `bash test.sh`
- `npm ci && npm run build` in `client/`
- `npm ci && npm run build` in `server/`

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
| Game entities | `client/src/objects/` | Paddle, Ball, PowerUp classes |
| Audio helpers | `client/src/audio/` | Web Audio API utilities |
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

## Development Phases (Recommended)

1. **Phase 1: Core Loop** - Single-player Pong with Phaser 3
2. **Phase 2: Network Plumbing** - Client-server connection with Colyseus
3. **Phase 3: Authoritative Physics** - Server-side game logic
4. **Phase 4: Polish** - Audio, effects, deployment

## For AI Agents

- Always read this file first
- Follow `.github/copilot-instructions.md` for Copilot-specific guidance
- Use `AGENTS.md` for general agent behavior rules
- Update this file if you change commands, layout, or conventions
