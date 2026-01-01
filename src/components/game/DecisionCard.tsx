import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DecisionCard, DecisionOption, Player } from "@/lib/types";
import { roleDetails } from "@/lib/game-data";
import { Loader2 } from "lucide-react";

type DecisionCardProps = {
  card: DecisionCard;
  onDecision: (option: DecisionOption) => void;
  isProcessing: boolean;
  currentPlayer: Player;
};

export default function DecisionCardComponent({ card, onDecision, isProcessing, currentPlayer }: DecisionCardProps) {
  const playerRole = roleDetails[currentPlayer.role];
  
  return (
    <Card className="shadow-2xl border-primary/20 border-2 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-accent font-headline text-2xl">{card.title}</CardTitle>
        <CardDescription className="text-lg pt-2">{card.dilema}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {card.options.map((option) => (
          <TooltipProvider key={option.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    variant={option.variant}
                    className="w-full h-full text-base py-3 justify-start text-left whitespace-normal leading-snug"
                    onClick={() => onDecision(option)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {option.name}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                <p>{option.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
