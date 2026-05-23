import { Position, ShipType, Ship, BoardCell } from '../types/game';

export const GRID_SIZE = 10;

export const SHIP_SIZES: Record<ShipType, number> = {
  Carrier: 5,
  Battleship: 4,
  Cruiser: 3,
  Submarine: 3,
  Destroyer: 2,
};

export const createEmptyGrid = (): BoardCell[][] => {
  const grid: BoardCell[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: BoardCell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ x, y, state: 'empty' });
    }
    grid.push(row);
  }
  return grid;
};

export const isValidPlacement = (
  grid: BoardCell[][],
  x: number,
  y: number,
  size: number,
  isHorizontal: boolean
): boolean => {
  if (isHorizontal) {
    if (x + size > GRID_SIZE) return false;
    for (let i = 0; i < size; i++) {
      if (grid[y][x + i].state !== 'empty') return false;
    }
  } else {
    if (y + size > GRID_SIZE) return false;
    for (let i = 0; i < size; i++) {
      if (grid[y + i][x].state !== 'empty') return false;
    }
  }
  return true;
};

export const placeShip = (
  grid: BoardCell[][],
  ship: Ship
): BoardCell[][] => {
  const newGrid = grid.map(row => [...row]);
  ship.positions.forEach(pos => {
    newGrid[pos.y][pos.x] = { ...newGrid[pos.y][pos.x], state: 'ship', shipId: ship.id };
  });
  return newGrid;
};

export const generateRandomShips = (): Ship[] => {
  let grid = createEmptyGrid();
  const ships: Ship[] = [];
  
  Object.entries(SHIP_SIZES).forEach(([type, size], index) => {
    let placed = false;
    while (!placed) {
      const isHorizontal = Math.random() > 0.5;
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      
      if (isValidPlacement(grid, x, y, size, isHorizontal)) {
        const positions: Position[] = [];
        for (let i = 0; i < size; i++) {
          positions.push(
            isHorizontal ? { x: x + i, y } : { x, y: y + i }
          );
        }
        
        const ship: Ship = {
          id: `${type}-${index}`,
          type: type as ShipType,
          size,
          positions,
          hits: [],
          sunk: false
        };
        
        ships.push(ship);
        grid = placeShip(grid, ship);
        placed = true;
      }
    }
  });
  
  return ships;
};
