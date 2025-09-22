'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast"
import { generateTrackConditions } from '@/ai/flows/generate-track-conditions';
import { raceAgainstAI } from '@/ai/flows/race-against-ai';
import { analyzeRacingStyle, AnalyzeRacingStyleOutput } from '@/ai/flows/analyze-racing-style';
import { cars } from '@/lib/data';
import { Loader2, ArrowLeft, Wand2, Flag, Wind, BrainCircuit, Gauge, Zap } from 'lucide-react';

const RACE_DURATION_SECONDS = 30; // 30 second race for demo

export default function RaceView() {
  const { selectedTrack, selectedCar, finishRace, backToTrackSelection, trackConditions, setTrackConditions } = useGame();
  const [raceState, setRaceState] = useState<'not-started' | 'in-progress' | 'finished'>('not-started');
  const [raceProgress, setRaceProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isConditionsLoading, setIsConditionsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [racingStyleDescription, setRacingStyleDescription] = useState("Aggressive and fast, brakes late into corners.");
  const [analyzedStyle, setAnalyzedStyle] = useState<AnalyzeRacingStyleOutput | null>(null);

  const { toast } = useToast();

  const handleRandomizeConditions = async () => {
    if (!selectedTrack) return;
    setIsConditionsLoading(true);
    try {
      const conditions = await generateTrackConditions({
        trackName: selectedTrack.name,
        currentWeather: 'Sunny',
      });
      setTrackConditions(conditions);
      toast({
        title: "Track Conditions Updated!",
        description: "New weather and obstacles have been generated.",
      });
    } catch (error) {
      console.error('Failed to generate track conditions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate new track conditions.",
      });
    } finally {
      setIsConditionsLoading(false);
    }
  };

  const handleAnalyzeStyle = async () => {
    setIsAnalyzing(true);
    try {
      const style = await analyzeRacingStyle({ racingStyleDescription });
      setAnalyzedStyle(style);
      toast({
        title: "Racing Style Analyzed!",
        description: "The AI has adapted to your style. The race will be more challenging now.",
      });
    } catch (error) {
      console.error('Failed to analyze racing style:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not analyze racing style.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleStartRace = async () => {
    if (!selectedTrack || !analyzedStyle) {
      toast({
        variant: "destructive",
        title: "Analyze First",
        description: "Please analyze your racing style before starting the race.",
      });
      return;
    };
    setRaceState('in-progress');
    try {
      const aiStrategies = await raceAgainstAI({
        trackData: selectedTrack.trackData,
        playerRacingStyle: analyzedStyle,
        difficultyLevel: selectedTrack.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      });
      console.log("AI Opponent Strategies:", aiStrategies);
    } catch(error) {
      console.error("Failed to get AI strategies", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get AI strategies. Starting race with default strategies.",
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((time % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = (time % 1000).toString().padStart(3, '0').slice(0, 2);
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  const endRace = useCallback(() => {
    if (!selectedCar) return;
    setRaceState('finished');
    const finalTime = currentTime;

    const playerResult = { position: 0, name: 'You', time: formatTime(finalTime) };
    const otherCars = cars.filter(c => c.id !== selectedCar.id).slice(0, 3);

    const results = [
      ...otherCars.map((car, i) => ({
        position: i + 2,
        name: car.name,
        time: formatTime(finalTime + Math.random() * 5000 + 1000 * (i + 1)),
      })),
      playerResult,
    ].sort((a,b) => a.time.localeCompare(b.time)).map((r, i) => ({...r, position: i + 1}));
    
    finishRace(results);
  }, [currentTime, selectedCar, finishRace]);
  
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (raceState === 'in-progress') {
      timerInterval = setInterval(() => {
        setCurrentTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(timerInterval);
  }, [raceState]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (raceState === 'in-progress') {
      progressInterval = setInterval(() => {
        setRaceProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            endRace();
            return 100;
          }
          return prev + (100 / (RACE_DURATION_SECONDS * 100));
        });
      }, 10);
    }
    return () => clearInterval(progressInterval);
  }, [raceState, endRace]);
  
   useEffect(() => {
    // Analyze default style on mount
    handleAnalyzeStyle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedTrack || !selectedCar) {
    return (
      <div className="text-center">
        <p>Track or car not selected. Please go back.</p>
        <Button onClick={backToTrackSelection} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <section>
       <Button variant="ghost" onClick={backToTrackSelection} className="absolute -top-12 left-0 text-muted-foreground" disabled={raceState === 'in-progress'}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Car Selection
        </Button>
      <div className="space-y-6">
        <Card className="overflow-hidden relative">
          <div className="relative h-[450px] w-full">
            <Image src={selectedTrack.imageUrl} alt={selectedTrack.name} fill className="object-cover" data-ai-hint={selectedTrack.imageHint} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
            <div className="absolute top-6 left-6">
              <h2 className="text-4xl font-bold text-white font-headline">{selectedTrack.name}</h2>
              <p className="text-white/80 max-w-lg">{selectedTrack.description}</p>
            </div>
            <div className="absolute bottom-6 w-full px-6 space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-white">
                    <span className="text-sm text-white/80">Race Time</span>
                    <p className="font-mono text-5xl font-bold">{formatTime(currentTime)}</p>
                </div>
                <div className="relative h-40 w-52 rounded-lg overflow-hidden border-2 border-primary/50 shadow-2xl shadow-primary/20">
                    <Image src={selectedCar.imageUrl} alt={selectedCar.name} fill className="object-cover" data-ai-hint={selectedCar.imageHint} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                     <p className="absolute bottom-2 left-3 text-lg font-semibold text-white">{selectedCar.name}</p>
                </div>
              </div>
              <div>
                <Progress value={raceProgress} className="w-full h-4" indicatorClassName="bg-primary" />
              </div>
            </div>
          </div>
        </Card>
           
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI & Race Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Textarea 
                   value={racingStyleDescription}
                   onChange={(e) => setRacingStyleDescription(e.target.value)}
                   placeholder="Describe your racing style..."
                   rows={2}
                   disabled={raceState !== 'not-started'}
                 />
                 <Button onClick={handleAnalyzeStyle} className="w-full" variant="secondary" disabled={raceState !== 'not-started' || isAnalyzing}>
                   {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                   Analyze Racing Style
                 </Button>
              </div>
              <Button onClick={handleRandomizeConditions} className="w-full" variant="outline" disabled={raceState !== 'not-started' || isConditionsLoading}>
                {isConditionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Randomize Conditions
              </Button>
              <Button onClick={handleStartRace} className="w-full" size="lg" disabled={raceState !== 'not-started' || !analyzedStyle}>
                <Flag className="mr-2 h-4 w-4" /> Start Race
              </Button>
            </CardContent>
          </Card>
           <Card>
              <CardHeader>
                <CardTitle>Car Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2"><Gauge className="w-4 h-4 text-red-400" /> Speed</span>
                      <span>{selectedCar.stats.speed}/100</span>
                    </div>
                    <Progress value={selectedCar.stats.speed} className="h-2" indicatorClassName="bg-red-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2"><Wind className="w-4 h-4 text-accent" /> Handling</span>
                      <span>{selectedCar.stats.handling}/100</span>
                    </div>
                    <Progress value={selectedCar.stats.handling} className="h-2" indicatorClassName="bg-accent"/>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Acceleration</span>
                      <span>{selectedCar.stats.acceleration}/100</span>
                    </div>
                    <Progress value={selectedCar.stats.acceleration} className="h-2" indicatorClassName="bg-yellow-400" />
                  </div>
              </CardContent>
            </Card>
          
          {trackConditions && (
            <Alert className="bg-card border-primary/50 fade-in md:col-span-1">
              <Wind className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Track Conditions Update</AlertTitle>
              <AlertDescription>
                <p><strong className="text-foreground">Weather:</strong> {trackConditions.newWeather}</p>
                <p><strong className="text-foreground">Obstacles:</strong> {trackConditions.trackObstacles}</p>
              </AlertDescription>
            </Alert>
          )}

        </div>
      </div>
    </section>
  );
}
