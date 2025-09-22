'use client';

import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, RotateCw } from 'lucide-react';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

export default function RaceResults() {
  const { raceResults, selectedCar, resetGame } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const playerResult = raceResults?.find(r => r.name === "You" || r.name === selectedCar?.name);
  const playerWon = playerResult?.position === 1;

  useEffect(() => {
    if (playerWon) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [playerWon]);
  
  useEffect(() => {
    const handleResize = () => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!raceResults) {
    return (
      <div className="text-center">
        <p>No race results available.</p>
        <Button onClick={resetGame} className="mt-4">
          Start a New Race
        </Button>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto text-center">
       {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400}/>}
      <Card className="shadow-2xl shadow-primary/10">
        <CardHeader>
          <div className="flex justify-center items-center gap-4">
             {playerWon && <Award className="w-12 h-12 text-yellow-400" />}
             <CardTitle className="text-4xl font-headline">
               {playerWon ? "Congratulations, You Won!" : "Race Finished!"}
              </CardTitle>
             {playerWon && <Award className="w-12 h-12 text-yellow-400" />}
          </div>
          <CardDescription className="text-lg mt-2">
            Here are the final standings. Better luck next time... or great job!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-center">Position</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {raceResults.map((result) => (
                  <TableRow key={result.position} className={result.name === "You" || result.name === selectedCar?.name ? 'bg-primary/10' : ''}>
                    <TableCell className="font-bold text-2xl text-center">{result.position}</TableCell>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell className="text-right font-mono">{result.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={resetGame} size="lg" className="mt-8">
            <RotateCw className="mr-2 h-4 w-4" /> Race Again
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
