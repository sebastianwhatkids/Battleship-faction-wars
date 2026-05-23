import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Faction, GamePhase, Player, BoardCell, Ship, AIState, GameResult, Position, ShipType
} from '../types/game';
import { createEmptyGrid, generateRandomShips, placeShip, SHIP_SIZES, isValidPlacement } from '../lib/gameLogic';

interface GameState {
  phase: GamePhase;
  faction: Faction | null;
  
  humanGrid: BoardCell[][];
  humanShips: Ship[];
  
  aiGrid: BoardCell[][];
  aiShips: Ship[];
  
  currentTurn: Player;
  turnCount: number;
  
  humanStats: { hits: number; totalShots: number };
  aiStats: { hits: number; totalShots: number };
  
  aiState: AIState;
  gameResult: GameResult | null;
  
  isAiThinking: boolean;
  
  // Faction Tracking
  usedDeepSeaAbility: boolean;
  
  // Placement State

  shipToPlaceIndex: number;
  placementOrientation: 'horizontal' | 'vertical';

  // Actions
  setPhase: (phase: GamePhase) => void;
  setFaction: (faction: Faction) => void;
  startPlacement: () => void;
  placeHumanShip: (x: number, y: number) => boolean;
  setPlacementOrientation: (orientation: 'horizontal' | 'vertical') => void;
  randomizeHumanShips: () => void;
  startGame: () => void;
  humanAttack: (x: number, y: number) => void;
  aiAttack: () => void;
  resetGame: () => void;
}

