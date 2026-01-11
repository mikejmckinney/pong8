---
agent: agent
---

# Domain Rules: Networking (Colyseus)

This file contains the networking architecture and implementation constraints.

## Architecture Pattern

**Pattern**: Server-Authoritative Architecture

```
                    ┌─────────────────────────┐
                    │      SERVER             │
                    │  (Source of Truth)      │
                    │                         │
                    │  - Physics simulation   │
                    │  - Collision detection  │
                    │  - Score tracking       │
                    │  - Power-up spawning    │
                    └───────────┬─────────────┘
                                │
                    State Broadcast (60 FPS)
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
     ┌──────────┐        ┌──────────┐        ┌──────────┐
     │ Client 1 │        │ Client 2 │        │ Client N │
     │          │        │          │        │          │
     │ Renderer │        │ Renderer │        │ Renderer │
     │ + Input  │        │ + Input  │        │ + Input  │
     └──────────┘        └──────────┘        └──────────┘
           │                   │                   │
           └───────────────────┴───────────────────┘
                         Input Messages
                    (UP, DOWN, STOP only)
```

## Key Principles

1. **Clients send INPUTS, not positions**
   - ✅ `{ direction: "UP" }`
   - ❌ `{ paddleY: 250 }`

2. **Server calculates ALL game state**
   - Ball position and velocity
   - Paddle positions
   - Collision detection
   - Score changes

3. **Clients are "dumb terminals"**
   - Render what server tells them
   - Predict local movement for responsiveness
   - Never trust client-reported positions

## Technology Stack

- **Framework**: Colyseus
- **Transport**: WebSockets
- **Schema**: @colyseus/schema (TypeScript)

## Schema Definition

### Player Schema

```typescript
import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number = 0;      // Paddle X position
  @type("number") y: number = 300;    // Paddle Y position (center)
  @type("uint8") score: number = 0;   // Current score (0-255)
  @type("string") sessionId: string = "";
  
  // Optional: for power-ups
  @type("number") paddleHeight: number = 100;
  @type("number") moveSpeed: number = 8;
  @type("boolean") frozen: boolean = false;
}
```

### Ball Schema

```typescript
export class Ball extends Schema {
  @type("number") x: number = 400;
  @type("number") y: number = 300;
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;
}
```

### GameState Schema

```typescript
import { MapSchema } from "@colyseus/schema";

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(Ball) ball = new Ball();
  @type("string") status: string = "waiting"; // waiting | playing | finished
  @type("string") winnerId: string = "";
}
```

## Message Types

### Client → Server

| Message | Payload | Description |
|---------|---------|-------------|
| `input` | `{ direction: "UP" \| "DOWN" \| "STOP" }` | Paddle movement intent |
| `ready` | `{}` | Player is ready to start |

### Server → Client

| Message | Payload | Description |
|---------|---------|-------------|
| `gameStart` | `{ message: string }` | Both players connected |
| `gameEnd` | `{ winner: string }` | Game finished |
| `powerUpEffect` | `{ type, playerId, effect }` | Power-up applied |

## Server Implementation

### Room Configuration

```typescript
export class GameRoom extends Room<GameState> {
  maxClients = 2;              // 1v1 only
  patchRate = 1000 / 60;       // State updates at 60 FPS
  
  // Fixed simulation tick rate
  private readonly TICK_RATE = 60;
  private gameInterval: NodeJS.Timer | null = null;
}
```

### Simulation Loop

```typescript
private startGameLoop() {
  this.gameInterval = setInterval(() => {
    this.tick();
  }, 1000 / this.TICK_RATE);
}

private tick() {
  if (this.state.status !== "playing") return;
  
  // 1. Process inputs
  this.updatePaddles();
  
  // 2. Update ball position
  this.updateBall();
  
  // 3. Check collisions
  this.checkCollisions();
  
  // 4. Check scoring
  this.checkScoring();
  
  // State changes are auto-broadcast by Colyseus
}
```

### Physics Constants

