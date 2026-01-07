'use client';

import { Button } from "@/components/ui/button";
import { Scale, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type HeaderProps = {
  gameCode: string;
};

export default function Header({ gameCode }: HeaderProps) {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast({
      title: "Código Copiado!",
      description: "O código da partida foi copiado para a área de transferência.",
    });
  };

  return (
    <header className="bg-card/50 border-b shadow-sm sticky top-0 z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
              Brasil em Pauta
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-background/50 px-3 py-1.5">
                <span className="text-sm font-medium text-muted-foreground">CÓDIGO:</span>
                <span className="text-sm font-bold tracking-widest text-primary">{gameCode}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
