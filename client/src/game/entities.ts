import { PowerUpType } from "./types";

export class Player {
  public x: number;
  public y: number;
  public width: number = 30;
  public height: number = 30;
  public velocityX: number = 0;
  public velocityY: number = 0;
  public speed: number = 8;
  public jumpForce: number = -20;
  public hasShield: boolean = false;
  public hasJetpack: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  moveLeft() {
    this.velocityX = -this.speed;
  }

  moveRight() {
    this.velocityX = this.speed;
  }

  stop() {
    this.velocityX = 0;
  }

  jump() {
    if (this.hasJetpack) {
      this.velocityY = this.jumpForce * 1.5;
    } else {
      this.velocityY = this.jumpForce;
    }
  }
}

export class Platform {
  constructor(
    public x: number,
    public y: number,
    public width: number = 80,
    public height: number = 15
  ) {}
}

export class PowerUp {
  public width: number = 20;
  public height: number = 20;

  constructor(
    public x: number,
    public y: number,
    public type: PowerUpType,
    public duration: number = 15000 // 15 seconds
  ) {}
}

export class Monster {
  public width: number = 30;
  public height: number = 30;
  public speed: number = 2;
  public direction: number = 1; // 1 for right, -1 for left

  constructor(
    public x: number,
    public y: number,
    public platformWidth: number,
    public platformX: number
  ) {}

  move() {
    this.x += this.speed * this.direction;

    // Change direction when reaching platform edges
    if (
      this.x <= this.platformX ||
      this.x + this.width >= this.platformX + this.platformWidth
    ) {
      this.direction *= -1;
    }
  }
}