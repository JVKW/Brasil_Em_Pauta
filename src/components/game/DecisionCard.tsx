import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionCard, Player, Difficulty } from "@/lib/types";
import { roleDetails } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type DecisionCardProps = {
  card: DecisionCard;
  onDecision: (choiceIndex: number) => void;
  isProcessing: boolean;
  isMyTurn: boolean;
  currentPlayer: Player;
  difficulty: Difficulty;
};

export default function DecisionCardComponent({ card, onDecision, isProcessing, isMyTurn, currentPlayer, difficulty }: DecisionCardProps) {
  const playerRole = roleDetails[currentPlayer.character_role];

  return (
    <Card className="shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md border-2 flex flex-col h-full overflow-hidden transition-all duration-300">
      <CardHeader className="pb-4 bg-secondary/10">
        <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-accent font-headline text-2xl md:text-3xl leading-tight">{card.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 bg-background/50 capitalize">{difficulty}</Badge>
        </div>
        <CardDescription className="text-base md:text-lg pt-4 text-foreground/90 font-body leading-relaxed border-l-4 border-primary/40 pl-4 my-2">
          {card.dilemma}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 md:p-6 overflow-y-auto">
        <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-4 pr-4">
            {card.options.map((option, index) => (
                <button 
                    key={index} 
                    onClick={() => onDecision(index)}
                    disabled={isProcessing || !isMyTurn}
                    className={cn(
                        "relative flex flex-col rounded-xl border-2 bg-card p-5 text-left transition-all duration-200 group overflow-hidden",
                        // Estados de Hover e Focus
                        "hover:border-primary hover:shadow-lg hover:translate-y-[-2px]",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        // Estado Desabilitado
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-none",
                        "border-border/60"
                    )}
                >
                    {/* Efeito de fundo no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 w-full">
                        <h3 className="font-bold text-lg md:text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
                            {option.text}
                        </h3>
                    </div>
                </button>
            ))}
            </div>
        </ScrollArea>
      </CardContent>

       <CardFooter className="bg-secondary/5 border-t border-border/10 py-4">
        <p className="text-sm w-full text-center flex items-center justify-center gap-2">
            {isMyTurn ? (
                <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-foreground font-semibold">Sua vez de decidir, {playerRole?.name || 'Líder'}.</span>
                </>
            ) : (
                <span className="text-muted-foreground">
                    Aguardando decisão de <span className="font-bold text-foreground">{currentPlayer.nickname}</span>...
                </span>
            )}
        </p>
      </CardFooter>
    </Card>
  );
}
