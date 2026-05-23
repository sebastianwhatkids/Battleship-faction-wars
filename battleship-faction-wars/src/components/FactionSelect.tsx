import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Rocket, Droplet, Cpu, ChevronLeft } from 'lucide-react';
import { Faction } from '../types/game';

interface FactionOption {
  id: Faction;
  name: string;
  description: string;
  ability: string;
  icon: FC<{className?: string}>;
  color: string;
  bgColor: string;
}

const FACTIONS: FactionOption[] = [
  {
    id: 'Galactic Empire',
    name: 'Galactic Empire',
    description: 'A highly disciplined space armada focusing on precise strikes.',
    ability: 'Empire Strikes First: Starts the game by instantly revealing a random enemy cell.',
    icon: Rocket,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30'
  },
  {
    id: 'Deep Sea Marauders',
    name: 'Deep Sea Marauders',
    description: 'Masters of the oceanic depths, hard to detect and relentless.',
    ability: 'Evasive Maneuvers: The first miss of the game does not end your turn.',
    icon: Droplet,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
  },
  {
    id: 'Tech Union',
    name: 'Tech Union',
    description: 'A coalition of advanced AI and cybernetic vessels.',
    ability: 'Sensor Sweep: (Passive) Higher accuracy predictions (Visual flavor).',
    icon: Cpu,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30'
  }
];

const FactionSelect: FC = () => {
  const { setFaction, startPlacement, setPhase } = useGameStore();

  const handleSelect = (faction: Faction) => {
    setFaction(faction);
    startPlacement();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-start mb-8 pt-8">
        <button 
          onClick={() => setPhase('menu')}
          className="flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          Back to Menu
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold uppercase tracking-widest text-white mb-4">Choose Your Faction</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Each faction has unique abilities that can turn the tide of battle. Choose wisely, commander.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {FACTIONS.map((faction, idx) => {
          const Icon = faction.icon;
          return (
            <motion.button
              key={faction.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(faction.id)}
              className={`flex flex-col items-center text-left p-8 rounded-2xl border transition-all ${faction.bgColor}`}
            >
              <div className={`p-4 rounded-full bg-slate-900 shadow-xl mb-6 ${faction.color}`}>
                <Icon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center w-full">{faction.name}</h3>
              <p className="text-slate-300 mb-6 flex-grow text-center">{faction.description}</p>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 w-full">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Special Ability</span>
                <span className="text-sm text-slate-300 font-medium">{faction.ability}</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  );
};

export default FactionSelect;
