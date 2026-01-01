'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type LogPanelProps = {
  logs: LogEntry[];
};

export default function LogPanel({ logs }: LogPanelProps) {
  return (
    <Card className="shadow-lg flex-grow flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="font-headline">Diário da Nação</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-6 pt-0">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="text-sm p-2 rounded-md bg-secondary/50">
                <p className="font-bold">Turno {log.turn}: {log.playerName} ({log.playerRole})</p>
                <p>Decisão: <span className="text-primary">{log.decision}</span></p>
                <div className="mt-1 flex flex-wrap gap-1">
                    {log.effects.split(', ').map((effect, index) => (
                         effect && <Badge key={index} variant="outline" className="text-xs">{effect}</Badge>
                    ))}
                </div>
              </div>
            ))}
             {logs.length === 0 && (
                <p className="text-muted-foreground text-center">Nenhum evento registrado ainda.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
