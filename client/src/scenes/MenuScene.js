/**
 * MenuScene - Main menu with title and start button
 */

import Phaser from 'phaser';
import { COLORS } from '../main.js';
import { AudioManager } from '../audio/AudioManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Initialize audio manager
        this.audioManager = new AudioManager();

        // Draw perspective grid background
        this.drawGrid();

        // Title
        this.titleText = this.add.text(width * 0.5, height * 0.25, 'PONG8', {
            fontFamily: '"Press Start 2P"',
            fontSize: '48px',
            fill: '#FF005C',
            stroke: '#00C4FF',
            strokeThickness: 2
        });
        this.titleText.setOrigin(0.5, 0.5);
        
        // Add glow effect to title
        this.titleText.setShadow(0, 0, '#FF005C', 15, true, true);

        // Subtitle
        this.subtitleText = this.add.text(width * 0.5, height * 0.38, 'RETRO ARCADE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#00C4FF'
        });
        this.subtitleText.setOrigin(0.5, 0.5);

        // Start prompt
        this.startText = this.add.text(width * 0.5, height * 0.65, 'TAP TO START', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            fill: '#FFFFFF'
        });
        this.startText.setOrigin(0.5, 0.5);

        // Pulsing animation for start text
        this.tweens.add({
            targets: this.startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Controls info
        const isMobile = !this.sys.game.device.os.desktop;
        const controlsText = isMobile 
            ? 'TAP LEFT/RIGHT TO MOVE'
            : 'USE ARROW KEYS OR W/S';
        
        this.controlsText = this.add.text(width * 0.5, height * 0.8, controlsText, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            fill: '#666666'
        });
        this.controlsText.setOrigin(0.5, 0.5);

        // Credits
        this.creditsText = this.add.text(width * 0.5, height * 0.92, 'BUILT WITH PHASER 3', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            fill: '#333333'
        });
        this.creditsText.setOrigin(0.5, 0.5);

        // Input handling
        this.input.on('pointerdown', this.startGame, this);
        this.input.keyboard.on('keydown-SPACE', this.startGame, this);
        this.input.keyboard.on('keydown-ENTER', this.startGame, this);
    }

    drawGrid() {
        const graphics = this.add.graphics();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        graphics.lineStyle(1, COLORS.GRID, 0.3);

        // Horizontal grid lines
        const gridSpacing = 30;
        for (let y = 0; y < height; y += gridSpacing) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }

        // Vertical grid lines
        for (let x = 0; x < width; x += gridSpacing) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }

        graphics.strokePath();
    }

    startGame() {
        // Play start sound and unlock audio
        this.audioManager.unlock();
        this.audioManager.playStart();

        // Flash effect
        this.cameras.main.flash(200, 255, 0, 92);
        
        this.time.delayedCall(200, () => {
            this.scene.start('GameScene', { audioManager: this.audioManager });
        });
    }
}
