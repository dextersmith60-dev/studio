'use client';

import { GameProvider } from '@/hooks/use-game';
import Game from '@/components/game/game';


export default function Home() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
