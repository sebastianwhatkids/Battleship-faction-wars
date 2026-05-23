import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { ShieldAlert, Crosshair, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { BoardCell, Player } from '../types/game';

const Cell: FC<{
  cell: BoardCell;
  isEnemy: boolean;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ cell, isEnemy, onClick, disabled }) => {
  const isHit = cell.state === 'hit';
  const isMiss = cell.state === 'miss';
  const isShip = cell.state === 'ship';

  return (
    <div
      onClick={!disabled && isEnemy && !isHit && !isMiss ? onClick : undefined}
      className={cn(
        "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-sm relative transition-all duration-300",
        isEnemy && !isHit && !isMiss ? "cursor-crosshair hover:bg-slate-700 bg-slate-900" : "bg-slate-900",
        !isEnemy && isShip && !isHit && "bg-cyan-600/50 shadow-[inset_0_0_10px_rgba(6,182,212,0.5)]",
        isMiss && "bg-slate-800",
        disabled && isEnemy && "cursor-not-allowed opacity-80"
      )}
    >
      {isMiss && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-slate-500" />
        </motion.div>
      )}
      {isHit && (
        <motion.div 
          initial={{ scale: 0, rotate: -45 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="absolute inset-0 bg-red-500/20 flex items-center justify-center border border-red-500 rounded-sm"
        >
          <Crosshair className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
        </motion.div>
      )}
    </div>
  );
};

const BattleScreen: FC = () => {
  const { 
    humanGrid, 
    aiGrid, 
    currentTurn, 
    humanAttack, 
    isAiThinking, 
    faction,
    humanShips,
    aiShips,
    setPhase
  } = useGameStore();

  const humanShipsAlive = humanShips.filter(s => !s.sunk).length;
  const aiShipsAlive = aiShips.filter(s => !s.sunk).length;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-7xl flex items-center justify-between mb-6">
        <button 
          onClick={() => setPhase('menu')}
          className="flex items-center text-slate-400 hover:text-white transition-colors p-2 bg-slate-900 rounded-lg border border-slate-800"
        >
          <Menu className="w-5 h-5 mr-2" />
          Menu
        </button>

        <div className="flex-1 flex justify-center items-center">
          <div className={cn(
            "px-6 py-2 rounded-full border text-lg font-bold uppercase tracking-widest transition-colors duration-500",
            currentTurn === 'human' 
              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
              : "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          )}>
            {currentTurn === 'human' ? "Your Turn" : "Enemy Turn"}
            {isAiThinking && <span className="ml-2 animate-pulse">...</span>}
          </div>
        </div>

        <div className="w-[100px]" /> {/* Spacer to balance flex */}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center w-full max-w-7xl mt-4">
        
        {/* Player Grid */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-3 px-1">
            <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-wider flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              {faction} Fleet
            </h3>
            <span className="text-slate-400 text-sm font-mono mt-1">
              Alive: <span className="text-cyan-400 font-bold text-lg">{humanShipsAlive}</span>/5
            </span>
          </div>
          
          <div className="bg-slate-900 p-3 rounded-xl border-2 border-cyan-900/50 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative">
            <div className="grid grid-cols-10 gap-1 bg-slate-800 p-1 rounded-lg">
              {humanGrid.map((row, y) => (
                row.map((cell, x) => (
                  <Cell key={`h-${x}-${y}`} cell={cell} isEnemy={false} />
                ))
              ))}
            </div>
            {/* Overlay when it's enemy turn */}
            {currentTurn === 'ai' && (
              <div className="absolute inset-0 bg-red-900/10 pointer-events-none rounded-xl" />
            )}
          </div>
        </div>

        {/* Divider / Info */}
        <div className="flex flex-col items-center justify-center hidden lg:flex">
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
          <div className="py-4 text-slate-500 font-mono text-sm tracking-widest">VS</div>
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
        </div>

        {/* Enemy Grid */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-3 px-1">
            <h3 className="text-xl font-bold text-red-400 uppercase tracking-wider flex items-center">
              <Crosshair className="w-5 h-5 mr-2" />
              Enemy Fleet
            </h3>
            <span className="text-slate-400 text-sm font-mono mt-1">
              Alive: <span className="text-red-400 font-bold text-lg">{aiShipsAlive}</span>/5
            </span>
          </div>

          <div className={cn(
            "bg-slate-900 p-3 rounded-xl border-2 shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-colors duration-300",
            currentTurn === 'human' ? "border-red-900/80 hover:border-red-500/50" : "border-slate-800"
          )}>
            <div className="grid grid-cols-10 gap-1 bg-slate-800 p-1 rounded-lg">
              {aiGrid.map((row, y) => (
                row.map((cell, x) => (
                  <Cell 
                    key={`a-${x}-${y}`} 
                    cell={cell} 
                    isEnemy={true} 
                    onClick={() => humanAttack(x, y)}
                    disabled={currentTurn !== 'human'}
                  />
                ))
              ))}
            </div>
          </div>
        </div>

      </div>
      
      {/* Logs/Status could go here */}
      <div className="mt-12 bg-slate-900 p-4 rounded-lg border border-slate-800 max-w-2xl w-full text-center">
        <p className="text-slate-400">
          {currentTurn === 'human' 
            ? "Select a coordinate on the Enemy Fleet grid to fire." 
            : "Enemy is calculating strike coordinates..."}
        </p>
      </div>

    </div>
  );
};

export default BattleScreen;
