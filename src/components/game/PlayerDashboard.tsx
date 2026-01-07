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
    <Card className="shadow-lg flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline">Gabinete</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-2 pt-0">
        <div className="space-y-2">
          {players.map((player) => {
            if (!player || !player.name) {
              return null;
            }

            const details = roleDetails[player.character_role];
            const avatarImage = PlaceHolderImages.find(p => p.id === player.avatar);
            const isCurrentPlayer = player.id === currentPlayerId;

            return (
              <TooltipProvider key={player.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center space-x-3 p-2 rounded-lg border transition-all",
                      isCurrentPlayer ? "bg-primary/20 border-primary shadow-md border-2" : "bg-card/50"
                    )}>
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={player.name} data-ai-hint={avatarImage.imageHint} />}
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate">{player.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{details?.name || 'Função desconhecida'}</p>
                         <div className="flex items-center text-xs mt-1">
                            <Coins className="h-3 w-3 mr-1 text-amber-500" />
                            <span className="font-semibold">{player.capital}</span>
                        </div>
                      </div>
                      {isCurrentPlayer && (
                        <div className="relative h-5 w-5 flex-shrink-0">
                           <Crown className="h-5 w-5 text-accent animate-pulse" aria-label="Jogador atual" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {details && (
                    <TooltipContent>
                        <p className="font-bold">{details.name}</p>
                        <p>{details.description}</p>
                    </TooltipContent>
                  )}
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
