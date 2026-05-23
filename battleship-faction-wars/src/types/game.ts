export type Faction = 'Galactic Empire' | 'Deep Sea Marauders' | 'Tech Union';

export type ShipType = 'Carrier' | 'Battleship' | 'Cruiser' | 'Submarine' | 'Destroyer';

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  id: string;
  type: ShipType;
  size: number;
  positions: Position[];
  hits: Position[];
  sunk: boolean;
}

export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export interface BoardCell {
  x: number;
  y: number;
  state: CellState;
  shipId?: string;
}

export type GamePhase = 'menu' | 'faction_select' | 'placement' | 'battle' | 'result';

export type Player = 'human' | 'ai';

export interface AIState {
  initialHit: Position | null;
  lastHit: Position | null;
  huntDirection: Position | null;
  possibleDirections: Position[];
  hitsQueue: Position[]; // For complex ships that might be adjacent
}

export interface GameResult {
  winner: Player | null;
  totalTurns: number;
  humanAccuracy: number;
  aiAccuracy: number;
  humanShipsRemaining: number;
  aiShipsRemaining: number;
}
