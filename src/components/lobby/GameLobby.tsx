'use client';

import { useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import CreateGameForm from './CreateGameForm';
import JoinGameForm from './JoinGameForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Scale } from 'lucide-react';

interface GameLobbyProps {
  onGameJoined: (gameId: string) => void;
}

export default function GameLobby({ onGameJoined }: GameLobbyProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Autenticando...</p>
      </div>
    );
  }

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
          <CreateGameForm onGameCreated={onGameJoined} />
          <Separator />
          <JoinGameForm onGameJoined={onGameJoined} />
        </CardContent>
      </Card>
      <footer className="mt-8 text-sm text-muted-foreground">
        Você está logado como: {user.isAnonymous ? 'Anônimo' : user.email} (ID: {user.uid.substring(0,6)}...)
      </footer>
    </div>
  );
}
