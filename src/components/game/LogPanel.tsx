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
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-4">
            {logs.slice().reverse().map((log) => (
              <div key={log.id} className="text-sm p-2 rounded-md bg-secondary/50">
                <p className="font-bold">Turno {log.turn}: {log.playerName} ({log.playerRole})</p>
                <p>Decisão: <span className="text-primary">{log.decision}</span></p>
                <div className="mt-1">
                    {log.effects.split(', ').map((effect, index) => (
                         <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">{effect}</Badge>
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
