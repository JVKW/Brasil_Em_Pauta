import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionCard, DecisionOption, Player, Indicator } from "@/lib/types";
import { roleDetails, indicatorDetails } from "@/lib/game-data";
import { Loader2, ArrowUp, Coins, HelpCircle, ArrowDown, ArrowRight, Hourglass } from "lucide-react";
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
  
  const indicatorKey = Object.keys(indicatorDetails).find(key => indicatorDetails[key as Indicator].name.toLowerCase().includes(effectType.toLowerCase()));
  
  if (indicatorKey) {
    const Icon = indicatorDetails[indicatorKey as Indicator].icon;
    if (indicatorKey === 'hunger') {
       return <Icon className={`h-3 w-3 ${isPositive ? 'text-red-400' : 'text-green-400'}`} />;
    }
    return <Icon className={`h-3 w-3 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />;
  }

  return <HelpCircle className="h-3 w-3" />;
};


const getEffectText = (option: DecisionOption): {text: string, type: string, change: number}[] => {
    return option.effects.map(effect => {
      if ('indicator' in effect) {
        const indicatorName = indicatorDetails[effect.indicator].name;
        return { text: `${indicatorName} ${effect.change > 0 ? '+' : ''}${effect.change}`, type: indicatorName, change: effect.change };
      }
      if ('capital' in effect) {
        return { text: `Capital ${effect.change > 0 ? '+' : ''}${effect.change}`, type: 'capital', change: effect.change };
      }
      if ('board' in effect) {
        return { text: `Progresso ${effect.change > 0 ? '+' : ''}${effect.change}`, type: 'board', change: effect.change };
      }
      return {text: '', type: 'unknown', change: 0};
    }).filter(e => e.text);
  };

export default function DecisionCardComponent({ card, onDecision, isProcessing, currentPlayer }: DecisionCardProps) {
  const playerRole = roleDetails[currentPlayer.role];

  const isDisabled = isProcessing || (currentPlayer.name === 'Aguardando...' && currentPlayer.role === 'influencer');
  
  if (isDisabled && isProcessing) {
    return (
      <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm border-2 flex flex-col h-full overflow-hidden items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <Hourglass className="h-12 w-12 text-primary animate-pulse" />
          <h2 className="text-xl font-headline text-accent">Aguardando Início</h2>
          <p className="text-muted-foreground">A partida começará assim que 4 jogadores estiverem no lobby.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm border-2 flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-accent font-headline text-2xl lg:text-3xl">{card.title}</CardTitle>
        <CardDescription className="text-base lg:text-lg pt-2 text-foreground/80">{card.dilema}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
        {card.options.map((option) => (
            <div key={option.id} className="w-full flex">
              <Button
                variant={option.variant}
                className={cn(
                  "w-full h-full text-base py-3 justify-start text-left whitespace-normal leading-snug flex flex-col items-start",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => onDecision(option)}
                disabled={isProcessing}
              >
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{option.name}</span>
                    {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                <p className="text-sm text-left font-normal text-foreground/70 w-full flex-grow">{option.description}</p>
                 <div className="flex flex-wrap gap-x-3 gap-y-1 mt-auto pt-2">
                  {getEffectText(option).map((effect, i) => (
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
