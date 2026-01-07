import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Boss } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flag, Shield, Star } from "lucide-react";
import { indicatorDetails } from "@/lib/game-data";

type GameBoardProps = {
  boardPosition: number;
  bosses: Boss[];
  currentBoss: Boss | null;
};

const TOTAL_STEPS = 20;

export default function GameBoard({ boardPosition, bosses, currentBoss }: GameBoardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Progresso da Nação</CardTitle>
        {currentBoss ? (
           <CardDescription className="text-destructive font-bold text-lg animate-pulse">
             Enfrentando Chefe: {currentBoss.name}! Requisito: {indicatorDetails[currentBoss.requirement.indicator]?.name || currentBoss.requirement.indicator} {`>= ${currentBoss.requirement.level}`}
          </CardDescription>
        ) : (
          <CardDescription>A jornada da Crise à Justiça Social.</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative flex items-center w-full h-16">
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full" />
          <div className="relative flex justify-between w-full">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => {
              const boss = bosses.find(b => b.position === step);
              const isCurrentPosition = step === boardPosition;
              const isPassed = step < boardPosition;

              let Icon;
              if (boss) Icon = Shield;
              if (step === 1) Icon = Flag;
              if (step === TOTAL_STEPS) Icon = Star;
              
              return (
                <TooltipProvider key={step}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                          isCurrentPosition ? "bg-primary border-primary scale-125 shadow-lg" : "bg-card",
                          isPassed ? "border-primary/50" : "border-border",
                           boss && "border-destructive/80 border-4 ring-4 ring-destructive/30"
                        )}
                        style={{ zIndex: isCurrentPosition ? 10 : 1 }}
                      >
                        {Icon ? (
                          <Icon className={cn(
                            "h-5 w-5",
                            isCurrentPosition ? "text-primary-foreground" : "text-muted-foreground",
                            isPassed && "text-primary/70",
                            boss && "text-destructive"
                          )} />
                        ) : (
                          <div className={cn("h-2 w-2 rounded-full", isPassed ? "bg-primary/50" : "bg-border")} />
                        )}
                        {isCurrentPosition && <div className="absolute h-8 w-8 rounded-full bg-primary animate-ping -z-10" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Casa {step}</p>
                      {boss && <p className="font-bold text-destructive">Chefe: {boss.name} (Requer {indicatorDetails[boss.requirement.indicator]?.name || boss.requirement.indicator} {`>= ${boss.requirement.level}`})</p>}
                      {step === TOTAL_STEPS && <p className="font-bold text-amber-500">Justiça Social!</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
