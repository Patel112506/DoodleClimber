import { PowerUpType, PlatformType, PlatformState } from "./types";

export class Player {
  public x: number;
  public y: number;
  public width: number = 30;
  public height: number = 30;
  public velocityX: number = 0;
  public velocityY: number = 0;
  public speed: number = 8;
  public jumpForce: number = -18;
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

  jump(multiplier: number = 1) {
    if (this.hasJetpack) {
      this.velocityY = this.jumpForce * 1.5 * multiplier;
    } else {
      this.velocityY = this.jumpForce * multiplier;
    }
  }
}

export class Platform {
  public type: PlatformType;
  public state: PlatformState;

  constructor(
    public x: number,
    public y: number,
    public width: number = 80,
    public height: number = 15,
    platformType?: PlatformType
  ) {
    this.type = platformType || PlatformType.NORMAL;
    this.state = {
      broken: false,
      bounceStrength: this.type === PlatformType.BOUNCY ? 1.5 : 1,
      moveDirection: Math.random() < 0.5 ? -1 : 1,
      moveSpeed: this.type === PlatformType.MOVING ? 2 : 0
    };
  }

  update() {
    if (this.type === PlatformType.MOVING && !this.state.broken) {
      this.x += this.state.moveSpeed * this.state.moveDirection;

      // Reverse direction at screen edges
      if (this.x <= 0 || this.x + this.width >= window.innerWidth) {
        this.state.moveDirection *= -1;
      }
    }
  }
}

export class PowerUp {
  public width: number = 20;
  public height: number = 20;

  constructor(
    public x: number,
    public y: number,
    public type: PowerUpType,
    public duration: number = 15000
  ) {}
}

export class Monster {
  public width: number = 30;
  public height: number = 30;
  public speed: number = 2;
  public direction: number = 1;

  constructor(
    public x: number,
    public y: number,
    public platformWidth: number,
    public platformX: number
  ) {}

  move() {
    this.x += this.speed * this.direction;

    if (
      this.x <= this.platformX ||
      this.x + this.width >= this.platformX + this.platformWidth
    ) {
      this.direction *= -1;
    }
  }
}