const initialAIState: AIState = {
  initialHit: null,
  lastHit: null,
  huntDirection: null,
  possibleDirections: [],
  hitsQueue: [],
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'menu',
      faction: null,
      
      humanGrid: createEmptyGrid(),
      humanShips: [],
      
      aiGrid: createEmptyGrid(),
      aiShips: [],
      
      currentTurn: 'human',
      turnCount: 0,
      
      humanStats: { hits: 0, totalShots: 0 },
      aiStats: { hits: 0, totalShots: 0 },
      
      aiState: { ...initialAIState },
      gameResult: null,
      
      isAiThinking: false,
      usedDeepSeaAbility: false,
      
      shipToPlaceIndex: 0,
      placementOrientation: 'horizontal',

      setPhase: (phase) => set({ phase }),
      setFaction: (faction) => set({ faction }),
      
      startPlacement: () => set({ 
        phase: 'placement', 
        humanGrid: createEmptyGrid(), 
        humanShips: [],
        shipToPlaceIndex: 0,
        placementOrientation: 'horizontal'
      }),
      
      setPlacementOrientation: (orientation) => set({ placementOrientation: orientation }),
      
      placeHumanShip: (x, y) => {
        const state = get();
        const shipTypes = Object.keys(SHIP_SIZES) as ShipType[];
        if (state.shipToPlaceIndex >= shipTypes.length) return false;
        
        const type = shipTypes[state.shipToPlaceIndex];
        const size = SHIP_SIZES[type];
        const isHorizontal = state.placementOrientation === 'horizontal';
        
        if (!isValidPlacement(state.humanGrid, x, y, size, isHorizontal)) {
          return false;
        }
        
        const positions: Position[] = [];
        for (let i = 0; i < size; i++) {
          positions.push(
            isHorizontal ? { x: x + i, y } : { x, y: y + i }
          );
        }
        
        const ship: Ship = {
          id: `human-${type}`,
          type,
          size,
          positions,
          hits: [],
          sunk: false
        };
        
        const newShips = [...state.humanShips, ship];
        const newGrid = placeShip(state.humanGrid, ship);
        
        set({
          humanShips: newShips,
          humanGrid: newGrid,
          shipToPlaceIndex: state.shipToPlaceIndex + 1
        });
        
        return true;
      },
      
      randomizeHumanShips: () => {
        const ships = generateRandomShips();
        let grid = createEmptyGrid();
        ships.forEach(s => { grid = placeShip(grid, s) });
        const shipTypes = Object.keys(SHIP_SIZES);
        
        set({
          humanShips: ships,
          humanGrid: grid,
          shipToPlaceIndex: shipTypes.length
        });
      },
      
      startGame: () => {
        const aiShips = generateRandomShips();
        let aiGrid = createEmptyGrid();
        aiShips.forEach(s => { aiGrid = placeShip(aiGrid, s) });
        
        // Faction abilities could alter initial state here
        const state = get();
        let finalAiGrid = aiGrid;
        let finalAiShips = aiShips;

        if (state.faction === 'Galactic Empire') {
           const randomAiShip = finalAiShips[Math.floor(Math.random() * finalAiShips.length)];
           const randomPos = randomAiShip.positions[Math.floor(Math.random() * randomAiShip.positions.length)];
           
           // Reveal it as a hit instantly!
           finalAiGrid[randomPos.y][randomPos.x] = { ...finalAiGrid[randomPos.y][randomPos.x], state: 'hit' };
           finalAiShips = finalAiShips.map(ship => {
             if (ship.id === randomAiShip.id) {
               const newHits = [...ship.hits, { x: randomPos.x, y: randomPos.y }];
               return { ...ship, hits: newHits, sunk: newHits.length === ship.size };
             }
             return ship;
           });
        }
        
        set({
          phase: 'battle',
          aiShips: finalAiShips,
          aiGrid: finalAiGrid,
          currentTurn: 'human',
          turnCount: 1,
          humanStats: { hits: 0, totalShots: 0 },
          aiStats: { hits: 0, totalShots: 0 },
          aiState: { ...initialAIState },
          gameResult: null,
          isAiThinking: false,
          usedDeepSeaAbility: false
        });
      },
      
      humanAttack: (x, y) => {
        const state = get();
        if (state.currentTurn !== 'human' || state.phase !== 'battle' || state.isAiThinking) return;
        
        const targetCell = state.aiGrid[y][x];
        if (targetCell.state === 'hit' || targetCell.state === 'miss') return; // Already attacked
        
        let isHit = false;
        let aiShips = [...state.aiShips];
        
        if (targetCell.state === 'ship' && targetCell.shipId) {
          isHit = true;
          aiShips = aiShips.map(ship => {
            if (ship.id === targetCell.shipId) {
              const newHits = [...ship.hits, { x, y }];
              return { ...ship, hits: newHits, sunk: newHits.length === ship.size };
            }
            return ship;
          });
        }
        
        const newAiGrid = state.aiGrid.map(row => [...row]);
        newAiGrid[y][x] = { ...targetCell, state: isHit ? 'hit' : 'miss' };
        
        const allAiSunk = aiShips.every(s => s.sunk);
        
        // Faction abilities:
        // Deep Sea Marauders: First miss of the game does not end turn
        let nextTurn: Player = 'ai';
        let newUsedDeepSea = state.usedDeepSeaAbility;
        if (!isHit && state.faction === 'Deep Sea Marauders' && !state.usedDeepSeaAbility) {
          nextTurn = 'human';
          newUsedDeepSea = true;
        }
        
        // Tech Union ability could be handled in UI (reveal adjacent)
        
        set({
          aiGrid: newAiGrid,
          aiShips,
          humanStats: { 
            hits: state.humanStats.hits + (isHit ? 1 : 0), 
            totalShots: state.humanStats.totalShots + 1 
          },
          currentTurn: allAiSunk ? 'human' : nextTurn,
          usedDeepSeaAbility: newUsedDeepSea
        });
        
        if (allAiSunk) {
          set({
            phase: 'result',
            gameResult: {
              winner: 'human',
              totalTurns: state.turnCount,
              humanAccuracy: ((state.humanStats.hits + (isHit ? 1 : 0)) / (state.humanStats.totalShots + 1)) * 100,
              aiAccuracy: state.aiStats.totalShots > 0 ? (state.aiStats.hits / state.aiStats.totalShots) * 100 : 0,
              humanShipsRemaining: state.humanShips.filter(s => !s.sunk).length,
              aiShipsRemaining: 0
            }
          });
        } else if (nextTurn === 'ai') {
          set({ isAiThinking: true });
          setTimeout(() => {
            get().aiAttack();
          }, 1000); // 1 second AI delay
        }
      },
      
      aiAttack: () => {
        const state = get();
        if (state.phase !== 'battle') return;
        
        let x = 0, y = 0;
        let validAttack = false;
        let aiSt = { ...state.aiState };
        
        // Smart Hunting Logic
        // Very simplified: Random if no initialHit. If initialHit, pick adjacent.
        while (!validAttack) {
          if (aiSt.initialHit && !state.humanShips.find(s => s.hits.find(h => h.x === aiSt.initialHit?.x && h.y === aiSt.initialHit?.y))?.sunk) {
            // Target around initialHit
            if (aiSt.possibleDirections.length === 0) {
              aiSt.possibleDirections = [
                {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
              ].sort(() => Math.random() - 0.5);
            }
            
            if (!aiSt.huntDirection) {
              aiSt.huntDirection = aiSt.possibleDirections.pop() || null;
            }
            
            if (aiSt.huntDirection) {
              const lastGoodHit = aiSt.lastHit || aiSt.initialHit;
              x = lastGoodHit.x + aiSt.huntDirection.x;
              y = lastGoodHit.y + aiSt.huntDirection.y;
              
              if (x >= 0 && x < 10 && y >= 0 && y < 10 && state.humanGrid[y][x].state !== 'hit' && state.humanGrid[y][x].state !== 'miss') {
                validAttack = true;
              } else {
                // Direction invalid (wall or already hit/missed), change direction
                aiSt.huntDirection = null;
                aiSt.lastHit = aiSt.initialHit;
              }
            } else {
              // Should not happen, fallback to random
              x = Math.floor(Math.random() * 10);
              y = Math.floor(Math.random() * 10);
              if (state.humanGrid[y][x].state !== 'hit' && state.humanGrid[y][x].state !== 'miss') validAttack = true;
            }
          } else {
            // Random hunting
            aiSt = { ...initialAIState };
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            if (state.humanGrid[y][x].state !== 'hit' && state.humanGrid[y][x].state !== 'miss') validAttack = true;
          }
        }
        
        const targetCell = state.humanGrid[y][x];
        let isHit = false;
        let humanShips = [...state.humanShips];
        let sunkShip = false;
        
        if (targetCell.state === 'ship' && targetCell.shipId) {
          isHit = true;
          humanShips = humanShips.map(ship => {
            if (ship.id === targetCell.shipId) {
              const newHits = [...ship.hits, { x, y }];
              if (newHits.length === ship.size) sunkShip = true;
              return { ...ship, hits: newHits, sunk: newHits.length === ship.size };
            }
            return ship;
          });
        }
        
        const newHumanGrid = state.humanGrid.map(row => [...row]);
        newHumanGrid[y][x] = { ...targetCell, state: isHit ? 'hit' : 'miss' };
        
        // Update AI hunting state
        if (isHit) {
          if (!aiSt.initialHit) {
            aiSt.initialHit = { x, y };
            aiSt.lastHit = { x, y };
          } else {
            aiSt.lastHit = { x, y };
          }
        } else {
          if (aiSt.initialHit && aiSt.huntDirection) {
            // Missed while hunting, reset to initialHit to try another direction
            aiSt.huntDirection = null;
            aiSt.lastHit = aiSt.initialHit;
          }
        }
        
        if (sunkShip) {
          aiSt = { ...initialAIState }; // Reset hunting
        }
        
        const allHumanSunk = humanShips.every(s => s.sunk);
        
        set({
          humanGrid: newHumanGrid,
          humanShips,
          aiState: aiSt,
          aiStats: { 
            hits: state.aiStats.hits + (isHit ? 1 : 0), 
            totalShots: state.aiStats.totalShots + 1 
          },
          currentTurn: 'human',
          turnCount: state.turnCount + 1,
          isAiThinking: false
        });
        
        if (allHumanSunk) {
          set({
            phase: 'result',
            gameResult: {
              winner: 'ai',
              totalTurns: state.turnCount + 1,
              humanAccuracy: state.humanStats.totalShots > 0 ? (state.humanStats.hits / state.humanStats.totalShots) * 100 : 0,
              aiAccuracy: ((state.aiStats.hits + (isHit ? 1 : 0)) / (state.aiStats.totalShots + 1)) * 100,
              humanShipsRemaining: 0,
              aiShipsRemaining: state.aiShips.filter(s => !s.sunk).length
            }
          });
        }
      },
      
      resetGame: () => set({
        phase: 'menu',
        faction: null,
        humanGrid: createEmptyGrid(),
        humanShips: [],
        aiGrid: createEmptyGrid(),
        aiShips: [],
        currentTurn: 'human',
        turnCount: 0,
        humanStats: { hits: 0, totalShots: 0 },
        aiStats: { hits: 0, totalShots: 0 },
        aiState: { ...initialAIState },
        gameResult: null,
        isAiThinking: false,
        usedDeepSeaAbility: false,
        shipToPlaceIndex: 0,
        placementOrientation: 'horizontal'
      })
    }),
    {
      name: 'battleship-storage',
    }
  )
);
