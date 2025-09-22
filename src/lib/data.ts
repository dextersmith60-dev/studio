import type { Track, Car } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    return {
      imageUrl: "https://picsum.photos/seed/placeholder/600/400",
      imageHint: "placeholder image",
    };
  }
  return { imageUrl: image.imageUrl, imageHint: image.imageHint };
};

export const tracks: Track[] = [
  {
    id: 'track1',
    name: 'Monaco Grand Prix',
    description: 'A narrow and twisty street circuit that demands ultimate precision.',
    trackData: 'Circuit de Monaco, tight corners, short straights, iconic tunnel section.',
    length: '3.34 km',
    difficulty: 'Hard',
    ...findImage('track1'),
  },
  {
    id: 'track2',
    name: 'Silverstone Circuit',
    description: 'A high-speed track with legendary corners like Maggotts and Becketts.',
    trackData: 'Silverstone, UK. Fast sweeping corners, long straights, changeable weather.',
    length: '5.89 km',
    difficulty: 'Medium',
    ...findImage('track2'),
  },
  {
    id: 'track3',
    name: 'Suzuka International',
    description: 'A unique figure-eight layout with a challenging series of "S" curves.',
    trackData: 'Suzuka, Japan. Figure-eight layout, high-speed esses, Dunlop curve.',
    length: '5.81 km',
    difficulty: 'Hard',
    ...findImage('track3'),
  },
  {
    id: 'track4',
    name: 'Daytona Speedway',
    description: 'Experience pure speed on this iconic American oval.',
    trackData: 'Daytona International Speedway. High-banked oval, focus on drafting and top speed.',
    length: '4.02 km',
    difficulty: 'Easy',
    ...findImage('track4'),
  },
];

export const cars: Car[] = [
  {
    id: 'car1',
    name: 'Crimson Comet',
    stats: { speed: 85, handling: 95, acceleration: 90 },
    ...findImage('car1'),
  },
  {
    id: 'car2',
    name: 'Azure Flash',
    stats: { speed: 95, handling: 80, acceleration: 88 },
    ...findImage('car2'),
  },
  {
    id: 'car3',
    name: 'Obsidian Shadow',
    stats: { speed: 92, handling: 88, acceleration: 92 },
    ...findImage('car3'),
  },
  {
    id: 'car4',
    name: 'Emerald Ghost',
    stats: { speed: 88, handling: 92, acceleration: 98 },
    ...findImage('car4'),
  },
];
