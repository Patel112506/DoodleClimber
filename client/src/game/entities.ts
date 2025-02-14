export class Player {
  public x: number;
  public y: number;
  public width: number = 30;
  public height: number = 30;
  public velocityX: number = 0;
  public velocityY: number = 0;
  public speed: number = 8; // Increased from 5
  public jumpForce: number = -20; // Increased from -15

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
    this.velocityY = this.jumpForce;
  }
}

export class Platform {
  constructor(
    public x: number,
    public y: number,
    public width: number = 80, // Increased from 60
    public height: number = 15  // Increased from 10
  ) {}
}