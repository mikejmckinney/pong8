# Pong8 - Retro Arcade Pong Game

A mobile-optimized, retro-style Pong game with Synthwave aesthetics, built with Phaser 3 and modern web technologies.

![Pong8 Menu](https://github.com/user-attachments/assets/307c7e1f-77ef-4404-928e-f2b9c3fa5b38)

## Features

- 🎮 **Classic Pong Gameplay** - Fast-paced arcade action
- 🌈 **Synthwave Aesthetic** - Neon colors, CRT effects, 80s vibes
- 📱 **Mobile-First Design** - Touch controls, responsive scaling
- 🤖 **AI Opponent** - Single-player mode with adjustable difficulty
- 🔊 **Procedural Audio** - Retro 8-bit sounds using Web Audio API
- 🖥️ **CRT Effects** - Scanlines and vignette overlay

![Pong8 Gameplay](https://github.com/user-attachments/assets/98335d87-a2c8-4b03-86a4-d3f3b2a99c98)

## Tech Stack

- **Frontend**: [Phaser 3](https://phaser.io/) - HTML5 game framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast development server and bundler
- **Audio**: Web Audio API - Procedural sound generation
- **Future**: Node.js + Colyseus for multiplayer

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mikejmckinney/pong8.git
cd pong8

# Install dependencies
cd client
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser to play!

### Controls

| Platform | Controls |
|----------|----------|
| **Desktop** | Arrow keys (↑/↓) or W/S |
| **Mobile** | Tap left side to move up, right side to move down |
| **Pause** | ESC or P key, or tap pause button |

## Project Structure

```
pong8/
├── client/                # Game client
│   ├── src/
│   │   ├── main.js        # Entry point
│   │   ├── scenes/        # Phaser scenes
│   │   ├── entities/      # Game objects
│   │   └── audio/         # Audio manager
│   ├── index.html         # HTML with CRT effects
│   └── package.json       # Dependencies
├── docs/                  # Technical specs
├── AI_REPO_GUIDE.md       # AI agent guide
└── AGENTS.md              # Agent rules
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

- [x] **Phase 1**: Core game loop (single-player Pong with AI)
- [ ] **Phase 2**: Network infrastructure (WebSocket connections)
- [ ] **Phase 3**: Authoritative multiplayer (server-side physics)
- [ ] **Phase 4**: Polish (power-ups, leaderboards, deployment)

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
