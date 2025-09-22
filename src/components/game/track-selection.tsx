'use client';

import Image from 'next/image';
import { useGame } from '@/hooks/use-game';
import { tracks } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Flag } from 'lucide-react';

export default function TrackSelection() {
  const { selectTrack } = useGame();

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-headline font-bold tracking-tight">Choose Your Challenge</h2>
        <p className="text-muted-foreground mt-2 text-lg">Select a world-famous track to begin your race.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {tracks.map((track) => (
          <Card 
            key={track.id} 
            className="overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-2"
          >
            <CardHeader className="p-0">
              <div className="relative h-60 w-full">
                <Image
                  src={track.imageUrl}
                  alt={track.name}
                  fill
                  className="object-cover"
                  data-ai-hint={track.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <CardTitle className="absolute bottom-4 left-6 text-3xl text-white">
                  {track.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <CardDescription className="text-base">{track.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex flex-col items-start gap-6">
              <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-primary"/>
                  <span>{track.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary"/>
                  <Badge variant={track.difficulty === 'Hard' ? 'destructive' : track.difficulty === 'Medium' ? 'secondary' : 'default'} className="bg-opacity-50">
                    {track.difficulty}
                  </Badge>
                </div>
              </div>
              <Button onClick={() => selectTrack(track)} className="w-full" variant="outline">
                Select Track <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
