---
agent: agent
---

# Phase 3: Authoritative Physics Integration

**Goal**: Move game logic to the server and implement lag compensation.

**Load These Rule Files**:
- `.github/prompts/pong/rules/domain-net.prompt.md` (Networking)
- `.github/prompts/pong/rules/domain-ui.prompt.md` (for client-side rendering)

## Objectives

Implement server-authoritative gameplay:
- Migrate physics from client to server
- Implement server simulation loop (60 FPS)
- Add client-side prediction for local paddle
- Add linear interpolation for remote entities

## Prerequisites

- Phase 2 completed and validated
- Two clients can connect to the same room

## Core Concept: Server Authority

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Authority)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Physics Simulation Loop                 │   │
│  │              (60 ticks per second)                   │   │
│  │                                                      │   │
│  │  - Ball position & velocity                         │   │
│  │  - Paddle positions                                  │   │
│  │  - Collision detection                               │   │
│  │  - Score tracking                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                    State Broadcast                          │
└───────────────────────────┼─────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│      CLIENT 1       │         │      CLIENT 2       │
│  (Input Sender +    │         │  (Input Sender +    │
│   State Renderer)   │         │   State Renderer)   │
└─────────────────────┘         └─────────────────────┘
```

**Key Principle**: Clients only send INPUTS (UP, DOWN, STOP), never positions. The server calculates all positions.

## Step-by-Step Implementation

### Step 3.1: Implement Server Physics Loop

Update `server/src/rooms/GameRoom.ts`:

```typescript
import { Room, Client } from "@colyseus/core";
import { GameState, Player, Ball } from "../schemas/GameState";

const TICK_RATE = 60; // 60 FPS
const PADDLE_SPEED = 8;
const BALL_BASE_SPEED = 6;
const BALL_SPEED_INCREMENT = 0.5;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 15;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const WIN_SCORE = 5;

export class GameRoom extends Room<GameState> {
  maxClients = 2;
  private playerInputs: Map<string, string> = new Map();
  private gameInterval: NodeJS.Timer | null = null;
  
  onCreate(options: any) {
    this.setState(new GameState());
    
    // Handle player input
    this.onMessage("input", (client, message) => {
      this.playerInputs.set(client.sessionId, message.direction);
    });
  }
  
  private startGameLoop() {
    // Initialize ball
    this.resetBall();
    
    // Start the simulation loop
    this.gameInterval = setInterval(() => {
      this.tick();
    }, 1000 / TICK_RATE);
  }
  
