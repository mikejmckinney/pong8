import Phaser from "phaser";

export class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, baseSpeed) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseSpeed = baseSpeed;
    this.currentSpeed = baseSpeed;

    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
  }

  reset(x, y) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.currentSpeed = this.baseSpeed;
  }

  launch(direction) {
    const angle = Phaser.Math.FloatBetween(-0.35, 0.35);
    const velocityX = Math.cos(angle) * this.currentSpeed * direction;
    const velocityY = Math.sin(angle) * this.currentSpeed;
    this.setVelocity(velocityX, velocityY);
  }

  boost(multiplier, maxMultiplier) {
    const maxSpeed = this.baseSpeed * maxMultiplier;
    this.currentSpeed = Math.min(this.currentSpeed * multiplier, maxSpeed);
  }
}
