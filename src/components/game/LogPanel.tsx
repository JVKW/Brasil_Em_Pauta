'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { indicatorDetails } from "@/lib/game-data";

type LogPanelProps = {
  logs: LogEntry[];
};

// Função para traduzir e formatar a string de efeitos
const formatEffects = (effectsString: string): string[] => {
  if (!effectsString) return [];
  
  return effectsString.split(', ').map(effect => {
    const [key, value] = effect.split(': ');
    if (!key || !value) return effect;

    // Traduz a chave (ex: 'education' -> 'Educação')
    const translatedKey = indicatorDetails[key.trim()]?.name || key.trim();
    
    return `${translatedKey}: ${value}`;
  });
};

export default function LogPanel({ logs }: LogPanelProps) {
  return (
    <Card className="shadow-lg flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline">Diário da Nação</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4 pt-0">
          <div className="space-y-4">
            {logs.length === 0 && (
                <p className="text-muted-foreground text-center text-sm p-4">Nenhum evento registrado ainda.</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="text-sm p-3 rounded-lg bg-secondary/50 border border-border/50">
                <p className="font-bold">Turno {log.turn}: {log.playerName} <span className="font-normal text-muted-foreground">({log.playerRole})</span></p>
                <p>Decisão: <span className="text-primary font-semibold">{log.decision}</span></p>
                <div className="mt-2 flex flex-wrap gap-1">
                    {formatEffects(log.effects).map((effect, index) => (
                         effect && <Badge key={index} variant="outline" className="text-xs">{effect}</Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
