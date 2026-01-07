import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionCard, Player, Difficulty } from "@/lib/types";
import { roleDetails, indicatorDetails } from "@/lib/game-data";
import { Loader2, Coins, HelpCircle, ArrowUp, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DecisionCardProps = {
  card: DecisionCard;
  onDecision: (choiceIndex: number) => void;
  isProcessing: boolean;
  isMyTurn: boolean;
  currentPlayer: Player;
  difficulty: Difficulty;
};

const EffectIcon = ({ effectType, change }: { effectType: string, change: number }) => {
  const isPositive = change > 0;
  
  if (effectType === 'capital') return <Coins className="h-4 w-4 text-amber-400" />;
  if (effectType === 'board_position') return <ArrowUp className="h-4 w-4 text-green-500" />;
  
  const indicatorKey = Object.keys(indicatorDetails).find(key => key.toLowerCase() === effectType.toLowerCase());

  if (indicatorKey) {
    const Icon = indicatorDetails[indicatorKey].icon;
    let iconColor = 'text-gray-400';
    if (indicatorKey === 'hunger') {
       iconColor = isPositive ? 'text-red-400' : 'text-green-400';
    } else {
       iconColor = isPositive ? 'text-green-400' : 'text-red-400';
    }
    return <Icon className={cn("h-4 w-4", iconColor)} />;
  }

  return <HelpCircle className="h-4 w-4" />;
};

const getEffectText = (key: string, value: number) => {
    const effectName = indicatorDetails[key]?.name || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '));
    const sign = value > 0 ? '+' : '';
    if (key === 'board_position') {
      return `Avança ${value} casa(s)`;
    }
     if (key === 'capital') {
      return `Capital: ${sign}${value}`;
    }
    return `${effectName}: ${sign}${value}`;
};

const EffectDisplay = ({ effect, difficulty }: { effect: Record<string, number>, difficulty: Difficulty }) => {
    if (difficulty === 'hard') {
        return <p className="text-sm text-muted-foreground italic">As consequências são desconhecidas...</p>;
    }

    if (difficulty === 'medium') {
        return (
             <div className="flex flex-wrap gap-2 items-center">
                <p className="text-sm text-muted-foreground mr-2">Efeitos:</p>
                {Object.entries(effect).map(([key, value]) => {
                     if (key === 'board_position') return null; // Don't show board position changes as dots
                     const isPositive = key === 'hunger' ? value < 0 : value > 0;
                     return (
                        <Circle key={key} className={cn("h-3 w-3", isPositive ? "text-green-500 fill-green-500" : "text-red-500 fill-red-500")} />
                     )
                })}
            </div>
        )
    }

    // Difficulty is 'easy'
    return (
        <div className="flex flex-col gap-1">
            {Object.entries(effect).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                    <EffectIcon effectType={key} change={value} />
                    <span className="text-foreground/80">{getEffectText(key, value)}</span>
                </div>
            ))}
        </div>
    );
}

export default function DecisionCardComponent({ card, onDecision, isProcessing, isMyTurn, currentPlayer, difficulty }: DecisionCardProps) {
  const playerRole = roleDetails[currentPlayer.character_role];

  return (
    <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm border-2 flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-accent font-headline text-3xl">{card.title}</CardTitle>
        <CardDescription className="text-lg pt-4 text-foreground/80 font-body leading-relaxed">
          {card.dilemma}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 items-stretch">
        {card.options.map((option, index) => (
            <button 
                key={index} 
                onClick={() => onDecision(index)}
                disabled={isProcessing || !isMyTurn}
                className={cn(
                    "flex flex-col rounded-lg border bg-secondary/30 p-4 text-left transition-all",
                    "hover:bg-primary/10 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary/30 disabled:hover:border-transparent"
                )}
            >
                <h3 className="font-bold text-lg text-foreground">{option.text}</h3>
                <div className="flex-grow my-4 border-b border-border/50" />
                <div className="flex flex-col gap-2">
                    <EffectDisplay effect={option.effect} difficulty={difficulty} />
                </div>
            </button>
        ))}
      </CardContent>
       <CardFooter>
        <p className="text-sm text-muted-foreground w-full text-center">
            {isMyTurn 
                ? <span className="text-primary font-bold animate-pulse">Sua vez de decidir, {playerRole?.name || 'jogador'}.</span>
                : <>É a vez de <span className="font-bold text-primary">{currentPlayer.nickname}</span> ({playerRole?.name || 'Desconhecido'}) tomar uma decisão.</>
            }
        </p>
      </CardFooter>
    </Card>
  );
}
