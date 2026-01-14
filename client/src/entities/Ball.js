/**
 * Ball - Game ball entity with physics and trail effects
 */

import Phaser from 'phaser';
import { COLORS } from '../main.js';

export default class Ball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create ball texture if it doesn't exist
        if (!scene.textures.exists('ball')) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            
            // Draw white ball
            graphics.fillStyle(COLORS.BALL, 1);
            graphics.fillCircle(8, 8, 8);
            
            graphics.generateTexture('ball', 16, 16);
            graphics.destroy();
        }

        super(scene, x, y, 'ball');
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Store scene reference
        this.scene = scene;
        
        // Ball settings
        this.baseSpeed = 350;
        this.maxSpeed = 600;
        this.speedIncrement = 20;
        this.currentSpeed = this.baseSpeed;
        
        // Physics settings
        this.body.setCircle(8);
        this.body.setBounce(1, 1);
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;
        
        // Set depth
        this.setDepth(2);
        
        // Last hit color (for trail)
        this.lastHitColor = COLORS.BALL;
        
        // Create trail effect
        this.createTrail();
    }

    createTrail() {
        // Create glow texture for trail
        if (!this.scene.textures.exists('ballGlow')) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
            
            // Create soft glow
            for (let i = 12; i > 0; i--) {
                const alpha = 0.1 * (12 - i) / 12;
                graphics.fillStyle(0xFFFFFF, alpha);
                graphics.fillCircle(12, 12, i);
            }
            
            graphics.generateTexture('ballGlow', 24, 24);
            graphics.destroy();
        }

        // Trail using pre-allocated sprites (circular buffer for performance)
        this.trailMaxLength = 8;
        this.trailSprites = new Array(this.trailMaxLength);
        this.trailIndex = 0;
        this.trailUpdateCounter = 0;
        
        // Pre-allocate trail sprites
        for (let i = 0; i < this.trailMaxLength; i++) {
            const sprite = this.scene.add.sprite(0, 0, 'ballGlow');
            sprite.setVisible(false);
            sprite.setDepth(1);
            this.trailSprites[i] = sprite;
        }
    }

    /**
     * Launch the ball in a random direction
     * @param {number} direction - 1 for right, -1 for left
     */
    launch(direction = 1) {
        this.currentSpeed = this.baseSpeed;
        
        // Random angle between -45 and 45 degrees
        const angle = Phaser.Math.Between(-45, 45);
        const radians = Phaser.Math.DegToRad(angle);
        
        const vx = Math.cos(radians) * this.currentSpeed * direction;
        const vy = Math.sin(radians) * this.currentSpeed;
        
        this.body.setVelocity(vx, vy);
    }

    /**
     * Reset ball to center
     */
    reset() {
        this.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
        this.body.setVelocity(0, 0);
        this.currentSpeed = this.baseSpeed;
        this.lastHitColor = COLORS.BALL;
        
        // Hide all trail sprites
        for (let i = 0; i < this.trailMaxLength; i++) {
            if (this.trailSprites[i]) {
                this.trailSprites[i].setVisible(false);
            }
        }
        this.trailIndex = 0;
    }

    /**
     * Handle paddle collision
     * @param {Paddle} paddle - The paddle that was hit
     */
    onPaddleHit(paddle) {
        // Increase speed
        this.currentSpeed = Math.min(this.currentSpeed + this.speedIncrement, this.maxSpeed);
        
        // Calculate new angle based on where ball hit paddle
        const relativeIntersect = (paddle.y - this.y) / (paddle.displayHeight / 2);
        const bounceAngle = relativeIntersect * 60; // Max 60 degrees
        
        // Direction based on which side of screen paddle is on
        const direction = paddle.x < this.scene.cameras.main.width / 2 ? 1 : -1;
        
        const radians = Phaser.Math.DegToRad(-bounceAngle);
        const vx = Math.cos(radians) * this.currentSpeed * direction;
        const vy = Math.sin(radians) * this.currentSpeed;
        
        this.body.setVelocity(vx, vy);
        
        // Update trail color based on which paddle was hit
        this.lastHitColor = paddle.isPlayer1 ? COLORS.PLAYER1 : COLORS.PLAYER2;
    }

    /**
     * Update trail effect using circular buffer for performance
     */
    update() {
        this.trailUpdateCounter++;
        
        // Only update trail every few frames for performance
        if (this.trailUpdateCounter % 2 === 0 && (this.body.velocity.x !== 0 || this.body.velocity.y !== 0)) {
            // Reuse sprite from circular buffer (no allocation/deallocation)
            const trailSprite = this.trailSprites[this.trailIndex];
            trailSprite.setPosition(this.x, this.y);
            trailSprite.setTint(this.lastHitColor);
            trailSprite.setVisible(true);
            
            // Move to next position in circular buffer
            this.trailIndex = (this.trailIndex + 1) % this.trailMaxLength;
            
            // Update trail visual properties based on age
            for (let i = 0; i < this.trailMaxLength; i++) {
                const sprite = this.trailSprites[i];
                if (sprite.visible) {
                    // Calculate age based on distance from current index
                    const age = (this.trailIndex - i + this.trailMaxLength) % this.trailMaxLength;
                    const normalizedAge = age / this.trailMaxLength;
                    
                    // Older sprites are more faded and smaller
                    sprite.setAlpha(0.4 * (1 - normalizedAge));
                    sprite.setScale(1 - normalizedAge * 0.5);
                }
            }
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        for (let i = 0; i < this.trailMaxLength; i++) {
            if (this.trailSprites[i]) {
                this.trailSprites[i].destroy();
            }
        }
        this.trailSprites = [];
        super.destroy();
    }
}
