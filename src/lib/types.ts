export type Track = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  trackData: string;
  length: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export type Car = {
  id:string;
  name: string;
  imageUrl: string;
  imageHint: string;
  stats: {
    speed: number;
    handling: number;
    acceleration: number;
  };
};

export type GameState = 'track-selection' | 'car-selection' | 'race' | 'results';

export type TrackConditions = {
  newWeather: string;
  trackObstacles: string;
};

export type RaceResult = {
  position: number;
  name: string;
  time: string;
};
