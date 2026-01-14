/**
 * Paddle - Player paddle entity with physics and controls
 */

import Phaser from 'phaser';
import { COLORS } from '../main.js';

// AI Configuration Constants
const AI_MAX_ERROR_RANGE = 50;       // Maximum error in pixels at lowest difficulty
const AI_MOVEMENT_THRESHOLD = 15;    // Minimum distance to trigger movement
const AI_PREDICTION_FACTOR = 0.3;    // How far ahead to predict ball position
const AI_RETURN_SPEED_FACTOR = 0.3;  // Speed when returning to center
const AI_CENTER_TOLERANCE = 30;      // Distance from center before returning

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, isPlayer1 = true) {
        // Create a temporary texture for the paddle
        const textureKey = isPlayer1 ? 'paddle1' : 'paddle2';
        
        // Create paddle texture if it doesn't exist
        if (!scene.textures.exists(textureKey)) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            const color = isPlayer1 ? COLORS.PLAYER1 : COLORS.PLAYER2;
            
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, 0, 15, 80);
            
            graphics.generateTexture(textureKey, 15, 80);
            graphics.destroy();
        }

        super(scene, x, y, textureKey);
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Store reference to scene
        this.scene = scene;
        this.isPlayer1 = isPlayer1;
        
        // Physics settings
        this.body.setImmovable(true);
        this.body.setBounce(0);
        this.body.setCollideWorldBounds(true);
        
        // Movement settings
        this.paddleSpeed = 400;
        this.targetY = y;
        this.smoothing = 0.2;
        
        // Set depth for rendering order
        this.setDepth(1);
        
        // Add glow effect
        this.createGlow();
    }

    createGlow() {
        const color = this.isPlayer1 ? COLORS.PLAYER1 : COLORS.PLAYER2;
        const glowKey = this.isPlayer1 ? 'glow1' : 'glow2';
        
        if (!this.scene.textures.exists(glowKey)) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
            
            // Create glow effect with gradient
            for (let i = 20; i > 0; i--) {
                const alpha = 0.02 * (20 - i);
                graphics.fillStyle(color, alpha);
                graphics.fillRect(-i, -i, 15 + i * 2, 80 + i * 2);
            }
            
            graphics.generateTexture(glowKey, 55, 120);
            graphics.destroy();
        }
        
        this.glow = this.scene.add.sprite(this.x, this.y, glowKey);
        this.glow.setAlpha(0.6);
        this.glow.setDepth(0);
    }

    /**
     * Move paddle up
     */
    moveUp() {
        this.body.setVelocityY(-this.paddleSpeed);
    }

    /**
     * Move paddle down
     */
    moveDown() {
        this.body.setVelocityY(this.paddleSpeed);
    }

    /**
     * Stop paddle movement
     */
    stop() {
        this.body.setVelocityY(0);
    }

    /**
     * Set target Y position (for touch controls)
     * @param {number} y - Target Y position
     */
    setTargetY(y) {
        // Clamp to paddle boundaries
        const halfHeight = this.displayHeight / 2;
        const minY = halfHeight;
        const maxY = this.scene.cameras.main.height - halfHeight;
        this.targetY = Phaser.Math.Clamp(y, minY, maxY);
    }

    /**
     * Move toward target (smooth touch control)
     */
    moveTowardsTarget() {
        const diff = this.targetY - this.y;
        if (Math.abs(diff) > 2) {
            this.body.setVelocityY(diff * 10);
        } else {
            this.stop();
        }
    }

    /**
     * Update glow position
     */
    update() {
        if (this.glow) {
            this.glow.x = this.x;
            this.glow.y = this.y;
        }
    }

    /**
     * AI control for single player mode
     * @param {Phaser.GameObjects.Sprite} ball - The ball to track
     * @param {number} difficulty - AI difficulty (0-1)
     */
    updateAI(ball, difficulty = 0.7) {
        if (!ball) return;
        
        // Only react when ball is coming towards this paddle
        const ballComingTowards = this.isPlayer1 
            ? ball.body.velocity.x < 0 
            : ball.body.velocity.x > 0;
        
        if (ballComingTowards) {
            // Predict where ball will be
            const predictedY = ball.y + ball.body.velocity.y * AI_PREDICTION_FACTOR;
            const diff = predictedY - this.y;
            
            // Add some error based on difficulty (lower difficulty = more error)
            const error = (1 - difficulty) * Phaser.Math.Between(-AI_MAX_ERROR_RANGE, AI_MAX_ERROR_RANGE);
            const targetDiff = diff + error;
            
            // Move towards predicted position
            if (Math.abs(targetDiff) > AI_MOVEMENT_THRESHOLD) {
                if (targetDiff > 0) {
                    this.body.setVelocityY(this.paddleSpeed * difficulty);
                } else {
                    this.body.setVelocityY(-this.paddleSpeed * difficulty);
                }
            } else {
                this.stop();
            }
        } else {
            // Return to center when ball going away
            const centerY = this.scene.cameras.main.height / 2;
            const diff = centerY - this.y;
            if (Math.abs(diff) > AI_CENTER_TOLERANCE) {
                this.body.setVelocityY(diff > 0 ? this.paddleSpeed * AI_RETURN_SPEED_FACTOR : -this.paddleSpeed * AI_RETURN_SPEED_FACTOR);
            } else {
                this.stop();
            }
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.glow) {
            this.glow.destroy();
        }
        super.destroy();
    }
}
