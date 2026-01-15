import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.cameras.main;

    const title = this.add
      .text(width * 0.5, height * 0.38, "SYNTHPONG", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${Math.round(width * 0.08)}px`,
        color: "#FF005C",
        align: "center",
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#FF005C",
          blur: 20,
          fill: true,
        },
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(width * 0.5, height * 0.62, "TAP TO PLAY", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${Math.round(width * 0.03)}px`,
        color: "#00C4FF",
        align: "center",
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#00C4FF",
          blur: 12,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.input.once("pointerdown", () => {
      this.scene.start("GameScene");
    });

    this.input.keyboard?.once("keydown", () => {
      this.scene.start("GameScene");
    });
  }
}
