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
import { Loader2, ArrowLeft, Wand2, Flag, Wind, BrainCircuit, Gauge, Zap, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const RACE_DURATION_SECONDS = 30; // 30 second race for demo
const BOOSTS_PER_RACE = 3;

export default function RaceView() {
  const { selectedTrack, selectedCar, finishRace, backToCarSelection, trackConditions, setTrackConditions } = useGame();
  const [raceState, setRaceState] = useState<'not-started' | 'in-progress' | 'finished'>('not-started');
  const [raceProgress, setRaceProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isConditionsLoading, setIsConditionsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [racingStyleDescription, setRacingStyleDescription] = useState("Aggressive and fast, brakes late into corners.");
  const [analyzedStyle, setAnalyzedStyle] = useState<AnalyzeRacingStyleOutput | null>(null);
  const [availableBoosts, setAvailableBoosts] = useState(BOOSTS_PER_RACE);
  const [isBoosting, setIsBoosting] = useState(false);
  const [raceLog, setRaceLog] = useState<string[]>([]);
  const [aiStrategies, setAiStrategies] = useState<string[]>([]);

  const { toast } = useToast();
  
  const addLog = useCallback((log: string) => {
    setRaceLog(prev => [log, ...prev]);
  }, []);

  const handleRandomizeConditions = async () => {
    if (!selectedTrack) return;
    setIsConditionsLoading(true);
    addLog('Generating new track conditions...');
    try {
      const conditions = await generateTrackConditions({
        trackName: selectedTrack.name,
        currentWeather: 'Sunny',
      });
      setTrackConditions(conditions);
       addLog(`Weather changed to ${conditions.newWeather}. Watch out for ${conditions.trackObstacles}!`);
      toast({
        title: "Track Conditions Updated!",
        description: "New weather and obstacles have been generated.",
      });
    } catch (error) {
      console.error('Failed to generate track conditions:', error);
      addLog('Error: Could not generate new track conditions.');
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
    addLog("Analyzing your racing style...");
    try {
      const style = await analyzeRacingStyle({ racingStyleDescription });
      setAnalyzedStyle(style);
      addLog("AI has adapted to your style.");
      toast({
        title: "Racing Style Analyzed!",
        description: "The AI has adapted to your style. The race will be more challenging now.",
      });
    } catch (error) {
      console.error('Failed to analyze racing style:', error);
      addLog("Error: Could not analyze racing style.");
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
    addLog("Race started!");
    try {
      const strategies = await raceAgainstAI({
        trackData: selectedTrack.trackData,
        playerRacingStyle: analyzedStyle,
        difficultyLevel: selectedTrack.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      });
      setAiStrategies(strategies.aiOpponentStrategies);
      addLog("AI opponents are using adaptive strategies.");
    } catch(error) {
      console.error("Failed to get AI strategies", error);
      addLog("Warning: Could not get AI strategies. AI will use default behavior.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get AI strategies. Starting race with default strategies.",
      });
    }
  };

  const handleUseBoost = () => {
    if (availableBoosts > 0 && raceState === 'in-progress' && !isBoosting) {
      setAvailableBoosts(prev => prev - 1);
      setIsBoosting(true);
      addLog("You used a boost!");
      setTimeout(() => setIsBoosting(false), 2000); // Boost lasts for 2 seconds
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
    addLog(`Race finished! Your time: ${formatTime(finalTime)}`);

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
  }, [currentTime, selectedCar, finishRace, addLog]);
  
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
          const baseIncrement = (100 / (RACE_DURATION_SECONDS * 100));
          const boostIncrement = isBoosting ? baseIncrement * 2.5 : 0; // 150% speed boost
          return prev + baseIncrement + boostIncrement;
        });
      }, 10);
    }
    return () => clearInterval(progressInterval);
  }, [raceState, endRace, isBoosting]);
  
  useEffect(() => {
    if (raceState === 'in-progress' && aiStrategies.length > 0) {
      const eventInterval = setInterval(() => {
        const randomStrategy = aiStrategies[Math.floor(Math.random() * aiStrategies.length)];
        const opponentName = cars[Math.floor(Math.random() * (cars.length -1)) + 1].name;
        addLog(`AI (${opponentName}): ${randomStrategy.substring(0, 50)}...`);
      }, 8000); // AI action every 8 seconds
      return () => clearInterval(eventInterval);
    }
  }, [raceState, aiStrategies, addLog]);

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
                <Progress value={raceProgress} className="w-full h-4 transition-all" indicatorClassName={`bg-primary ${isBoosting ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          </div>
        </Card>
           
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>AI & Race Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <Button onClick={handleRandomizeConditions} className="w-full" variant="outline" disabled={raceState !== 'not-started' || isConditionsLoading}>
                    {isConditionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Randomize Conditions
                  </Button>
              </div>
              <div className="space-y-4 flex flex-col">
                <Button onClick={handleStartRace} className="w-full" size="lg" disabled={raceState !== 'not-started' || !analyzedStyle}>
                  <Flag className="mr-2 h-4 w-4" /> Start Race
                </Button>
                 <Button onClick={handleUseBoost} className="w-full" size="lg" variant="destructive" disabled={raceState !== 'in-progress' || availableBoosts <= 0 || isBoosting}>
                  <Sparkles className="mr-2 h-4 w-4" /> Boost ({availableBoosts} left)
                </Button>
              </div>
            </CardContent>
          </Card>
           
          {trackConditions && (
            <Alert className="bg-card border-primary/50 fade-in">
              <Wind className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Track Conditions Update</AlertTitle>
              <AlertDescription>
                <p><strong className="text-foreground">Weather:</strong> {trackConditions.newWeather}</p>
                <p><strong className="text-foreground">Obstacles:</strong> {trackConditions.trackObstacles}</p>
              </AlertDescription>
            </Alert>
          )}

          <Card className="md:col-span-3">
             <CardHeader>
                <CardTitle>Race Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40 w-full rounded-md border p-4 font-mono text-sm">
                  {raceLog.map((log, i) => (
                    <div key={i} className="mb-2 last:mb-0">{log}</div>
                  ))}
                </ScrollArea>
              </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}

    