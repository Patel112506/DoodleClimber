export enum PowerUpType {
  SHIELD = 'shield',
  JETPACK = 'jetpack'
}

export interface PowerUpState {
  type: PowerUpType;
  endTime: number;
}
