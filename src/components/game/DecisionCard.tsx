import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionCard, DecisionOption, Player, Indicator } from "@/lib/types";
import { roleDetails, indicatorDetails } from "@/lib/game-data";
import { Loader2, Coins, HelpCircle, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DecisionCardProps = {
  card: DecisionCard;
  onDecision: (option: DecisionOption) => void;
  isProcessing: boolean;
  currentPlayer: Player;
};

const EffectIcon = ({ effectType, change }: { effectType: string, change: number }) => {
  const isPositive = change > 0;
  
  if (effectType === 'capital') return <Coins className="h-3 w-3 text-amber-400" />;
  if (effectType === 'board') return <ArrowUp className="h-3 w-3 text-green-400" />;
  
  const indicatorKey = Object.keys(indicatorDetails).find(key => key.toLowerCase() === effectType.toLowerCase());

  if (indicatorKey) {
    const Icon = indicatorDetails[indicatorKey as Indicator].icon;
    if (indicatorKey === 'hunger') {
       return <Icon className={`h-3 w-3 ${isPositive ? 'text-red-400' : 'text-green-400'}`} />;
    }
    return <Icon className={`h-3 w-3 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />;
  }

  return <HelpCircle className="h-3 w-3" />;
};


const getEffectText = (effects: Record<string, number>): {text: string, type: string, change: number}[] => {
    return Object.entries(effects).map(([key, value]) => {
      const effectName = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === 'board_position') {
        return { text: `Progresso ${value > 0 ? '+' : ''}${value}`, type: 'board', change: value };
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
        {[{id: 'ethical', name: "Decisão Ética", effect: card.ethical_choice_effect, variant: 'default'}, {id: 'corrupt', name: "Decisão Corrupta", effect: card.corrupt_choice_effect, variant: 'destructive'}].map((option) => (
            <div key={option.id} className="w-full flex">
              <Button
                variant={option.variant as any}
                className={cn(
                  "w-full h-full text-base py-3 justify-start text-left whitespace-normal leading-snug flex flex-col items-start",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => onDecision(option as any)}
                disabled={isProcessing}
              >
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{option.name}</span>
                    {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                 <div className="flex flex-wrap gap-x-3 gap-y-1 mt-auto pt-2">
                  {getEffectText(option.effect).map((effect, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1.5 text-xs">
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
            É a vez de <span className="font-bold text-primary">{currentPlayer.name}</span> ({playerRole.name}) tomar uma decisão.
        </p>
      </CardFooter>
    </Card>
  );
}
