'use client';

import { useGame } from '@/hooks/use-game';
import Header from '@/components/game/header';
import TrackSelection from '@/components/game/track-selection';
import CarSelection from '@/components/game/car-selection';
import RaceView from '@/components/game/race-view';
import RaceResults from '@/components/game/race-results';

export default function Game() {
  const { gameState } = useGame();

  const renderGameState = () => {
    switch (gameState) {
      case 'track-selection':
        return <TrackSelection />;
      case 'car-selection':
        return <CarSelection />;
      case 'race':
        return <RaceView />;
      case 'results':
        return <RaceResults />;
      default:
        return <TrackSelection />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="relative fade-in">
          {renderGameState()}
        </div>
      </main>
    </div>
  );
}
