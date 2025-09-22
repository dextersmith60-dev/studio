'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Track, Car, GameState, TrackConditions, RaceResult } from '@/lib/types';

interface GameContextType {
  gameState: GameState;
  selectedTrack: Track | null;
  selectedCar: Car | null;
  trackConditions: TrackConditions | null;
  raceResults: RaceResult[] | null;
  selectTrack: (track: Track) => void;
  selectCar: (car: Car) => void;
  finishRace: (results: RaceResult[]) => void;
  setTrackConditions: (conditions: TrackConditions) => void;
  resetGame: () => void;
  backToTrackSelection: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>('track-selection');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [trackConditions, setTrackConditions] = useState<TrackConditions | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResult[] | null>(null);

  const selectTrack = useCallback((track: Track) => {
    setSelectedTrack(track);
    setGameState('car-selection');
  }, []);

  const selectCar = useCallback((car: Car) => {
    setSelectedCar(car);
    setGameState('race');
  }, []);

  const finishRace = useCallback((results: RaceResult[]) => {
    setRaceResults(results);
    setGameState('results');
  }, []);
  
  const setTrackConditionsCb = useCallback((conditions: TrackConditions) => {
    setTrackConditions(conditions);
  }, []);

  const resetGame = useCallback(() => {
    setGameState('track-selection');
    setSelectedTrack(null);
    setSelectedCar(null);
    setTrackConditions(null);
    setRaceResults(null);
  }, []);

  const backToTrackSelection = useCallback(() => {
    setSelectedTrack(null);
    setSelectedCar(null);
    setGameState('track-selection');
  }, []);

  const value = {
    gameState,
    selectedTrack,
    selectedCar,
    trackConditions,
    raceResults,
    selectTrack,
    selectCar,
    finishRace,
    setTrackConditions: setTrackConditionsCb,
    resetGame,
    backToTrackSelection,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
