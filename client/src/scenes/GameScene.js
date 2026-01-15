import Phaser from "phaser";
import { Paddle } from "../objects/Paddle.js";
import { Ball } from "../objects/Ball.js";
import { networkManager } from "../network/NetworkManager.js";

const NETWORK_WIDTH = 800;
const NETWORK_HEIGHT = 600;
const NETWORK_PADDLE_SPEED = 8;
const NETWORK_PADDLE_LERP = 0.3;
const NETWORK_BALL_LERP = 0.35;
const RECONCILIATION_THRESHOLD = 5;

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    const { width, height } = this.cameras.main;

    this.createTextures();

    this.gridBackground = this.add.tileSprite(
      width * 0.5,
      height * 0.5,
      width,
      height,
      "grid"
    );
    this.gridBackground.setTint(0x2b2b2b);
    this.gridBackground.setAlpha(0.35);

    this.paddleSpeed = height * 0.9;
    this.aiSpeed = height * 0.75;

    const paddleOffset = width * 0.08;
    this.leftPaddle = new Paddle(this, paddleOffset, height * 0.5, "paddleLeft");
    this.rightPaddle = new Paddle(
      this,
      width - paddleOffset,
      height * 0.5,
      "paddleRight"
    );

    if (this.game.renderer.type === Phaser.WEBGL) {
      this.leftPaddle.postFX.addBloom(0xffffff, 1, 1, 2, 1.2);
      this.rightPaddle.postFX.addBloom(0xffffff, 1, 1, 2, 1.2);
    }

    const baseBallSpeed = width * 0.6;
    this.ball = new Ball(this, width * 0.5, height * 0.5, "ball", baseBallSpeed);

    this.physics.world.setBounds(0, 0, width, height);

    this.physics.add.collider(
      this.ball,
      this.leftPaddle,
      this.handlePaddleHit,
      undefined,
      this
    );
    this.physics.add.collider(
      this.ball,
      this.rightPaddle,
      this.handlePaddleHit,
      undefined,
      this
    );

    this.leftScoreValue = 0;
    this.rightScoreValue = 0;
    this.createScoreText();

    this.setupControls();

    this.networkMode = false;
    this.networkReady = false;
    this.lastSentDirection = "STOP";
    this.playerSides = new Map();
    this.leftSessionId = null;
    this.rightSessionId = null;
    this.localSessionId = null;
    this.localSide = null;
    this.serverLocalY = null;
    this.predictedLocalY = null;
    this.leftTargetY = null;
    this.rightTargetY = null;
    this.serverBallTarget = null;
    this.netScaleX = width / NETWORK_WIDTH;
    this.netScaleY = height / NETWORK_HEIGHT;

    networkManager.connect().then((room) => {
      if (!room) {
        this.networkReady = false;
        return;
      }

      this.networkReady = true;
      this.localSessionId = networkManager.getLocalSessionId();
      this.enableNetworkMode();
      this.setupNetworkListeners(room);
    });

    const initialDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    this.ball.launch(initialDirection);
  }

  createTextures() {
    const { width, height } = this.cameras.main;
    const paddleWidth = Math.round(width * 0.02);
    const paddleHeight = Math.round(height * 0.2);
    const paddleRadius = Math.round(paddleWidth * 0.35);
    const ballSize = Math.round(Math.min(width, height) * 0.02);
    const gridSpacing = Math.round(width * 0.05);

    const leftGraphics = this.make.graphics({ add: false });
    leftGraphics.fillStyle(0xff005c);
    leftGraphics.fillRoundedRect(0, 0, paddleWidth, paddleHeight, paddleRadius);
    leftGraphics.generateTexture("paddleLeft", paddleWidth, paddleHeight);
    leftGraphics.destroy();

    const rightGraphics = this.make.graphics({ add: false });
    rightGraphics.fillStyle(0x00c4ff);
    rightGraphics.fillRoundedRect(0, 0, paddleWidth, paddleHeight, paddleRadius);
    rightGraphics.generateTexture("paddleRight", paddleWidth, paddleHeight);
    rightGraphics.destroy();

    const ballGraphics = this.make.graphics({ add: false });
    ballGraphics.fillStyle(0xffffff);
    ballGraphics.fillCircle(ballSize * 0.5, ballSize * 0.5, ballSize * 0.5);
    ballGraphics.generateTexture("ball", ballSize, ballSize);
    ballGraphics.destroy();

    const gridGraphics = this.make.graphics({ add: false });
    gridGraphics.lineStyle(1, 0x2b2b2b, 0.6);
    for (let x = 0; x <= width; x += gridSpacing) {
      gridGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += gridSpacing) {
      gridGraphics.lineBetween(0, y, width, y);
    }
    gridGraphics.generateTexture("grid", width, height);
    gridGraphics.destroy();
  }

  createScoreText() {
    const { width, height } = this.cameras.main;
    const scoreY = height * 0.1;
    const scoreOffset = width * 0.12;
    const fontSize = `${Math.round(width * 0.04)}px`;

    this.leftScoreText = this.add
      .text(width * 0.5 - scoreOffset, scoreY, "0", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize,
        color: "#FF005C",
      })
      .setOrigin(0.5);

    this.rightScoreText = this.add
      .text(width * 0.5 + scoreOffset, scoreY, "0", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize,
        color: "#00C4FF",
      })
      .setOrigin(0.5);
  }

  setupControls() {
    const isMobile = !this.sys.game.device.os.desktop;
    const isTouch = this.sys.game.device.input.touch;

    if (isMobile || isTouch) {
      this.setupTouchControls();
    } else {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
  }

  setupTouchControls() {
    this.input.addPointer(2);

    this.touchingUp = false;
    this.touchingDown = false;
    this.activeUpPointers = new Set();
    this.activeDownPointers = new Set();

    this.input.on("pointerdown", (pointer) => {
      const halfWidth = this.cameras.main.width * 0.5;
      if (pointer.x < halfWidth) {
        this.activeUpPointers.add(pointer.id);
      } else {
        this.activeDownPointers.add(pointer.id);
      }
      this.updateTouchState();
    });

    this.input.on("pointerup", (pointer) => {
      if (this.activeUpPointers.has(pointer.id)) {
        this.activeUpPointers.delete(pointer.id);
      }
      if (this.activeDownPointers.has(pointer.id)) {
        this.activeDownPointers.delete(pointer.id);
      }
      this.updateTouchState();
    });

    this.input.on("pointermove", (pointer) => {
      if (!pointer.isDown) {
        return;
      }

      const halfWidth = this.cameras.main.width * 0.5;
      const wasUp = this.activeUpPointers.has(pointer.id);
      const wasDown = this.activeDownPointers.has(pointer.id);
      const isNowUp = pointer.x < halfWidth;

      if (wasUp && !isNowUp) {
        this.activeUpPointers.delete(pointer.id);
        this.activeDownPointers.add(pointer.id);
      } else if (wasDown && isNowUp) {
        this.activeDownPointers.delete(pointer.id);
        this.activeUpPointers.add(pointer.id);
      }

      this.updateTouchState();
    });
  }

  updateTouchState() {
    this.touchingUp = this.activeUpPointers.size > 0;
    this.touchingDown = this.activeDownPointers.size > 0;
  }

  handlePaddleHit(ball, paddle) {
    const normalized =
      (ball.y - paddle.y) / (paddle.displayHeight * 0.5 || 1);
    const clamped = Phaser.Math.Clamp(normalized, -1, 1);
    const maxBounce = Phaser.Math.DegToRad(60);
    const bounceAngle = clamped * maxBounce;

    ball.boost(1.05, 1.8);
    const direction = paddle === this.leftPaddle ? 1 : -1;
    const speed = ball.currentSpeed;

    ball.setVelocity(
      Math.cos(bounceAngle) * speed * direction,
      Math.sin(bounceAngle) * speed
    );
  }

  resetBall(direction) {
    const { width, height } = this.cameras.main;
    this.ball.reset(width * 0.5, height * 0.5);
    this.time.delayedCall(500, () => {
      this.ball.launch(direction);
    });
  }

  enableNetworkMode() {
    this.networkMode = true;
    const { width, height } = this.cameras.main;

    this.ball.reset(width * 0.5, height * 0.5);
    this.ball.setVelocity(0, 0);

    if (this.ball.body) {
      this.ball.body.enable = false;
    }
    if (this.leftPaddle.body) {
      this.leftPaddle.body.enable = false;
    }
    if (this.rightPaddle.body) {
      this.rightPaddle.body.enable = false;
    }
  }

  setupNetworkListeners(room) {
    room.state.players.onAdd((player, sessionId) => {
      const side = player.x < NETWORK_WIDTH * 0.5 ? "left" : "right";
      this.playerSides.set(sessionId, side);

      if (side === "left") {
        this.leftSessionId = sessionId;
      } else {
        this.rightSessionId = sessionId;
      }

      if (sessionId === this.localSessionId) {
        this.localSide = side;
      }

      player.onChange(() => {
        this.applyServerPlayerState(sessionId, player);
      });

      this.applyServerPlayerState(sessionId, player);
    });

    room.state.players.onRemove((_player, sessionId) => {
      const side = this.playerSides.get(sessionId);
      if (side === "left") {
        this.leftSessionId = null;
        this.leftTargetY = null;
      } else if (side === "right") {
        this.rightSessionId = null;
        this.rightTargetY = null;
      }
      if (sessionId === this.localSessionId) {
        this.localSide = null;
      }
      this.playerSides.delete(sessionId);
    });

    room.state.ball.onChange(() => {
      const { x, y } = room.state.ball;
      this.serverBallTarget = this.scaleNetworkPosition(x, y);
    });

    room.onMessage("gameEnd", (payload) => {
      if (payload?.winner) {
        console.log(`Winner: ${payload.winner}`);
      }
    });
  }

  applyServerPlayerState(sessionId, player) {
    const side = this.playerSides.get(sessionId);
    if (!side) {
      return;
    }

    const scaled = this.scaleNetworkPosition(player.x, player.y);
    const paddle = side === "left" ? this.leftPaddle : this.rightPaddle;
    paddle.x = scaled.x;

    if (sessionId === this.localSessionId) {
      this.serverLocalY = scaled.y;
      if (this.predictedLocalY === null) {
        this.predictedLocalY = scaled.y;
        paddle.y = scaled.y;
      }
    } else if (side === "left") {
      this.leftTargetY = scaled.y;
    } else {
      this.rightTargetY = scaled.y;
    }

    if (side === "left") {
      this.leftScoreText.setText(`${player.score}`);
    } else {
      this.rightScoreText.setText(`${player.score}`);
    }
  }

  scaleNetworkPosition(x, y) {
    return {
      x: x * this.netScaleX,
      y: y * this.netScaleY,
    };
  }

  getInputDirectionValue() {
    if (this.touchingUp) {
      return -1;
    }
    if (this.touchingDown) {
      return 1;
    }
    if (this.cursors) {
      if (this.cursors.up.isDown) {
        return -1;
      }
      if (this.cursors.down.isDown) {
        return 1;
      }
    }
    return 0;
  }

  getInputDirectionLabel(directionValue) {
    if (directionValue === -1) {
      return "UP";
    }
    if (directionValue === 1) {
      return "DOWN";
    }
    return "STOP";
  }

  sendNetworkInput(directionLabel) {
    if (!this.networkReady || !networkManager.isConnected()) {
      return;
    }
    if (directionLabel !== this.lastSentDirection) {
      networkManager.sendInput(directionLabel);
      this.lastSentDirection = directionLabel;
    }
  }

  updateLocal() {
    const { width, height } = this.cameras.main;
    const ballRadius = this.ball.displayWidth * 0.5;

    const playerDirection = this.getInputDirectionValue();
    this.leftPaddle.setVelocityY(playerDirection * this.paddleSpeed);

    const aiThreshold = this.rightPaddle.displayHeight * 0.15;
    const distanceToBall = this.ball.y - this.rightPaddle.y;
    if (Math.abs(distanceToBall) > aiThreshold) {
      const aiDirection = distanceToBall > 0 ? 1 : -1;
      this.rightPaddle.setVelocityY(aiDirection * this.aiSpeed);
    } else {
      this.rightPaddle.setVelocityY(0);
    }

    if (this.ball.x < -ballRadius) {
      this.rightScoreValue += 1;
      this.rightScoreText.setText(`${this.rightScoreValue}`);
      this.resetBall(1);
    } else if (this.ball.x > width + ballRadius) {
      this.leftScoreValue += 1;
      this.leftScoreText.setText(`${this.leftScoreValue}`);
      this.resetBall(-1);
    }
  }

  updateNetworked(delta) {
    const { height } = this.cameras.main;
    const playerDirection = this.getInputDirectionValue();
    const directionLabel = this.getInputDirectionLabel(playerDirection);
    this.sendNetworkInput(directionLabel);

    if (this.localSide) {
      const localPaddle =
        this.localSide === "left" ? this.leftPaddle : this.rightPaddle;
      const halfHeight = localPaddle.displayHeight * 0.5;
      const step = NETWORK_PADDLE_SPEED * (delta / (1000 / 60));
      const nextY = Phaser.Math.Clamp(
        (this.predictedLocalY ?? localPaddle.y) + playerDirection * step,
        halfHeight,
        height - halfHeight
      );

      this.predictedLocalY = nextY;

      if (
        this.serverLocalY !== null &&
        Math.abs(this.predictedLocalY - this.serverLocalY) >
          RECONCILIATION_THRESHOLD
      ) {
        this.predictedLocalY = this.serverLocalY;
      }

      localPaddle.y = this.predictedLocalY;
    }

    if (this.leftTargetY !== null && this.localSide !== "left") {
      this.leftPaddle.y = Phaser.Math.Linear(
        this.leftPaddle.y,
        this.leftTargetY,
        NETWORK_PADDLE_LERP
      );
    }
    if (this.rightTargetY !== null && this.localSide !== "right") {
      this.rightPaddle.y = Phaser.Math.Linear(
        this.rightPaddle.y,
        this.rightTargetY,
        NETWORK_PADDLE_LERP
      );
    }

    if (this.serverBallTarget) {
      this.ball.x = Phaser.Math.Linear(
        this.ball.x,
        this.serverBallTarget.x,
        NETWORK_BALL_LERP
      );
      this.ball.y = Phaser.Math.Linear(
        this.ball.y,
        this.serverBallTarget.y,
        NETWORK_BALL_LERP
      );
    }
  }

  update(_time, delta) {
    const { height } = this.cameras.main;
    this.gridBackground.tilePositionY -= height * 0.0015;

    if (this.networkMode) {
      this.updateNetworked(delta);
    } else {
      this.updateLocal();
    }
  }
}
