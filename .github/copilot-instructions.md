## Required Context

- Always read `/AI_REPO_GUIDE.md` first and follow it
- If `AI_REPO_GUIDE.md` conflicts with README, prefer the most recently updated source

## Project Overview

This is a template repository for building a mobile-optimized, retro-style multiplayer web Pong game. It provides AI agent configuration, documentation, and scaffolding for game development using Phaser 3 and Colyseus/Socket.io.

### Tech Stack
- Language: JavaScript/TypeScript (ES6+)
- Framework: Phaser 3 (game engine), Colyseus/Socket.io (networking)
- Build tool: (TBD - Vite recommended)
- Test framework: Jest + headless Phaser
- Database: Firebase Firestore

## Quick Commands

### Setup
```bash
# Verify template structure
bash test.sh

# Codespace setup (if applicable)
bash install.sh
```

### Build
```bash
# Future - once game code exists
npm run build
```

### Test
```bash
# Template verification
bash test.sh

# Future - once tests exist
npm test
```

### Lint
```bash
# Future - once linting is configured
npm run lint
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `.cursor/` | Cursor AI configuration (BUGBOT.md) |
| `.gemini/` | Gemini AI style guide |
| `.github/agents/` | Custom agent definitions |
| `.github/prompts/` | AI onboarding prompts |
| `docs/` | Technical specifications and design docs |

## Key Files

| File | Purpose |
|------|---------|
| `AI_REPO_GUIDE.md` | Canonical guide for AI agents |
| `AGENTS.md` | General agent behavior rules |
| `install.sh` | Codespace/dotfiles setup |
| `test.sh` | Template verification script |

## Conventions

### Code Style
- Modern JavaScript/TypeScript (ES6+)
- Use relative positioning in Phaser (no hardcoded pixels)
- Server-authoritative multiplayer architecture

### Visual Design (Synthwave)
- Background: `#090D40` or `#1b2853`
- Player 1: `#FF005C` (Neon Pink) + bloom
- Player 2: `#00C4FF` (Cyber Cyan) + bloom
- Font: "Press Start 2P"

### Mobile Requirements
- `Phaser.Scale.FIT` for responsive scaling
- `touch-action: none` CSS for game canvas
- Landscape orientation required

## Common Gotchas

- **Template verification fails**: Run `bash test.sh` to identify missing files
- **Mobile audio blocked**: Implement user interaction unlock pattern
- **Multiplayer desync**: Use server-authoritative physics with client prediction
- **Touch input issues**: Ensure `touch-action: none` is set on canvas

## Before Submitting Changes

Always verify:
1. [ ] Template passes: `bash test.sh`
2. [ ] Build succeeds: `npm run build` (once implemented)
3. [ ] Tests pass: `npm test` (once implemented)
4. [ ] `AI_REPO_GUIDE.md` updated if commands/layout/conventions changed
