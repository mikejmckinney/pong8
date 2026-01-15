# Pong8 - AI-Driven Retro Multiplayer Pong

A mobile-optimized, retro-style multiplayer web Pong game built with modern web technologies and AI-assisted development.

## Overview

Pong8 is a template repository that provides the scaffolding and documentation for building a complete multiplayer Pong game with:

- 🎮 **Retro Synthwave Aesthetic** - Neon colors, CRT effects, 80s vibes
- 📱 **Mobile-First Design** - Touch controls, responsive scaling
- 🌐 **Real-Time Multiplayer** - Server-authoritative WebSocket gameplay
- ⚡ **Power-Ups & Modes** - Speed boosts, paddle enlargements, freeze effects
- 🏆 **Leaderboards** - Persistent score tracking

## Tech Stack

- **Frontend**: [Phaser 3](https://phaser.io/) - HTML5 game framework
- **Backend**: Node.js + [Colyseus](https://colyseus.io/) / Socket.io
- **Database**: Firebase Firestore
- **Deployment**: Render / Railway / Fly.io

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mikejmckinney/pong8.git
cd pong8

# Verify template structure
bash test.sh
```

### Run the Game Client

```bash
cd client
npm install
npm run dev
```

### For GitHub Codespaces

The repository includes a setup script for Codespaces:

```bash
bash install.sh
```

## Project Structure

```
pong8/
├── .cursor/              # Cursor AI configuration
├── .gemini/              # Gemini AI style guide
├── .github/
│   ├── agents/           # Custom AI agents
│   ├── prompts/          # AI onboarding prompts
│   └── copilot-instructions.md
├── client/               # Phaser 3 client app (Vite)
├── docs/                 # Technical specifications
├── AI_REPO_GUIDE.md      # Canonical guide for AI agents
├── AGENTS.md             # Agent behavior rules
├── install.sh            # Codespace setup
└── test.sh               # Template verification
```

## Documentation

See the `/docs` folder for detailed technical specifications:

- [AI Agent Game Development Framework](docs/AI%20Agent%20Game%20Development%20Framework.md)
- [Technical Specification for Retro Pong](docs/AI%20Agent%20Prompt%20for%20Retro%20Pong%20Game.md)
- [Stack and Deployment Guide](docs/Developing%20a%20Mobile-Friendly%20Web%20Pong%20Game_%20Stack%2C%20Backend%2C%20and%20Deployment.md)
- [Project Organization Best Practices](docs/Project%20Organization%20and%20Best%20Practices%20for%20the%20AI-Driven%20Game.md)

## AI-Assisted Development

This repository is designed for AI-assisted development. AI agents should:

1. **Read `AI_REPO_GUIDE.md` first** - Contains canonical project information
2. **Follow `AGENTS.md`** - General agent behavior rules
3. **Use `.github/copilot-instructions.md`** - GitHub Copilot specific guidance

## Development Phases

1. **Phase 1**: Core game loop (single-player Pong)
2. **Phase 2**: Network infrastructure (WebSocket connections)
3. **Phase 3**: Authoritative multiplayer (server-side physics)
4. **Phase 4**: Polish (audio, effects, deployment)

## Visual Design

The game uses a **Synthwave** aesthetic:

| Element | Color |
|---------|-------|
| Background | `#090D40` Deep Blue / `#1b2853` Indigo (alternate) |
| Player 1 | `#FF005C` Neon Pink |
| Player 2 | `#00C4FF` Cyber Cyan |
| Ball | `#FFFFFF` White |

## Contributing

See `AGENTS.md` for guidelines on working with AI agents in this repository.

## License

MIT License

## Acknowledgments

- [Phaser 3](https://phaser.io/) - HTML5 game framework
- [Colyseus](https://colyseus.io/) - Multiplayer game framework
- [Firebase](https://firebase.google.com/) - Backend services
