export enum PowerUpType {
  SHIELD = 'shield',
  JETPACK = 'jetpack'
}

export enum PlatformType {
  NORMAL = 'normal',
  BREAKABLE = 'breakable',
  MOVING = 'moving',
  BOUNCY = 'bouncy'
}

export interface PowerUpState {
  type: PowerUpType;
  endTime: number;
}

export interface PlatformState {
  broken: boolean;
  bounceStrength: number;
  moveDirection: number;
  moveSpeed: number;
}