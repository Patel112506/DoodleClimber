import { Player } from "./entities";

const GRAVITY = 0.25; // Reduced from 0.4 for floatier jumps
const TERMINAL_VELOCITY = 12;

export function applyPhysics(player: Player) {
  // Apply gravity
  player.velocityY = Math.min(player.velocityY + GRAVITY, TERMINAL_VELOCITY);

  // Update position
  player.x += player.velocityX;
  player.y += player.velocityY;
}