import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Anchor, Crosshair } from 'lucide-react';

const MainMenu: FC = () => {
  const { setPhase, humanGrid, aiGrid } = useGameStore();

  const hasSavedGame = humanGrid.some(row => row.some(cell => cell.state !== 'empty')) 
                    || aiGrid.some(row => row.some(cell => cell.state !== 'empty'));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-6">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-2xl"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <Anchor className="w-12 h-12 text-cyan-500 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">
            BATTLESHIP
          </h1>
          <Crosshair className="w-12 h-12 text-blue-500 animate-[spin_4s_linear_infinite]" />
        </div>
        
        <p className="text-xl text-slate-400 mb-12 tracking-wide font-light uppercase">
          Faction Wars
        </p>

        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('faction_select')}
            className="w-full py-4 px-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(8,145,178,0.4)]"
          >
            New Game
          </motion.button>
          
          {hasSavedGame && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const store = useGameStore.getState();
                if (store.humanShips.length < 5) {
                   setPhase('placement');
                } else if (store.gameResult) {
                   setPhase('result');
                } else {
                   setPhase('battle');
                }
              }}
              className="w-full py-4 px-8 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xl uppercase tracking-widest transition-colors border border-slate-700"
            >
              Continue Game
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MainMenu;
