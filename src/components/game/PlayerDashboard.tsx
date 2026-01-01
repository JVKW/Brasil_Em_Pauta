import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Player } from "@/lib/types";
import { roleDetails } from "@/lib/game-data";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from "@/lib/utils";
import { Crown, Coins } from "lucide-react";
import { ScrollArea } from '../ui/scroll-area';

type PlayerDashboardProps = {
  players: Player[];
  currentPlayerId: string;
};

export default function PlayerDashboard({ players, currentPlayerId }: PlayerDashboardProps) {
  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline">Gabinete de Ministros</CardTitle>
        <CardDescription>Os tomadores de decisão da nação.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
        <div className="space-y-4 pr-4">
          {players.map((player) => {
            const details = roleDetails[player.role];
            const avatarImage = PlaceHolderImages.find(p => p.id === player.avatar);
            const isCurrentPlayer = player.id === currentPlayerId;

            return (
              <TooltipProvider key={player.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center space-x-4 p-3 rounded-lg border transition-all",
                      isCurrentPlayer ? "bg-primary/10 border-primary shadow-md" : "bg-card"
                    )}>
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={player.name} data-ai-hint={avatarImage.imageHint} />}
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-foreground">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{details.name}</p>
                         <div className="flex items-center text-sm mt-1">
                            <Coins className="h-4 w-4 mr-1.5 text-amber-500" />
                            <span className="font-semibold">{player.capital}</span>
                        </div>
                      </div>
                      {isCurrentPlayer && (
                        <div className="relative h-6 w-6">
                           <Crown className="h-6 w-6 text-primary animate-pulse" aria-label="Jogador atual" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{details.name}</p>
                    <p>{details.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
