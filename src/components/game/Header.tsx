'use client';

import { Button } from "@/components/ui/button";
import { Gamepad2, RotateCcw } from "lucide-react";

type HeaderProps = {
  onRestart: () => void;
};

export default function Header({ onRestart }: HeaderProps) {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
              Ethical Frontier
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={onRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </div>
    </header>
  );
}
