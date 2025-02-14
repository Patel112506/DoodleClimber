import { Player, Platform, PowerUp, Monster } from "./entities";
import { PowerUpType, PowerUpState } from "./types";
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

    // Initialize after canvas dimensions are set
    this.player = new Player(canvas.width / 2, canvas.height - 100);
    this.initializePlatforms();
  }

  private initializePlatforms() {
    const platformCount = Math.floor(this.canvas.height / 80);
    this.platforms = [];
    this.monsters = [];
    this.powerUps = [];

    // Add starting platform under the player
    this.platforms.push(
      new Platform(
        this.canvas.width / 2 - 40,
        this.canvas.height - 30,
        80,
        15
      )
    );

    // Add rest of the platforms with occasional monsters and power-ups
    for (let i = 1; i < platformCount; i++) {
      const platformX = Math.random() * (this.canvas.width - 80);
      const platformY = this.canvas.height - (i * 80) - Math.random() * 20;
      const platform = new Platform(platformX, platformY);
      this.platforms.push(platform);

      // 20% chance to spawn a monster on a platform
      if (Math.random() < 0.2) {
        this.monsters.push(new Monster(platformX, platformY - 30, platform.width, platformX));
      }

      // 10% chance to spawn a power-up
      if (Math.random() < 0.1) {
        const powerUpType = Math.random() < 0.5 ? PowerUpType.SHIELD : PowerUpType.JETPACK;
        this.powerUps.push(new PowerUp(
          platformX + platform.width / 2,
          platformY - 30,
          powerUpType
        ));
      }
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
    this.activePowerUps = this.activePowerUps.filter(powerUp => {
      if (powerUp.endTime <= currentTime) {
        if (powerUp.type === PowerUpType.SHIELD) this.player.hasShield = false;
        if (powerUp.type === PowerUpType.JETPACK) this.player.hasJetpack = false;
        return false;
      }
      return true;
    });

    applyPhysics(this.player);

    // Move monsters
    this.monsters.forEach(monster => monster.move());

    // Move platforms down when player goes up
    if (this.player.y < this.canvas.height / 2) {
      const diff = this.canvas.height / 2 - this.player.y;
      this.player.y = this.canvas.height / 2;
      this.score += Math.floor(diff * 0.1);

      this.platforms.forEach(platform => {
        platform.y += diff;
      });

      this.monsters.forEach(monster => {
        monster.y += diff;
      });

      this.powerUps.forEach(powerUp => {
        powerUp.y += diff;
      });

      // Remove and replace off-screen objects
      this.platforms = this.platforms.filter(p => p.y <= this.canvas.height);
      this.monsters = this.monsters.filter(m => m.y <= this.canvas.height);
      this.powerUps = this.powerUps.filter(p => p.y <= this.canvas.height);

      while (this.platforms.length < platformCount) {
        const platformX = Math.random() * (this.canvas.width - 80);
        const platform = new Platform(platformX, 0);
        this.platforms.push(platform);

        if (Math.random() < 0.2) {
          this.monsters.push(new Monster(platformX, -30, platform.width, platformX));
        }

        if (Math.random() < 0.1) {
          const powerUpType = Math.random() < 0.5 ? PowerUpType.SHIELD : PowerUpType.JETPACK;
          this.powerUps.push(new PowerUp(
            platformX + platform.width / 2,
            -30,
            powerUpType
          ));
        }
      }
    }

    // Check collisions with platforms
    this.platforms.forEach(platform => {
      if (this.player.velocityY > 0 &&
          this.checkCollision(this.player, platform)) {
        this.player.jump();
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
    this.powerUps = this.powerUps.filter(powerUp => {
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

    // Check for game over
    if (this.player.y > this.canvas.height) {
      this.stop();
      this.onGameOver(this.score);
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms
    this.ctx.fillStyle = "#4CAF50";
    this.platforms.forEach(platform => {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw monsters
    this.ctx.fillStyle = "#FF4444";
    this.monsters.forEach(monster => {
      this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
    });

    // Draw power-ups
    this.powerUps.forEach(powerUp => {
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
    this.activePowerUps = [];
  }
}