  private stopGameLoop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }
  
  private tick() {
    if (this.state.status !== "playing") return;
    
    // Update paddle positions based on inputs
    this.state.players.forEach((player, sessionId) => {
      const input = this.playerInputs.get(sessionId);
      
      if (input === "UP") {
        player.y = Math.max(PADDLE_HEIGHT / 2, player.y - PADDLE_SPEED);
      } else if (input === "DOWN") {
        player.y = Math.min(GAME_HEIGHT - PADDLE_HEIGHT / 2, player.y + PADDLE_SPEED);
      }
    });
    
    // Update ball position
    this.state.ball.x += this.state.ball.velocityX;
    this.state.ball.y += this.state.ball.velocityY;
    
    // Ball collision with top/bottom walls
    if (this.state.ball.y <= BALL_SIZE / 2 || 
        this.state.ball.y >= GAME_HEIGHT - BALL_SIZE / 2) {
      this.state.ball.velocityY *= -1;
    }
    
    // Ball collision with paddles
    this.checkPaddleCollision();
    
    // Check for scoring
    this.checkScoring();
  }
  
  private checkPaddleCollision() {
    const ball = this.state.ball;
    
    this.state.players.forEach((player) => {
      const paddleLeft = player.x - PADDLE_WIDTH / 2;
      const paddleRight = player.x + PADDLE_WIDTH / 2;
      const paddleTop = player.y - PADDLE_HEIGHT / 2;
      const paddleBottom = player.y + PADDLE_HEIGHT / 2;
      
      // Check if ball intersects paddle
      if (ball.x - BALL_SIZE / 2 < paddleRight &&
          ball.x + BALL_SIZE / 2 > paddleLeft &&
          ball.y - BALL_SIZE / 2 < paddleBottom &&
          ball.y + BALL_SIZE / 2 > paddleTop) {
        
        // Reverse X velocity
        ball.velocityX *= -1;
        
        // Adjust angle based on where ball hit paddle
        const hitPosition = (ball.y - player.y) / (PADDLE_HEIGHT / 2);
        ball.velocityY = hitPosition * BALL_BASE_SPEED;
        
        // Increase speed slightly
        const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
        const newSpeed = Math.min(speed + BALL_SPEED_INCREMENT, 15);
        const angle = Math.atan2(ball.velocityY, ball.velocityX);
        ball.velocityX = Math.cos(angle) * newSpeed * Math.sign(ball.velocityX);
        ball.velocityY = Math.sin(angle) * newSpeed;
        
        // Move ball outside paddle to prevent multiple collisions
        ball.x = player.x < GAME_WIDTH / 2 
          ? paddleRight + BALL_SIZE / 2 + 1
          : paddleLeft - BALL_SIZE / 2 - 1;
      }
    });
  }
  
  private checkScoring() {
    const ball = this.state.ball;
    
    if (ball.x < 0 || ball.x > GAME_WIDTH) {
      // Determine who scored
      const players = Array.from(this.state.players.entries());
      if (players.length === 2) {
        const [p1Id, p1] = players[0];
        const [p2Id, p2] = players[1];
        
        if (ball.x < 0) {
          // Player on right (p2) scores
          p2.score++;
        } else {
          // Player on left (p1) scores
          p1.score++;
        }
        
        // Check for winner
        if (p1.score >= WIN_SCORE) {
          this.state.status = "finished";
          this.state.winnerId = p1Id;
          this.broadcast("gameEnd", { winner: p1Id });
          this.stopGameLoop();
        } else if (p2.score >= WIN_SCORE) {
          this.state.status = "finished";
          this.state.winnerId = p2Id;
          this.broadcast("gameEnd", { winner: p2Id });
          this.stopGameLoop();
        } else {
          // Reset ball for next round
          this.resetBall();
        }
      }
    }
  }
  
  private resetBall() {
    this.state.ball.x = GAME_WIDTH / 2;
    this.state.ball.y = GAME_HEIGHT / 2;
    
    // Random direction
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() - 0.5) * Math.PI / 4; // -45 to 45 degrees
    
    this.state.ball.velocityX = Math.cos(angle) * BALL_BASE_SPEED * direction;
    this.state.ball.velocityY = Math.sin(angle) * BALL_BASE_SPEED;
  }
  
  onJoin(client: Client, options: any) {
    console.log(`Player joined: ${client.sessionId}`);
    
    const player = new Player();
    player.sessionId = client.sessionId;
    
    const playerCount = this.state.players.size;
    player.x = playerCount === 0 ? 50 : 750;
    player.y = GAME_HEIGHT / 2;
    
    this.state.players.set(client.sessionId, player);
    this.playerInputs.set(client.sessionId, "STOP");
    
    if (this.state.players.size === 2) {
      this.state.status = "playing";
      this.broadcast("gameStart", { message: "Game starting!" });
      this.startGameLoop();
    }
  }
  
  onLeave(client: Client, consented: boolean) {
    console.log(`Player left: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);
    this.playerInputs.delete(client.sessionId);
    
    if (this.state.status === "playing") {
      this.state.status = "finished";
      this.state.players.forEach((player, sessionId) => {
        this.state.winnerId = sessionId;
      });
      this.stopGameLoop();
    }
  }
  
  onDispose() {
    this.stopGameLoop();
    console.log("Room disposed");
  }
}
```

### Step 3.2: Implement Client-Side Prediction

Update the client to predict local paddle movement:

```javascript
// In GameScene.js

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.localPaddleY = 300;
    this.predictedY = 300;
    this.lastServerY = 300;
    this.serverPositions = []; // Buffer for interpolation
  }
  
  // Called when server state updates
  onStateUpdate(state) {
    // Store server state for interpolation
    const now = Date.now();
    
    state.players.forEach((player, sessionId) => {
      if (sessionId === networkManager.getLocalSessionId()) {
        // Local player - reconcile if needed
        this.lastServerY = player.y;
        
        // If prediction deviates > 5px, snap to server
        if (Math.abs(this.predictedY - player.y) > 5) {
          this.predictedY = player.y;
        }
      } else {
        // Remote player - buffer for interpolation
        if (!this.remotePositions) this.remotePositions = [];
        this.remotePositions.push({ time: now, y: player.y });
        
        // Keep only last 1 second of data
        this.remotePositions = this.remotePositions.filter(p => now - p.time < 1000);
      }
    });
    
    // Update ball position (with interpolation)
    this.serverBallX = state.ball.x;
    this.serverBallY = state.ball.y;
  }
  
  update(time, delta) {
    // Handle local input with prediction
    if (this.cursors.up.isDown || this.touchingUp) {
      this.predictedY = Math.max(50, this.predictedY - 8);
      networkManager.sendInput("UP");
    } else if (this.cursors.down.isDown || this.touchingDown) {
      this.predictedY = Math.min(550, this.predictedY + 8);
      networkManager.sendInput("DOWN");
    } else {
      networkManager.sendInput("STOP");
    }
    
    // Apply predicted position to local paddle immediately
    this.localPaddle.y = this.predictedY;
    
    // Interpolate remote paddle
    if (this.remotePaddle && this.remotePositions && this.remotePositions.length >= 2) {
      const renderTime = Date.now() - 100; // Render 100ms in the past
      const interpolatedY = this.interpolate(this.remotePositions, renderTime);
      // Only update if we got a valid interpolation result
      if (interpolatedY !== null) {
        this.remotePaddle.y = interpolatedY;
      }
    }
    
    // Interpolate ball
    if (this.ball) {
      this.ball.x = Phaser.Math.Linear(this.ball.x, this.serverBallX, 0.3);
      this.ball.y = Phaser.Math.Linear(this.ball.y, this.serverBallY, 0.3);
    }
  }
  
  interpolate(positions, targetTime) {
    // Handle empty or insufficient position buffer
    if (!positions || positions.length === 0) {
      return null; // Caller should handle null (use last known position or default)
    }
    
    if (positions.length === 1) {
      return positions[0].y;
    }
    
    // Find the two positions to interpolate between
    for (let i = 0; i < positions.length - 1; i++) {
      if (positions[i].time <= targetTime && positions[i + 1].time >= targetTime) {
        const t = (targetTime - positions[i].time) / (positions[i + 1].time - positions[i].time);
        return Phaser.Math.Linear(positions[i].y, positions[i + 1].y, t);
      }
    }
    
    // If no suitable pair found, return latest
    return positions[positions.length - 1].y;
  }
}
```

### Step 3.3: Update Network Manager for State Sync

```javascript
// In NetworkManager.js

setupListeners() {
  // Listen for state changes with delta updates
  this.room.state.players.onAdd((player, sessionId) => {
    console.log(`Player added: ${sessionId}`);
    if (this.onPlayerAdd) this.onPlayerAdd(player, sessionId);
    
    player.onChange(() => {
      if (this.onPlayerChange) this.onPlayerChange(player, sessionId);
    });
  });
  
  this.room.state.players.onRemove((player, sessionId) => {
    console.log(`Player removed: ${sessionId}`);
    if (this.onPlayerRemove) this.onPlayerRemove(player, sessionId);
  });
  
  this.room.state.ball.onChange(() => {
    if (this.onBallChange) {
      this.onBallChange(this.room.state.ball);
    }
  });
  
  this.room.onMessage("gameStart", (message) => {
    if (this.onGameStart) this.onGameStart(message);
  });
  
  this.room.onMessage("gameEnd", (message) => {
    if (this.onGameEnd) this.onGameEnd(message);
  });
}
```

## Lag Compensation Summary

| Entity | Technique | Implementation |
|--------|-----------|----------------|
| **Local Paddle** | Client-Side Prediction | Move immediately on input, reconcile with server |
| **Remote Paddle** | Entity Interpolation | Buffer positions, render 100ms in past, lerp between |
| **Ball** | Linear Interpolation | Lerp toward server position each frame |

## File Checklist

Update these files:

- [ ] `server/src/rooms/GameRoom.ts` - Full physics implementation
- [ ] `client/src/scenes/GameScene.js` - Prediction & interpolation
- [ ] `client/src/network/NetworkManager.js` - State sync callbacks

## Validation Criteria

Before marking Phase 3 complete, verify:

- [ ] Server runs physics at 60 FPS (check server logs)
- [ ] Ball movement is smooth on both clients
- [ ] Local paddle responds instantly to input (no perceived lag)
- [ ] Remote paddle movement appears smooth (no jitter)
- [ ] Score updates correctly when ball passes boundaries
- [ ] Game ends when a player reaches WIN_SCORE
- [ ] Test under simulated latency (Chrome DevTools: Network → Throttle)

## Test Commands

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev

# Open two browser windows
# In one window, open DevTools → Network → Throttle → Slow 3G
# Verify game remains playable despite latency
```

## Debugging Tips

1. **Desync Issues**: Log server and client ball positions, compare deltas
2. **Jittery Movement**: Increase interpolation buffer time
3. **Input Lag**: Check network round-trip time, ensure prediction is working

## Next Phase

Once all validation criteria pass, proceed to:
`04-phase4-polish.prompt.md`

---

*Remember to update `.context/state/active_task.md` with your progress.*
