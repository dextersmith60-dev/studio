'use client';

import Image from 'next/image';
import { useGame } from '@/hooks/use-game';
import { cars } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Gauge, Zap, Wind } from 'lucide-react';

export default function CarSelection() {
  const { selectedTrack, selectCar, backToTrackSelection } = useGame();

  return (
    <section>
      <div className="text-center mb-12">
        <Button variant="ghost" onClick={backToTrackSelection} className="absolute left-0 top-0 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tracks
        </Button>
        <h2 className="text-4xl font-headline font-bold tracking-tight">Select Your Ride</h2>
        <p className="text-muted-foreground mt-2 text-lg">You are racing on <span className="text-primary font-semibold">{selectedTrack?.name}</span>.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cars.map((car) => (
          <Card 
            key={car.id} 
            className="overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-2"
          >
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={car.imageUrl}
                  alt={car.name}
                  fill
                  className="object-cover"
                  data-ai-hint={car.imageHint}
                />
              </div>
              <CardTitle className="p-4 pb-0 text-2xl">
                {car.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2"><Gauge className="w-4 h-4 text-red-400" /> Speed</span>
                    <span>{car.stats.speed}/100</span>
                  </div>
                  <Progress value={car.stats.speed} className="h-2" indicatorClassName="bg-red-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2"><Wind className="w-4 h-4 text-accent" /> Handling</span>
                    <span>{car.stats.handling}/100</span>
                  </div>
                  <Progress value={car.stats.handling} className="h-2" indicatorClassName="bg-accent"/>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Acceleration</span>
                    <span>{car.stats.acceleration}/100</span>
                  </div>
                  <Progress value={car.stats.acceleration} className="h-2" indicatorClassName="bg-yellow-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <Button onClick={() => selectCar(car)} className="w-full" variant="default">
                Race with this Car <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
