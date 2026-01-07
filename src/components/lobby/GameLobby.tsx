'use client';

import { useState } from 'react';
import CreateGameForm from './CreateGameForm';
import JoinGameForm from './JoinGameForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Scale } from 'lucide-react';

interface GameLobbyProps {
  userUid: string;
  defaultPlayerName: string;
  onGameJoined: (gameId: string, playerName: string) => void;
}

export default function GameLobby({ userUid, defaultPlayerName, onGameJoined }: GameLobbyProps) {
    const [playerName, setPlayerName] = useState(defaultPlayerName);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="flex items-center space-x-3 mb-8">
            <Scale className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">
              Brasil em Pauta
            </h1>
          </div>
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Lobby</CardTitle>
          <CardDescription className="text-center">
            Crie uma nova partida ou junte-se a uma existente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreateGameForm 
            userUid={userUid} 
            playerName={playerName} 
            onPlayerNameChange={setPlayerName} 
            onGameCreated={onGameJoined} 
          />
          <Separator />
          <JoinGameForm 
            userUid={userUid}
            playerName={playerName}
            onPlayerNameChange={setPlayerName}
            onGameJoined={onGameJoined}
          />
        </CardContent>
      </Card>
      <footer className="mt-8 text-sm text-muted-foreground">
        Seu ID de sessão: ({userUid.substring(0,15)}...)
      </footer>
    </div>
  );
}
