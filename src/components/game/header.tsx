import { Rocket } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border shadow-lg bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Rocket className="w-9 h-9 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            VelocityVerse
          </h1>
        </div>
      </div>
    </header>
  );
}
