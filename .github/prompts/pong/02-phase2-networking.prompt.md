---
agent: agent
---

# Phase 2: The Network Plumbing

**Goal**: Establish the Client-Server connection and basic state replication.

**Load These Rule Files**:
- `.github/prompts/pong/rules/domain-net.prompt.md` (Networking)

## Objectives

Set up the multiplayer infrastructure:
- Initialize Colyseus server
- Define GameState Schema
- Implement room joining logic
- Verify basic client-server communication

## Prerequisites

- Phase 1 completed and validated
- Understanding of WebSocket communication

## Step-by-Step Implementation

### Step 2.1: Server Project Setup

Create the server project:

```bash
mkdir -p pong-game/server/src
cd pong-game/server
npm init -y
npm install @colyseus/core @colyseus/ws-transport @colyseus/schema express
npm install -D typescript @types/node @types/express ts-node nodemon
```

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### Step 2.2: Define Game State Schema

Create `server/src/schemas/GameState.ts`:

```typescript
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 300;  // Center of play area
  @type("uint8") score: number = 0;
  @type("string") sessionId: string = "";
}

export class Ball extends Schema {
  @type("number") x: number = 400;
  @type("number") y: number = 300;
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(Ball) ball = new Ball();
  @type("string") status: string = "waiting"; // waiting | playing | finished
  @type("string") winnerId: string = "";
}
```

### Step 2.3: Create Game Room

Create `server/src/rooms/GameRoom.ts`:

```typescript
import { Room, Client } from "@colyseus/core";
import { GameState, Player, Ball } from "../schemas/GameState";

export class GameRoom extends Room<GameState> {
  maxClients = 2;
  
  onCreate(options: any) {
    this.setState(new GameState());
    
    // Handle player input
    this.onMessage("input", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        // Process input: { direction: "UP" | "DOWN" | "STOP" }
        // (Physics will be added in Phase 3)
        console.log(`Player ${client.sessionId} input: ${message.direction}`);
      }
    });
  }
  
  onJoin(client: Client, options: any) {
    console.log(`Player joined: ${client.sessionId}`);
    
    const player = new Player();
    player.sessionId = client.sessionId;
    
    // Assign position based on player order
    const playerCount = this.state.players.size;
    player.x = playerCount === 0 ? 50 : 750; // Left or right side
    
    this.state.players.set(client.sessionId, player);
    
    // Start game when both players are connected
    if (this.state.players.size === 2) {
      this.state.status = "playing";
      this.broadcast("gameStart", { message: "Game starting!" });
    }
  }
  
  onLeave(client: Client, consented: boolean) {
    console.log(`Player left: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);
    
    if (this.state.status === "playing") {
      this.state.status = "finished";
      // Award win to remaining player
      this.state.players.forEach((player, sessionId) => {
        this.state.winnerId = sessionId;
      });
    }
  }
  
  onDispose() {
    console.log("Room disposed");
  }
}
```

### Step 2.4: Create Server Entry Point

Create `server/src/index.ts`:

```typescript
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import { createServer } from "http";
import { GameRoom } from "./rooms/GameRoom";

const app = express();
const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

// Register room
gameServer.define("pong", GameRoom);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Colyseus server listening on port ${PORT}`);
});
```

### Step 2.5: Update Client to Connect

Install Colyseus client in the frontend:

```bash
cd client
npm install colyseus.js
```

Create `client/src/network/NetworkManager.js`:

```javascript
import { Client } from "colyseus.js";

export class NetworkManager {
  constructor() {
    this.client = null;
    this.room = null;
    this.sessionId = null;
  }
  
  async connect(serverUrl = "ws://localhost:3000") {
    this.client = new Client(serverUrl);
    
    try {
      // Try to join existing room or create new one
      this.room = await this.client.joinOrCreate("pong");
      this.sessionId = this.room.sessionId;
      
      console.log(`Joined room: ${this.room.roomId}`);
      console.log(`Session ID: ${this.sessionId}`);
      
      this.setupListeners();
      return true;
    } catch (error) {
      console.error("Failed to connect:", error);
      return false;
    }
  }
  
  setupListeners() {
    // Listen for state changes
    this.room.onStateChange((state) => {
      console.log("State changed:", state);
    });
    
    // Listen for game start
    this.room.onMessage("gameStart", (message) => {
      console.log("Game starting:", message);
    });
    
    // Listen for disconnection
    this.room.onLeave((code) => {
      console.log("Left room with code:", code);
    });
  }
  
  sendInput(direction) {
    if (this.room) {
      this.room.send("input", { direction });
    }
  }
  
  disconnect() {
    if (this.room) {
      this.room.leave();
    }
  }
  
  isConnected() {
    return this.room !== null;
  }
  
  getLocalSessionId() {
    return this.sessionId;
  }
}

// Singleton instance
export const networkManager = new NetworkManager();
```

### Step 2.6: Update Package.json Scripts

Add to `server/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## File Checklist

Create these files:

- [ ] `server/package.json`
- [ ] `server/tsconfig.json`
- [ ] `server/src/index.ts`
- [ ] `server/src/rooms/GameRoom.ts`
- [ ] `server/src/schemas/GameState.ts`
- [ ] `client/src/network/NetworkManager.js`

## Validation Criteria

Before marking Phase 2 complete, verify:

- [ ] Server starts without errors: `npm run dev`
- [ ] Health check responds: `curl http://localhost:3000/health`
- [ ] Client can connect to server (check console logs)
- [ ] Opening two browser windows connects both to same room
- [ ] "Player joined" logs appear in server console
- [ ] "Game starting!" message broadcasts when 2 players connect
- [ ] Player disconnection is handled gracefully

## Test Commands

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev

# Open http://localhost:5173 in two browser windows
# Check browser console for connection logs
# Check server terminal for join/leave logs
```

## Debugging Tips

1. **Connection Issues**: Ensure WebSocket URL matches server port
2. **Schema Errors**: Check decorator syntax and types
3. **Room Not Found**: Verify room is registered with correct name

## Next Phase

Once all validation criteria pass, proceed to:
`03-phase3-authoritative-physics.prompt.md`

---

*Remember to update `.context/state/active_task.md` with your progress.*
