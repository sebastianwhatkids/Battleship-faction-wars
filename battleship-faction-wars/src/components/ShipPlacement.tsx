import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { RotateCw, Shuffle, Play, ChevronLeft } from 'lucide-react';
import { SHIP_SIZES, isValidPlacement } from '../lib/gameLogic';
import { ShipType } from '../types/game';
import { cn } from '../lib/utils';
import { useState } from 'react';

const ShipPlacement: FC = () => {
  const { 
    humanGrid, 
    shipToPlaceIndex, 
    placementOrientation, 
    setPlacementOrientation,
    placeHumanShip,
    randomizeHumanShips,
    startGame,
    setPhase
  } = useGameStore();

  const shipTypes = Object.keys(SHIP_SIZES) as ShipType[];
  const isFinishedPlacing = shipToPlaceIndex >= shipTypes.length;
  const currentShipType = isFinishedPlacing ? null : shipTypes[shipToPlaceIndex];
  const currentShipSize = currentShipType ? SHIP_SIZES[currentShipType] : 0;

  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  const toggleOrientation = () => {
    setPlacementOrientation(placementOrientation === 'horizontal' ? 'vertical' : 'horizontal');
  };

  const handleCellClick = (x: number, y: number) => {
    if (isFinishedPlacing) return;
    placeHumanShip(x, y);
  };

  const isCellHovered = (x: number, y: number) => {
    if (!hoverPos || isFinishedPlacing) return false;
    if (placementOrientation === 'horizontal') {
      return y === hoverPos.y && x >= hoverPos.x && x < hoverPos.x + currentShipSize;
    } else {
      return x === hoverPos.x && y >= hoverPos.y && y < hoverPos.y + currentShipSize;
    }
  };

  const isValidHover = hoverPos ? isValidPlacement(humanGrid, hoverPos.x, hoverPos.y, currentShipSize, placementOrientation === 'horizontal') : false;

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between mb-8 pt-8">
        <button 
          onClick={() => setPhase('faction_select')}
          className="flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          Back
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">Fleet Deployment</h2>
        <p className="text-slate-400 h-6">
          {isFinishedPlacing ? "All ships deployed. Ready for battle!" : `Place your ${currentShipType} (${currentShipSize} cells)`}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
        {/* Grid */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-2xl relative">
          <div className="grid grid-cols-10 gap-1 bg-slate-800 p-1 rounded-lg">
            {humanGrid.map((row, y) => (
              row.map((cell, x) => {
                const hovered = isCellHovered(x, y);
                return (
                  <div
                    key={`${x}-${y}`}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-sm cursor-pointer transition-colors duration-200 relative",
                      cell.state === 'ship' ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" : "bg-slate-950 hover:bg-slate-800",
                      hovered && isValidHover && cell.state !== 'ship' && "bg-cyan-500/50",
                      hovered && !isValidHover && cell.state !== 'ship' && "bg-red-500/50"
                    )}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => setHoverPos({x, y})}
                    onMouseLeave={() => setHoverPos(null)}
                  >
                    {cell.state === 'ship' && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-cyan-400 rounded-sm opacity-50" 
                      />
                    )}
                  </div>
                )
              })
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6 w-full max-w-xs">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-slate-300 uppercase tracking-wider">Controls</h3>
            
            <div className="space-y-4">
              <button
                onClick={toggleOrientation}
                disabled={isFinishedPlacing}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                <RotateCw className="w-5 h-5" />
                Rotate Ship ({placementOrientation})
              </button>

              <button
                onClick={randomizeHumanShips}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors"
              >
                <Shuffle className="w-5 h-5" />
                Randomize Formation
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
             <h3 className="text-lg font-semibold mb-4 text-slate-300 uppercase tracking-wider">Fleet Status</h3>
             <div className="space-y-2">
               {shipTypes.map((type, idx) => (
                 <div key={type} className="flex justify-between items-center text-sm">
                   <span className={cn(
                     idx < shipToPlaceIndex ? "text-cyan-500" : "text-slate-500",
                     idx === shipToPlaceIndex && !isFinishedPlacing ? "text-white font-bold" : ""
                   )}>{type}</span>
                   <div className="flex gap-1">
                     {Array.from({ length: SHIP_SIZES[type] }).map((_, i) => (
                       <div key={i} className={cn(
                         "w-3 h-3 rounded-sm",
                         idx < shipToPlaceIndex ? "bg-cyan-500" : "bg-slate-700",
                         idx === shipToPlaceIndex && !isFinishedPlacing ? "bg-white animate-pulse" : ""
                       )} />
                     ))}
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <AnimatePresence>
            {isFinishedPlacing && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(8,145,178,0.4)]"
              >
                <Play className="w-6 h-6" />
                Engage
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ShipPlacement;
