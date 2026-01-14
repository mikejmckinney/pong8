/**
 * BootScene - Initial loading and asset preparation
 */

import Phaser from 'phaser';
import { COLORS } from '../main.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width * 0.25, height * 0.5 - 15, width * 0.5, 30);
        
        const loadingText = this.add.text(width / 2, height * 0.5 - 50, 'Loading...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            fill: '#FF005C'
        });
        loadingText.setOrigin(0.5, 0.5);

        // Progress bar update
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xFF005C, 1);
            progressBar.fillRect(width * 0.25 + 5, height * 0.5 - 10, (width * 0.5 - 10) * value, 20);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Since we're using procedural graphics, no assets to load
        // But we simulate a brief load for the experience
        for (let i = 0; i < 10; i++) {
            this.load.image(`dummy${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        }
    }

    create() {
        // Transition to Menu Scene after a brief delay
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}
