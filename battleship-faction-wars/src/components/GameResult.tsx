import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react';
import { cn } from '../lib/utils';

const GameResult: FC = () => {
  const { gameResult, resetGame, setPhase } = useGameStore();

  if (!gameResult) return null;

  const isVictory = gameResult.winner === 'human';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background FX */}
      <div className={cn(
        "absolute inset-0 opacity-20 pointer-events-none",
        isVictory ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-slate-950 to-black" 
                  : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-slate-950 to-black"
      )} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl z-10 w-full max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          {isVictory ? (
            <div className="p-6 bg-cyan-500/10 rounded-full border-2 border-cyan-500/30">
              <Trophy className="w-20 h-20 text-cyan-400" />
            </div>
          ) : (
            <div className="p-6 bg-red-500/10 rounded-full border-2 border-red-500/30">
              <Skull className="w-20 h-20 text-red-500" />
            </div>
          )}
        </motion.div>

        <h1 className={cn(
          "text-5xl md:text-6xl font-black uppercase tracking-widest mb-2",
          isVictory ? "text-cyan-400" : "text-red-500"
        )}>
          {isVictory ? "Victory" : "Defeat"}
        </h1>
        
        <p className="text-slate-400 text-lg mb-8 uppercase tracking-wider">
          {isVictory ? "The enemy fleet has been decimated." : "Your fleet was destroyed."}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Total Turns</div>
            <div className="text-2xl font-mono text-white">{gameResult.totalTurns}</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Remaining Ships</div>
            <div className="text-2xl font-mono text-white">
              {isVictory ? gameResult.humanShipsRemaining : gameResult.aiShipsRemaining}
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Your Accuracy</div>
            <div className="text-2xl font-mono text-cyan-400">{gameResult.humanAccuracy.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Enemy Accuracy</div>
            <div className="text-2xl font-mono text-red-400">{gameResult.aiAccuracy.toFixed(1)}%</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setPhase('faction_select')}
            className="flex items-center justify-center py-4 px-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-lg uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </button>
          
          <button
            onClick={() => {
              resetGame();
            }}
            className="flex items-center justify-center py-4 px-8 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg uppercase tracking-widest transition-colors border border-slate-700"
          >
            <Home className="w-5 h-5 mr-2" />
            Main Menu
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default GameResult;