```typescript
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 8;
const BALL_SIZE = 15;
const BALL_BASE_SPEED = 6;
const BALL_SPEED_INCREMENT = 0.5;
const MAX_BALL_SPEED = 15;
const WIN_SCORE = 5;
```

### Collision Detection

```typescript
private checkPaddleCollision() {
  const ball = this.state.ball;
  
  this.state.players.forEach((player) => {
    const paddleLeft = player.x - PADDLE_WIDTH / 2;
    const paddleRight = player.x + PADDLE_WIDTH / 2;
    const paddleTop = player.y - player.paddleHeight / 2;
    const paddleBottom = player.y + player.paddleHeight / 2;
    
    // AABB collision
    if (ball.x - BALL_SIZE / 2 < paddleRight &&
        ball.x + BALL_SIZE / 2 > paddleLeft &&
        ball.y - BALL_SIZE / 2 < paddleBottom &&
        ball.y + BALL_SIZE / 2 > paddleTop) {
      
      // Reverse X velocity
      ball.velocityX *= -1;
      
      // Angle based on hit position
      const hitPosition = (ball.y - player.y) / (player.paddleHeight / 2);
      ball.velocityY = hitPosition * BALL_BASE_SPEED;
      
      // Speed up ball
      this.increaseBalSpeed();
      
      // Track last hit for power-ups
      this.lastHitPlayer = player.sessionId;
      
      // Prevent ball from getting stuck in paddle
      ball.x = player.x < GAME_WIDTH / 2
        ? paddleRight + BALL_SIZE / 2 + 1
        : paddleLeft - BALL_SIZE / 2 - 1;
    }
  });
}
```

## Client Implementation

### Connection Management

```javascript
import { Client } from "colyseus.js";

const client = new Client("ws://localhost:3000");

async function connect() {
  try {
    const room = await client.joinOrCreate("pong");
    setupListeners(room);
    return room;
  } catch (error) {
    console.error("Connection failed:", error);
    return null;
  }
}
```

### State Listeners

```javascript
function setupListeners(room) {
  // Track player changes
  room.state.players.onAdd((player, sessionId) => {
    console.log(`Player joined: ${sessionId}`);
    
    // Listen for property changes on this player
    player.onChange(() => {
      updatePlayerSprite(sessionId, player);
    });
  });
  
  room.state.players.onRemove((player, sessionId) => {
    console.log(`Player left: ${sessionId}`);
    removePlayerSprite(sessionId);
  });
  
  // Track ball changes
  room.state.ball.onChange(() => {
    updateBallPosition(room.state.ball);
  });
}
```

### Input Handling

```javascript
// Send input to server
function sendInput(direction) {
  if (room && room.state.status === "playing") {
    room.send("input", { direction });
  }
}

// In update loop:
if (upKeyDown) {
  sendInput("UP");
} else if (downKeyDown) {
  sendInput("DOWN");
} else {
  sendInput("STOP");
}
```

## Lag Compensation

### Client-Side Prediction (Local Paddle)

**Purpose**: Make local paddle feel responsive despite network latency.

```javascript
class LocalPaddlePrediction {
  constructor() {
    this.predictedY = 300;
    this.serverY = 300;
    this.reconciliationThreshold = 5; // pixels
  }
  
  // Called on user input (immediately)
  applyInput(direction) {
    if (direction === "UP") {
      this.predictedY = Math.max(50, this.predictedY - 8);
    } else if (direction === "DOWN") {
      this.predictedY = Math.min(550, this.predictedY + 8);
    }
    
    // Send to server
    room.send("input", { direction });
  }
  
  // Called when server update arrives
  reconcile(serverPosition) {
    this.serverY = serverPosition;
    
    // If prediction is too far off, snap to server
    if (Math.abs(this.predictedY - serverPosition) > this.reconciliationThreshold) {
      this.predictedY = serverPosition;
    }
  }
  
  getPosition() {
    return this.predictedY;
  }
}
```

### Entity Interpolation (Remote Entities)

**Purpose**: Smooth movement for opponent's paddle and ball.

