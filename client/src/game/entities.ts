import { PowerUpType, PlatformType } from "./types";

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

  jump(multiplier: number = 1) {
    if (this.hasJetpack) {
      this.velocityY = this.jumpForce * 1.5 * multiplier;
    } else {
      this.velocityY = this.jumpForce * multiplier;
    }
  }
}

export class Platform {
  public broken: boolean = false;
  public moveDirection: number = 1;
  public moveSpeed: number = 2;
  public bounceStrength: number = 1.5;

  constructor(
    public x: number,
    public y: number,
    public type: PlatformType = PlatformType.NORMAL,
    public width: number = 80,
    public height: number = 15
  ) {}

  update() {
    if (this.type === PlatformType.MOVING) {
      this.x += this.moveSpeed * this.moveDirection;
      // Change direction when reaching screen edges
      if (this.x <= 0 || this.x + this.width >= window.innerWidth) {
        this.moveDirection *= -1;
      }
    }
  }

  onCollision(player: Player) {
    switch (this.type) {
      case PlatformType.NORMAL:
        player.jump();
        break;
      case PlatformType.BREAKABLE:
        if (!this.broken) {
          player.jump();
          this.broken = true;
        }
        break;
      case PlatformType.BOUNCY:
        player.jump(this.bounceStrength);
        break;
      case PlatformType.MOVING:
        player.jump();
        break;
    }
  }

  isActive(): boolean {
    return this.type !== PlatformType.BREAKABLE || !this.broken;
  }
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