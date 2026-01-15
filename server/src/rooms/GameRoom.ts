import { Room, Client } from "@colyseus/core";
import { GameState, Player } from "../schemas/GameState";

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

const DIRECTIONS = ["UP", "DOWN", "STOP"] as const;
type Direction = (typeof DIRECTIONS)[number];

export class GameRoom extends Room<GameState> {
  maxClients = 2;
  patchRate = 1000 / 60;

  private readonly tickRate = 60;
  private playerInputs = new Map<string, Direction>();

  onCreate() {
    this.setState(new GameState());

    this.setSimulationInterval(() => this.tick(), 1000 / this.tickRate);

    this.onMessage("input", (client, message) => {
      const direction = message?.direction;
      if (DIRECTIONS.includes(direction)) {
        this.playerInputs.set(client.sessionId, direction);
      }
    });
  }

  onJoin(client: Client) {
    console.log(`Player joined: ${client.sessionId}`);

    const player = new Player();
    player.sessionId = client.sessionId;
    const playerCount = this.state.players.size;
    player.x = playerCount === 0 ? 50 : 750;
    player.y = GAME_HEIGHT * 0.5;
    player.score = 0;

    this.state.players.set(client.sessionId, player);
    this.playerInputs.set(client.sessionId, "STOP");

    if (this.state.players.size === this.maxClients) {
      this.startMatch();
    }
  }

  onLeave(client: Client) {
    console.log(`Player left: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);
    this.playerInputs.delete(client.sessionId);

    if (this.state.status === "playing") {
      this.state.status = "finished";
      this.state.players.forEach((_, sessionId) => {
        this.state.winnerId = sessionId;
      });
      this.broadcast("gameEnd", { winner: this.state.winnerId });
    }
  }

  onDispose() {
    console.log("Room disposed");
  }

  private startMatch() {
    this.state.status = "playing";
    this.resetBall(Math.random() > 0.5 ? 1 : -1);
    this.broadcast("gameStart", { message: "Game starting!" });
    this.lock();
  }

  private tick() {
    if (this.state.status !== "playing") {
      return;
    }

    this.updatePaddles();
    this.updateBall();
    this.checkPaddleCollisions();
    this.checkScoring();
  }

  private updatePaddles() {
    this.state.players.forEach((player, sessionId) => {
      const direction = this.playerInputs.get(sessionId) ?? "STOP";
      const delta =
        direction === "UP" ? -PADDLE_SPEED : direction === "DOWN" ? PADDLE_SPEED : 0;
      const nextY = player.y + delta;
      const halfHeight = PADDLE_HEIGHT * 0.5;
      player.y = Math.max(halfHeight, Math.min(GAME_HEIGHT - halfHeight, nextY));
    });
  }

  private updateBall() {
    const ball = this.state.ball;
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    const halfSize = BALL_SIZE * 0.5;
    if (ball.y - halfSize <= 0) {
      ball.y = halfSize;
      ball.velocityY *= -1;
    } else if (ball.y + halfSize >= GAME_HEIGHT) {
      ball.y = GAME_HEIGHT - halfSize;
      ball.velocityY *= -1;
    }
  }

  private checkPaddleCollisions() {
    const ball = this.state.ball;
    const halfBall = BALL_SIZE * 0.5;

    this.state.players.forEach((player) => {
      const paddleLeft = player.x - PADDLE_WIDTH * 0.5;
      const paddleRight = player.x + PADDLE_WIDTH * 0.5;
      const paddleTop = player.y - PADDLE_HEIGHT * 0.5;
      const paddleBottom = player.y + PADDLE_HEIGHT * 0.5;

      if (
        ball.x - halfBall < paddleRight &&
        ball.x + halfBall > paddleLeft &&
        ball.y - halfBall < paddleBottom &&
        ball.y + halfBall > paddleTop
      ) {
        const hitPosition = (ball.y - player.y) / (PADDLE_HEIGHT * 0.5);
        ball.velocityY = hitPosition * BALL_BASE_SPEED;
        ball.velocityX *= -1;

        const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
        if (speed < MAX_BALL_SPEED) {
          const newSpeed = Math.min(speed + BALL_SPEED_INCREMENT, MAX_BALL_SPEED);
          const scale = newSpeed / speed;
          ball.velocityX *= scale;
          ball.velocityY *= scale;
        }

        ball.x =
          player.x < GAME_WIDTH * 0.5
            ? paddleRight + halfBall + 1
            : paddleLeft - halfBall - 1;
      }
    });
  }

  private checkScoring() {
    const ball = this.state.ball;
    if (ball.x < 0 || ball.x > GAME_WIDTH) {
      const { left, right } = this.getPlayersBySide();
      const scoredOnLeft = ball.x < 0;
      const scorer = scoredOnLeft ? right : left;
      if (scorer) {
        scorer.score += 1;
        if (scorer.score >= WIN_SCORE) {
          this.state.status = "finished";
          this.state.winnerId = scorer.sessionId;
          this.broadcast("gameEnd", { winner: scorer.sessionId });
          return;
        }
      }

      const direction = scoredOnLeft ? -1 : 1;
      this.resetBall(direction);
    }
  }

  private resetBall(direction: 1 | -1) {
    const ball = this.state.ball;
    ball.x = GAME_WIDTH * 0.5;
    ball.y = GAME_HEIGHT * 0.5;

    const angle = Math.random() * 0.6 - 0.3;
    ball.velocityX = Math.cos(angle) * BALL_BASE_SPEED * direction;
    ball.velocityY = Math.sin(angle) * BALL_BASE_SPEED;
  }

  private getPlayersBySide() {
    let left: Player | null = null;
    let right: Player | null = null;
    this.state.players.forEach((player) => {
      if (player.x < GAME_WIDTH * 0.5) {
        left = player;
      } else {
        right = player;
      }
    });
    return { left, right };
  }
}
