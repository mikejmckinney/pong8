/**
 * Pong8 - Main Entry Point
 * Mobile-optimized retro Pong game with Synthwave aesthetic
 */

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

// Synthwave Color Palette
export const COLORS = {
    BACKGROUND: 0x090D40,    // Deep Blue
    PLAYER1: 0xFF005C,       // Neon Pink
    PLAYER2: 0x00C4FF,       // Cyber Cyan
    BALL: 0xFFFFFF,          // White
    GRID: 0x2b2b2b,          // Grid Lines
    TEXT: 0xFFFFFF,          // Text
    ACCENT: 0x8c1eff         // Electric Purple
};

// Game Configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: COLORS.BACKGROUND,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 480
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene],
    input: {
        activePointers: 3
    },
    render: {
        pixelArt: false,
        antialias: true
    }
};

// Initialize Game
const game = new Phaser.Game(config);

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        game.scene.scenes.forEach(scene => {
            if (scene.scene.isActive()) {
                scene.scene.pause();
            }
        });
    } else {
        game.scene.scenes.forEach(scene => {
            if (scene.scene.isPaused()) {
                scene.scene.resume();
            }
        });
    }
});

export default game;
