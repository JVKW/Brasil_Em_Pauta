import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionCard, DecisionOption, Player, Indicator } from "@/lib/types";
import { roleDetails, indicatorDetails } from "@/lib/game-data";
import { Loader2, ArrowUp, Coins, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DecisionCardProps = {
  card: DecisionCard;
  onDecision: (option: DecisionOption) => void;
  isProcessing: boolean;
  currentPlayer: Player;
};

const EffectIcon = ({ effect }: { effect: string }) => {
  if (effect.includes('Capital')) return <Coins className="h-3 w-3 text-amber-400" />;
  if (effect.includes('Progresso')) return <ArrowUp className="h-3 w-3 text-green-400" />;
  
  const indicatorKey = Object.keys(indicatorDetails).find(key => effect.includes(indicatorDetails[key as Indicator].name));
  if (indicatorKey) {
    const Icon = indicatorDetails[indicatorKey as Indicator].icon;
    const isPositive = !effect.includes('-');
    return <Icon className={`h-3 w-3 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />;
  }

  return <HelpCircle className="h-3 w-3" />;
};


export default function DecisionCardComponent({ card, onDecision, isProcessing, currentPlayer }: DecisionCardProps) {
  const playerRole = roleDetails[currentPlayer.role];
  
  const getEffectText = (option: DecisionOption): string[] => {
    return option.effects.map(effect => {
      if ('indicator' in effect) {
        const indicatorName = indicatorDetails[effect.indicator].name;
        return `${indicatorName} ${effect.change > 0 ? '+' : ''}${effect.change}`;
      }
      if ('capital' in effect) {
        return `Capital ${effect.change > 0 ? '+' : ''}${effect.change}`;
      }
      if ('board' in effect) {
        return `Progresso ${effect.change > 0 ? '+' : ''}${effect.change}`;
      }
      return '';
    }).filter(Boolean);
  };
  
  return (
    <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm border-2 flex flex-col h-full overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-accent font-headline text-2xl lg:text-3xl">{card.title}</CardTitle>
        <CardDescription className="text-base lg:text-lg pt-2 text-foreground/80">{card.dilema}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-3 justify-center p-4">
        {card.options.map((option) => (
            <div key={option.id} className="w-full flex-1">
              <Button
                variant={option.variant}
                className="w-full h-full text-base py-3 justify-start text-left whitespace-normal leading-snug flex flex-col items-start"
                onClick={() => onDecision(option)}
                disabled={isProcessing}
              >
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{option.name}</span>
                    {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                <p className="text-sm text-left font-normal text-foreground/70 w-full mb-2 flex-grow">{option.description}</p>
                <div className="flex flex-wrap gap-2">
                  {getEffectText(option).map((text, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1 text-xs">
                      <EffectIcon effect={text} />
                      {text}
                    </Badge>
                  ))}
                </div>
              </Button>
            </div>
        ))}
      </CardContent>
       <CardFooter className="flex-shrink-0">
        <p className="text-sm text-muted-foreground w-full text-center">
            É a vez de <span className="font-bold text-primary">{currentPlayer.name}</span> ({playerRole.name}) tomar uma decisão.
        </p>
      </CardFooter>
    </Card>
  );
}
