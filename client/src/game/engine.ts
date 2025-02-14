import { Player, Platform, PowerUp, Monster } from "./entities";
import { PowerUpType, PowerUpState, PlatformType } from "./types";
import { applyPhysics } from "./physics";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private platforms: Platform[];
  private monsters: Monster[];
  private powerUps: PowerUp[];
  private activePowerUps: PowerUpState[];
  private score: number;
  private animationFrame: number;
  private platformCount: number;
  private onGameOver: (score: number) => void;

  constructor(canvas: HTMLCanvasElement, onGameOver: (score: number) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.score = 0;
    this.onGameOver = onGameOver;
    this.platforms = [];
    this.monsters = [];
    this.powerUps = [];
    this.activePowerUps = [];
    this.animationFrame = 0;
    this.platformCount = Math.floor(this.canvas.height / 80);
    this.player = new Player(canvas.width / 2, canvas.height - 100);
    this.initializePlatforms();
  }

  private initializePlatforms() {
    this.platforms = [];
    this.monsters = [];
    this.powerUps = [];

    // Add starting platform under the player
    const startPlatform = new Platform(
      this.canvas.width / 2 - 40,
      this.canvas.height - 30,
      80,
      15,
      PlatformType.NORMAL
    );
    this.platforms.push(startPlatform);

    // Add rest of the platforms
    for (let i = 1; i < this.platformCount; i++) {
      const platformX = Math.random() * (this.canvas.width - 80);
      const platformY = this.canvas.height - (i * 80) - Math.random() * 20;

      // Randomly select platform type
      const platformType = this.getRandomPlatformType();
      const platform = new Platform(platformX, platformY, 80, 15, platformType);
      this.platforms.push(platform);

      // 20% chance to spawn a monster on normal platforms
      if (Math.random() < 0.2 && platformType === PlatformType.NORMAL) {
        this.monsters.push(
          new Monster(platformX, platformY - 30, platform.width, platformX)
        );
      }

      // 10% chance to spawn a power-up
      if (Math.random() < 0.1) {
        const powerUpType =
          Math.random() < 0.5 ? PowerUpType.SHIELD : PowerUpType.JETPACK;
        this.powerUps.push(
          new PowerUp(platformX + platform.width / 2, platformY - 30, powerUpType)
        );
      }
    }
  }

  private getRandomPlatformType(): PlatformType {
    const rand = Math.random();
    if (rand < 0.6) return PlatformType.NORMAL;
    if (rand < 0.75) return PlatformType.BREAKABLE;
    if (rand < 0.9) return PlatformType.MOVING;
    return PlatformType.BOUNCY;
  }

  public handleInput(action: "left" | "right" | "stop") {
    switch (action) {
      case "left":
        this.player.moveLeft();
        break;
      case "right":
        this.player.moveRight();
        break;
      case "stop":
        this.player.stop();
        break;
    }
  }

  public handleResize() {
    this.platformCount = Math.floor(this.canvas.height / 80);
    this.player.x = Math.min(this.player.x, this.canvas.width - this.player.width);
    this.initializePlatforms();
  }

  private checkCollision(rect1: any, rect2: any): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  private update() {
    // Update power-up states
    const currentTime = Date.now();
    this.activePowerUps = this.activePowerUps.filter((powerUp) => {
      if (powerUp.endTime <= currentTime) {
        if (powerUp.type === PowerUpType.SHIELD) this.player.hasShield = false;
        if (powerUp.type === PowerUpType.JETPACK) this.player.hasJetpack = false;
        return false;
      }
      return true;
    });

    applyPhysics(this.player);

    // Update platform positions and states
    this.platforms.forEach(platform => platform.update());

    // Move monsters
    this.monsters.forEach((monster) => monster.move());

    // Move platforms down when player goes up
    if (this.player.y < this.canvas.height / 2) {
      const diff = this.canvas.height / 2 - this.player.y;
      this.player.y = this.canvas.height / 2;
      this.score += Math.floor(diff * 0.1);

      this.platforms.forEach((platform) => {
        platform.y += diff;
      });

      this.monsters.forEach((monster) => {
        monster.y += diff;
      });

      this.powerUps.forEach((powerUp) => {
        powerUp.y += diff;
      });

      // Remove off-screen objects
      this.platforms = this.platforms.filter((p) => p.y <= this.canvas.height);
      this.monsters = this.monsters.filter((m) => m.y <= this.canvas.height);
      this.powerUps = this.powerUps.filter((p) => p.y <= this.canvas.height);

      // Add new platforms at the top
      while (this.platforms.length < this.platformCount) {
        const platformX = Math.random() * (this.canvas.width - 80);
        const platformType = this.getRandomPlatformType();
        const platform = new Platform(platformX, 0, 80, 15, platformType);
        this.platforms.push(platform);

        if (Math.random() < 0.2 && platformType === PlatformType.NORMAL) {
          this.monsters.push(new Monster(platformX, -30, platform.width, platformX));
        }

        if (Math.random() < 0.1) {
          const powerUpType =
            Math.random() < 0.5 ? PowerUpType.SHIELD : PowerUpType.JETPACK;
          this.powerUps.push(
            new PowerUp(platformX + platform.width / 2, -30, powerUpType)
          );
        }
      }
    }

    // Check collisions with platforms
    let hasCollided = false;
    this.platforms.forEach((platform) => {
      if (
        this.player.velocityY > 0 &&
        this.checkCollision(this.player, platform) &&
        this.player.y < platform.y + platform.height / 2 &&
        !platform.state.broken
      ) {
        // Handle different platform types
        switch (platform.type) {
          case PlatformType.BREAKABLE:
            platform.state.broken = true;
            this.player.jump();
            break;
          case PlatformType.BOUNCY:
            this.player.jump(platform.state.bounceStrength);
            break;
          default:
            this.player.jump();
            break;
        }
        hasCollided = true;
      }
    });

    // Check collisions with monsters
    for (const monster of this.monsters) {
      if (this.checkCollision(this.player, monster) && !this.player.hasShield) {
        this.stop();
        this.onGameOver(this.score);
        return;
      }
    }

    // Check collisions with power-ups
    this.powerUps = this.powerUps.filter((powerUp) => {
      if (this.checkCollision(this.player, powerUp)) {
        const endTime = Date.now() + powerUp.duration;
        this.activePowerUps.push({ type: powerUp.type, endTime });

        if (powerUp.type === PowerUpType.SHIELD) this.player.hasShield = true;
        if (powerUp.type === PowerUpType.JETPACK) this.player.hasJetpack = true;

        return false;
      }
      return true;
    });

    // Wrap player around screen
    if (this.player.x + this.player.width < 0) {
      this.player.x = this.canvas.width;
    } else if (this.player.x > this.canvas.width) {
      this.player.x = -this.player.width;
    }

    // Check for game over with threshold
    const fallThreshold = this.canvas.height + 100; // Give some extra space below
    if (this.player.y > fallThreshold) {
      this.stop();
      this.onGameOver(this.score);
    }
  }

  private render() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms with different colors based on type
    this.platforms.forEach((platform) => {
      if (platform.state.broken) return; // Don't draw broken platforms

      switch (platform.type) {
        case PlatformType.NORMAL:
          this.ctx.fillStyle = "#4CAF50";
          break;
        case PlatformType.BREAKABLE:
          this.ctx.fillStyle = "#FF9800";
          break;
        case PlatformType.MOVING:
          this.ctx.fillStyle = "#2196F3";
          break;
        case PlatformType.BOUNCY:
          this.ctx.fillStyle = "#E91E63";
          break;
      }
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw monsters
    this.ctx.fillStyle = "#FF4444";
    this.monsters.forEach((monster) => {
      this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
    });

    // Draw power-ups
    this.powerUps.forEach((powerUp) => {
      this.ctx.fillStyle = powerUp.type === PowerUpType.SHIELD ? "#FFD700" : "#4169E1";
      this.ctx.beginPath();
      this.ctx.arc(
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2,
        powerUp.width / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });

    // Draw player with power-up effects
    this.ctx.fillStyle = this.player.hasShield ? "#FFD700" : "#2196F3";
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    // Draw jetpack effect
    if (this.player.hasJetpack) {
      this.ctx.fillStyle = "#FFA500";
      this.ctx.fillRect(
        this.player.x + this.player.width / 4,
        this.player.y + this.player.height,
        this.player.width / 2,
        10
      );
    }
  }

  private gameLoop = () => {
    this.update();
    this.render();
    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    if (!this.animationFrame) {
      this.score = 0;
      this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
      this.initializePlatforms();
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
    this.activePowerUps = [];
  }
}