import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionCard, Player } from "@/lib/types";
import { roleDetails, indicatorDetails } from "@/lib/game-data";
import { Loader2, Coins, HelpCircle, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DecisionCardProps = {
  card: DecisionCard;
  onDecision: (choiceIndex: number) => void;
  isProcessing: boolean;
  currentPlayer: Player;
};

const EffectIcon = ({ effectType, change }: { effectType: string, change: number }) => {
  const isPositive = change > 0;
  
  if (effectType === 'capital') return <Coins className="h-3 w-3 text-amber-400" />;
  if (effectType === 'board_position') return <ArrowUp className="h-3 w-3 text-green-400" />;
  
  const indicatorKey = Object.keys(indicatorDetails).find(key => key.toLowerCase() === effectType.toLowerCase());

  if (indicatorKey) {
    const Icon = indicatorDetails[indicatorKey].icon;
    // For hunger, a positive change is bad (red), and a negative change is good (green).
    if (indicatorKey === 'hunger') {
       return <Icon className={cn("h-3 w-3", isPositive ? 'text-red-400' : 'text-green-400')} />;
    }
    // For other indicators, a positive change is good (green), and a negative change is bad (red).
    return <Icon className={cn("h-3 w-3", isPositive ? 'text-green-400' : 'text-red-400')} />;
  }

  return <HelpCircle className="h-3 w-3" />;
};

const getEffectText = (effects: Record<string, number>): {text: string, type: string, change: number}[] => {
    return Object.entries(effects).map(([key, value]) => {
      const effectName = indicatorDetails[key]?.name || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '));
      if (key === 'board_position') {
        return { text: `Progresso ${value > 0 ? '+' : ''}${value}`, type: 'board_position', change: value };
      }
       if (key === 'capital') {
        return { text: `Capital ${value > 0 ? '+' : ''}${value}`, type: 'capital', change: value };
      }
      return { text: `${effectName} ${value > 0 ? '+' : ''}${value}`, type: key, change: value };
    }).filter(e => e.text);
};

export default function DecisionCardComponent({ card, onDecision, isProcessing, currentPlayer }: DecisionCardProps) {
  const playerRole = roleDetails[currentPlayer.character_role];

  return (
    <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm border-2 flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-accent font-headline text-2xl lg:text-3xl">{card.title}</CardTitle>
        <CardDescription className="text-base lg:text-lg pt-2 text-foreground/80">{card.dilemma}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
        {card.options.map((option, index) => (
            <div key={index} className="w-full flex">
              <Button
                variant="secondary"
                className={cn(
                  "w-full h-full text-base py-3 justify-start text-left whitespace-normal leading-snug flex flex-col items-start hover:bg-primary/20 hover:border-primary",
                  isProcessing && "opacity-50 cursor-not-allowed",
                  "border-2 border-transparent"
                )}
                onClick={() => onDecision(index)}
                disabled={isProcessing}
              >
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{option.text}</span>
                    {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                 <div className="flex flex-wrap gap-x-3 gap-y-1 mt-auto pt-2">
                  {getEffectText(option.effect).map((effect, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1.5 text-xs">
                      <EffectIcon effectType={effect.type} change={effect.change} />
                      <span>{effect.text}</span>
                    </Badge>
                  ))}
                </div>
              </Button>
            </div>
        ))}
      </CardContent>
       <CardFooter>
        <p className="text-sm text-muted-foreground w-full text-center">
            É a vez de <span className="font-bold text-primary">{currentPlayer.nickname}</span> ({playerRole?.name || 'Desconhecido'}) tomar uma decisão.
        </p>
      </CardFooter>
    </Card>
  );
}
