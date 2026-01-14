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

        // Trail particles using simple sprites
        this.trailSprites = [];
        this.trailMaxLength = 8;
        this.trailUpdateCounter = 0;
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
        
        // Clear trail
        this.trailSprites.forEach(sprite => sprite.destroy());
        this.trailSprites = [];
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
     * Update trail effect
     */
    update() {
        this.trailUpdateCounter++;
        
        // Only update trail every few frames for performance
        if (this.trailUpdateCounter % 2 === 0 && (this.body.velocity.x !== 0 || this.body.velocity.y !== 0)) {
            // Add new trail position
            const trailSprite = this.scene.add.sprite(this.x, this.y, 'ballGlow');
            trailSprite.setTint(this.lastHitColor);
            trailSprite.setAlpha(0.4);
            trailSprite.setDepth(1);
            
            this.trailSprites.push(trailSprite);
            
            // Limit trail length
            while (this.trailSprites.length > this.trailMaxLength) {
                const oldSprite = this.trailSprites.shift();
                oldSprite.destroy();
            }
            
            // Fade out trail
            this.trailSprites.forEach((sprite, index) => {
                const alpha = (index / this.trailSprites.length) * 0.4;
                sprite.setAlpha(alpha);
                const scale = 0.5 + (index / this.trailSprites.length) * 0.5;
                sprite.setScale(scale);
            });
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.trailSprites.forEach(sprite => sprite.destroy());
        this.trailSprites = [];
        super.destroy();
    }
}
