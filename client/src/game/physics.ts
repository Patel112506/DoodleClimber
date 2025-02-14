import { Player } from "./entities";

const GRAVITY = 0.5;
const TERMINAL_VELOCITY = 10;

export function applyPhysics(player: Player) {
  // Apply gravity
  player.velocityY = Math.min(player.velocityY + GRAVITY, TERMINAL_VELOCITY);
  
  // Update position
  player.x += player.velocityX;
  player.y += player.velocityY;
}
