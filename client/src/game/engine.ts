import { Player, Platform } from "./entities";
import { applyPhysics } from "./physics";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private platforms: Platform[];
  private score: number;
  private animationFrame: number;
  private onGameOver: (score: number) => void;

  constructor(canvas: HTMLCanvasElement, onGameOver: (score: number) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.score = 0;
    this.onGameOver = onGameOver;
    this.platforms = [];
    this.animationFrame = 0;

    // Initialize after canvas dimensions are set
    this.player = new Player(canvas.width / 2, canvas.height - 100);
    this.initializePlatforms();
  }

  private initializePlatforms() {
    const platformCount = Math.floor(this.canvas.height / 80); // Adjusted spacing
    this.platforms = [];

    // Add starting platform under the player
    this.platforms.push(
      new Platform(
        this.canvas.width / 2 - 40,
        this.canvas.height - 30,
        80,
        15
      )
    );

    // Add rest of the platforms
    for (let i = 1; i < platformCount; i++) {
      this.platforms.push(
        new Platform(
          Math.random() * (this.canvas.width - 80),
          this.canvas.height - (i * 80) - Math.random() * 20
        )
      );
    }
  }

  public handleInput(action: 'left' | 'right' | 'stop') {
    switch (action) {
      case 'left':
        this.player.moveLeft();
        break;
      case 'right':
        this.player.moveRight();
        break;
      case 'stop':
        this.player.stop();
        break;
    }
  }

  public handleResize() {
    this.player.x = Math.min(this.player.x, this.canvas.width - this.player.width);
    this.platforms.forEach(platform => {
      platform.x = Math.min(platform.x, this.canvas.width - platform.width);
    });
  }

  private update() {
    applyPhysics(this.player);

    // Move platforms down when player goes up
    if (this.player.y < this.canvas.height / 2) {
      const diff = this.canvas.height / 2 - this.player.y;
      this.player.y = this.canvas.height / 2;
      this.score += Math.floor(diff * 0.1); // Adjusted scoring rate

      this.platforms.forEach(platform => {
        platform.y += diff;
        if (platform.y > this.canvas.height) {
          platform.y = 0;
          platform.x = Math.random() * (this.canvas.width - platform.width);
        }
      });
    }

    // Check collisions with platforms
    this.platforms.forEach(platform => {
      if (this.player.velocityY > 0 && 
          this.player.x + this.player.width > platform.x &&
          this.player.x < platform.x + platform.width &&
          this.player.y + this.player.height > platform.y &&
          this.player.y + this.player.height < platform.y + platform.height) {
        this.player.jump();
      }
    });

    // Check for game over
    if (this.player.y > this.canvas.height) {
      this.stop();
      this.onGameOver(this.score);
    }

    // Wrap player around screen
    if (this.player.x + this.player.width < 0) {
      this.player.x = this.canvas.width;
    } else if (this.player.x > this.canvas.width) {
      this.player.x = -this.player.width;
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms
    this.ctx.fillStyle = "#4CAF50";
    this.platforms.forEach(platform => {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    this.ctx.fillStyle = "#2196F3";
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );
  }

  private gameLoop = () => {
    this.update();
    this.render();
    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    if (!this.animationFrame) {
      // Reset player position on start
      this.player.y = this.canvas.height - 100;
      this.player.velocityY = 0;
      this.gameLoop();
    }
  }

  public stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  public reset() {
    this.score = 0;
    this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
    this.initializePlatforms();
  }
}