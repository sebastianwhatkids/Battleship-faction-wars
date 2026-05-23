import type { FC } from 'react';
import { useGameStore } from './store/useGameStore';
import MainMenu from './components/MainMenu';
import FactionSelect from './components/FactionSelect';
import ShipPlacement from './components/ShipPlacement';
import BattleScreen from './components/BattleScreen';
import GameResult from './components/GameResult';

const App: FC = () => {
  const { phase } = useGameStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      {phase === 'menu' && <MainMenu />}
      {phase === 'faction_select' && <FactionSelect />}
      {phase === 'placement' && <ShipPlacement />}
      {phase === 'battle' && <BattleScreen />}
      {phase === 'result' && <GameResult />}
    </div>
  );
};

export default App;