```javascript
class EntityInterpolation {
  constructor() {
    this.positionBuffer = [];
    this.interpolationDelay = 100; // ms (render 100ms in the past)
  }
  
  // Called when server update arrives
  addPosition(timestamp, x, y) {
    this.positionBuffer.push({ time: timestamp, x, y });
    
    // Keep only last 1 second of data
    const cutoff = Date.now() - 1000;
    this.positionBuffer = this.positionBuffer.filter(p => p.time > cutoff);
  }
  
  // Called every frame to get interpolated position
  getInterpolatedPosition() {
    const renderTime = Date.now() - this.interpolationDelay;
    
    // Find two positions to interpolate between
    for (let i = 0; i < this.positionBuffer.length - 1; i++) {
      const p1 = this.positionBuffer[i];
      const p2 = this.positionBuffer[i + 1];
      
      if (p1.time <= renderTime && p2.time >= renderTime) {
        const t = (renderTime - p1.time) / (p2.time - p1.time);
        return {
          x: this.lerp(p1.x, p2.x, t),
          y: this.lerp(p1.y, p2.y, t)
        };
      }
    }
    
    // Fallback to latest position
    if (this.positionBuffer.length > 0) {
      const latest = this.positionBuffer[this.positionBuffer.length - 1];
      return { x: latest.x, y: latest.y };
    }
    
    return null;
  }
  
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
}
```

### Ball Interpolation (Simplified)

```javascript
// In Phaser update():
update() {
  // Smoothly move ball toward server position
  if (this.serverBallX !== undefined) {
    this.ball.x = Phaser.Math.Linear(this.ball.x, this.serverBallX, 0.3);
    this.ball.y = Phaser.Math.Linear(this.ball.y, this.serverBallY, 0.3);
  }
}
```

## Matchmaking (Socket.io Rooms)

```typescript
// In GameRoom.ts

onJoin(client: Client, options: any) {
  // Assign player to left or right side
  const playerCount = this.state.players.size;
  const player = new Player();
  player.sessionId = client.sessionId;
  player.x = playerCount === 0 ? 50 : 750; // Left or right
  player.y = 300; // Center
  
  this.state.players.set(client.sessionId, player);
  
  // Start when room is full
  if (this.state.players.size === this.maxClients) {
    this.state.status = "playing";
    this.broadcast("gameStart", {});
    this.startGameLoop();
    this.lock(); // Prevent more players joining
  }
}

onLeave(client: Client, consented: boolean) {
  this.state.players.delete(client.sessionId);
  
  // End game if player leaves during match
  if (this.state.status === "playing") {
    this.state.status = "finished";
    // Award win to remaining player
    this.state.players.forEach((_, sessionId) => {
      this.state.winnerId = sessionId;
    });
    this.stopGameLoop();
  }
}
```

## Error Handling

```javascript
// Client-side reconnection
room.onLeave((code) => {
  console.log(`Disconnected with code: ${code}`);
  
  if (code === 1000) {
    // Normal close - return to menu
    showMenu();
  } else {
    // Abnormal close - attempt reconnect
    attemptReconnect();
  }
});

async function attemptReconnect() {
  for (let i = 0; i < 3; i++) {
    try {
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      const room = await client.reconnect(roomId, sessionId);
      setupListeners(room);
      return;
    } catch (e) {
      console.log(`Reconnect attempt ${i + 1} failed`);
    }
  }
  showError("Connection lost. Please refresh.");
}
```

## Summary Checklist

- [ ] Server runs physics at 60 FPS fixed tick rate
- [ ] Clients only send input direction (UP/DOWN/STOP)
- [ ] Server validates all game state changes
- [ ] Client-side prediction implemented for local paddle
- [ ] Entity interpolation implemented for remote paddle
- [ ] Ball position interpolated smoothly
- [ ] Colyseus schemas use correct decorators
- [ ] Room locks when full (`this.lock()`)
- [ ] Disconnection handled gracefully
- [ ] Reconnection logic implemented
