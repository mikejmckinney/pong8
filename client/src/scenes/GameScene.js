/**
 * GameScene - Main gameplay scene
 */

import Phaser from 'phaser';
import { COLORS } from '../main.js';
import Paddle from '../entities/Paddle.js';
import Ball from '../entities/Ball.js';
import { AudioManager } from '../audio/AudioManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Get audio manager from menu scene or create new one
        this.audioManager = data.audioManager || new AudioManager();
        if (!this.audioManager.isUnlocked) {
            this.audioManager.unlock();
        }
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Game state
        this.player1Score = 0;
        this.player2Score = 0;
        this.winScore = 11;
        this.isGameOver = false;
        this.isPaused = false;
        this.isSinglePlayer = true;
        this.aiDifficulty = 0.75;

        // Draw game elements
        this.drawBackground();
        this.drawCenterLine();
        
        // Create paddles
        this.player1 = new Paddle(this, 40, height / 2, true);
        this.player2 = new Paddle(this, width - 40, height / 2, false);
        
        // Create ball
        this.ball = new Ball(this, width / 2, height / 2);

        // Set up physics collisions
        this.physics.add.collider(this.ball, this.player1, this.onBallPaddleCollision, null, this);
        this.physics.add.collider(this.ball, this.player2, this.onBallPaddleCollision, null, this);

        // World bounds collision callback
        this.physics.world.on('worldbounds', this.onWorldBounds, this);

        // Create UI
        this.createUI();

        // Set up input
        this.setupInput();

        // Start the game after a short delay
        this.time.delayedCall(1000, () => {
            this.startRound();
        });
    }

    drawBackground() {
        const graphics = this.add.graphics();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Draw grid lines
        graphics.lineStyle(1, COLORS.GRID, 0.3);

        const gridSpacing = 40;
        for (let y = 0; y < height; y += gridSpacing) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }
        for (let x = 0; x < width; x += gridSpacing) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }

        graphics.strokePath();
    }

    drawCenterLine() {
        const graphics = this.add.graphics();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dashed center line
        graphics.lineStyle(3, COLORS.BALL, 0.5);
        
        const dashLength = 15;
        const gapLength = 10;
        let y = 0;
        
        while (y < height) {
            graphics.moveTo(width / 2, y);
            graphics.lineTo(width / 2, Math.min(y + dashLength, height));
            y += dashLength + gapLength;
        }

        graphics.strokePath();
    }

    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Player 1 score
        this.player1ScoreText = this.add.text(width * 0.25, 40, '0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '48px',
            fill: '#FF005C'
        });
        this.player1ScoreText.setOrigin(0.5, 0.5);
        this.player1ScoreText.setAlpha(0.8);

        // Player 2 score
        this.player2ScoreText = this.add.text(width * 0.75, 40, '0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '48px',
            fill: '#00C4FF'
        });
        this.player2ScoreText.setOrigin(0.5, 0.5);
        this.player2ScoreText.setAlpha(0.8);

        // Pause/Menu button (top right)
        this.pauseText = this.add.text(width - 20, 20, '⏸', {
            fontSize: '24px',
            fill: '#FFFFFF'
        });
        this.pauseText.setOrigin(1, 0);
        this.pauseText.setInteractive({ useHandCursor: true });
        this.pauseText.on('pointerdown', () => this.togglePause());

        // Game mode indicator
        this.modeText = this.add.text(width / 2, height - 20, 'SINGLE PLAYER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            fill: '#333333'
        });
        this.modeText.setOrigin(0.5, 1);
    }

    setupInput() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });

        // Touch input
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);

        // Track active touch for smooth control
        this.activeTouchId = null;

        // Pause key
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard.on('keydown-P', () => this.togglePause());
    }

    onPointerDown(pointer) {
        if (this.isGameOver) {
            this.restartGame();
            return;
        }

        const width = this.cameras.main.width;
        
        // Ignore pause button area
        if (pointer.x > width - 50 && pointer.y < 50) {
            return;
        }

        // Track the touch for movement
        this.activeTouchId = pointer.id;
        
        // Set paddle target based on touch position
        if (!this.isSinglePlayer || pointer.x < width / 2) {
            this.player1.setTargetY(pointer.y);
        }
    }

    onPointerMove(pointer) {
        if (this.isGameOver || this.isPaused) return;

        const width = this.cameras.main.width;
        
        // Move paddle based on touch position
        // In single player mode, only control left paddle
        if (!this.isSinglePlayer || pointer.x < width / 2) {
            this.player1.setTargetY(pointer.y);
        }
    }

    onPointerUp(pointer) {
        if (pointer.id === this.activeTouchId) {
            this.activeTouchId = null;
        }
    }

    startRound() {
        // Reset ball to center
        this.ball.reset();
        
        // Random delay before launch
        this.time.delayedCall(500, () => {
            // Launch towards the player who lost the last point
            // or random for first round
            const direction = Math.random() < 0.5 ? 1 : -1;
            this.ball.launch(direction);
        });
    }

    onBallPaddleCollision(ball, paddle) {
        // Apply angle change based on hit location
        ball.onPaddleHit(paddle);
        
        // Play sound
        this.audioManager.playPaddleHit();

        // Screen shake effect
        this.cameras.main.shake(50, 0.003);
    }

    onWorldBounds(body, up, down, left, right) {
        if (body.gameObject === this.ball) {
            if (up || down) {
                // Wall hit
                this.audioManager.playWallHit();
            }
            
            if (left) {
                // Player 2 scores
                this.scorePoint(2);
            } else if (right) {
                // Player 1 scores
                this.scorePoint(1);
            }
        }
    }

    scorePoint(player) {
        if (this.isGameOver) return;

        if (player === 1) {
            this.player1Score++;
            this.player1ScoreText.setText(this.player1Score.toString());
            
            // Flash effect
            this.tweens.add({
                targets: this.player1ScoreText,
                scale: { from: 1.5, to: 1 },
                alpha: { from: 1, to: 0.8 },
                duration: 300,
                ease: 'Back.out'
            });
        } else {
            this.player2Score++;
            this.player2ScoreText.setText(this.player2Score.toString());
            
            this.tweens.add({
                targets: this.player2ScoreText,
                scale: { from: 1.5, to: 1 },
                alpha: { from: 1, to: 0.8 },
                duration: 300,
                ease: 'Back.out'
            });
        }

        // Play score sound
        this.audioManager.playScore();

        // Check for win
        if (this.player1Score >= this.winScore || this.player2Score >= this.winScore) {
            this.gameOver(player);
        } else {
            // Start next round
            this.startRound();
        }
    }

    gameOver(winner) {
        this.isGameOver = true;
        this.ball.body.setVelocity(0, 0);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Play sound
        if ((winner === 1 && this.isSinglePlayer) || !this.isSinglePlayer) {
            this.audioManager.playWin();
        } else {
            this.audioManager.playLose();
        }

        // Winner text
        const winnerText = winner === 1 ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
        const winnerColor = winner === 1 ? '#FF005C' : '#00C4FF';
        
        this.gameOverText = this.add.text(width / 2, height / 2 - 30, winnerText, {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: winnerColor
        });
        this.gameOverText.setOrigin(0.5, 0.5);

        // Restart prompt
        this.restartText = this.add.text(width / 2, height / 2 + 30, 'TAP TO RESTART', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#FFFFFF'
        });
        this.restartText.setOrigin(0.5, 0.5);

        // Pulsing animation
        this.tweens.add({
            targets: this.restartText,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
    }

    restartGame() {
        // Clean up game over text
        if (this.gameOverText) {
            this.gameOverText.destroy();
            this.gameOverText = null;
        }
        if (this.restartText) {
            this.restartText.destroy();
            this.restartText = null;
        }

        // Reset scores
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1ScoreText.setText('0');
        this.player2ScoreText.setText('0');

        // Reset game state
        this.isGameOver = false;

        // Reset paddles to center
        this.player1.y = this.cameras.main.height / 2;
        this.player2.y = this.cameras.main.height / 2;
        this.player1.stop();
        this.player2.stop();

        // Play start sound
        this.audioManager.playStart();

        // Start new game
        this.startRound();
    }

    togglePause() {
        if (this.isGameOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.pauseText.setText('▶');
            
            // Show pause overlay
            this.pauseOverlay = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000,
                0.7
            );
            
            this.pausedText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'PAUSED',
                {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '32px',
                    fill: '#FFFFFF'
                }
            );
            this.pausedText.setOrigin(0.5, 0.5);
        } else {
            this.physics.resume();
            this.pauseText.setText('⏸');
            
            if (this.pauseOverlay) {
                this.pauseOverlay.destroy();
                this.pauseOverlay = null;
            }
            if (this.pausedText) {
                this.pausedText.destroy();
                this.pausedText = null;
            }
        }
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        // Update entities
        this.player1.update();
        this.player2.update();
        this.ball.update();

        // Handle keyboard input for Player 1
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player1.moveUp();
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player1.moveDown();
        } else if (this.activeTouchId !== null) {
            // Touch control - move towards target
            this.player1.moveTowardsTarget();
        } else {
            this.player1.stop();
        }

        // AI control for Player 2 in single player mode
        if (this.isSinglePlayer) {
            this.player2.updateAI(this.ball, this.aiDifficulty);
        }
    }
}
