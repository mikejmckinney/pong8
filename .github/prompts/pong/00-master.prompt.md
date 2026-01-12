---
agent: agent
---

# Pong Game Development - Master Prompt

You are an expert Game Engineer specializing in Phaser 3 and Colyseus. Your task is to build a mobile-optimized, retro-style Pong game with multiplayer capabilities.

> **Important**: You are stateless. Your memory is the `.context` folder and these prompt files.

## Project Overview

Build a production-grade, web-based Pong application optimized for mobile devices featuring:
- **Retro 80s/Synthwave Aesthetic** with neon colors and CRT effects
- **Real-time multiplayer** via WebSockets (Colyseus)
- **Power-up system** (Enlarge, Speed, Freeze)
- **Persistent leaderboard** (Firebase Firestore)
- **Touch-friendly controls** for mobile

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Game Engine** | Phaser 3 | Mobile scaling, WebGL, touch input, arcade physics |
| **Backend** | Node.js + Colyseus | Authoritative server, WebSocket rooms, state schemas |
| **Database** | Firebase v9 (Firestore) | Serverless leaderboard, modular SDK |
| **Hosting** | Render/Railway/Fly.io | PaaS with WebSocket support |

## Protocol

Follow this protocol for every task:

### 1. Initialize
Read the current phase and task from `.context/state/active_task.md` (if it exists).

### 2. Load Constraints
Identify the active domain and load the corresponding rule file:
- **UI/Graphics**: `.github/prompts/pong/rules/domain-ui.prompt.md`
- **Networking**: `.github/prompts/pong/rules/domain-net.prompt.md`
- **Audio**: `.github/prompts/pong/rules/domain-audio.prompt.md`
- **Testing/QA**: `.github/prompts/pong/rules/domain-qa.prompt.md`

### 3. Plan
Create a step-by-step implementation plan before writing code.

### 4. Implement
Write code in atomic, testable blocks following the constraints from the loaded rule files.

### 5. Persist
Update `.context/state/active_task.md` with progress and next steps at the end of your session.

## Development Phases

The project is divided into four phases. Focus on one phase at a time:

| Phase | Name | Prompt File | Focus |
|-------|------|-------------|-------|
| 1 | Core Loop | `01-phase1-core-loop.prompt.md` | Single-player Pong with visuals |
| 2 | Network Plumbing | `02-phase2-networking.prompt.md` | Client-server connection |
| 3 | Authoritative Physics | `03-phase3-authoritative-physics.prompt.md` | Server-side game logic |
| 4 | Polish & Deploy | `04-phase4-polish.prompt.md` | Audio, effects, deployment |

## Repository Structure

```
pong-game/
├── .context/
│   ├── rules/              # Domain-specific constraints (read-only)
│   ├── memory/             # ADRs and session logs (read-write)
│   └── state/              # Active task tracking (volatile)
├── client/
│   └── src/                # Phaser 3 game code
├── server/
│   └── src/                # Colyseus server code
├── shared/
│   └── types/              # TypeScript interfaces shared between client/server
└── .github/
    └── workflows/          # CI/CD pipelines
```

## Key Constraints

1. **Mobile-First**: Always use `Phaser.Scale.FIT` and relative positioning
2. **Server Authority**: Never trust client state for gameplay logic
3. **No External Assets**: All graphics via Canvas API, all audio via Web Audio API
4. **Modern JavaScript**: ES6+, Firebase v9 modular SDK
5. **Type Safety**: Use TypeScript for schemas and shared types

## Getting Started

To begin development:

1. Read the phase prompt for your current phase
2. Load the relevant domain rule files
3. Follow the validation criteria before marking tasks complete

## Self-Healing Protocol

If CI fails:
1. Read the error log from the failed job
2. Analyze the failure cause
3. Generate a fix
4. Re-run tests before marking the task complete

---

*This prompt system implements "Cognitive Continuity" through file-based context management. Each domain rule file acts as a "Skill Cartridge" that can be loaded independently to maximize token efficiency.*
