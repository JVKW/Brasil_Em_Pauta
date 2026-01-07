import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionCard, Player, Difficulty } from "@/lib/types";
import { roleDetails, indicatorDetails } from "@/lib/game-data";
import { Loader2, Coins, HelpCircle, ArrowUp, Circle, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type DecisionCardProps = {
  card: DecisionCard;
  onDecision: (choiceIndex: number) => void;
  isProcessing: boolean;
  isMyTurn: boolean;
  currentPlayer: Player;
  difficulty: Difficulty;
};

// Helper para determinar se um efeito é "bom" ou "ruim"
const isEffectPositive = (key: string, value: number): boolean => {
  // Fome é inverso: aumentar fome (valor > 0) é ruim, diminuir é bom.
  if (key.toLowerCase() === 'hunger') {
    return value < 0;
  }
  // Para todo o resto (inclusive board_position), aumentar é bom.
  return value > 0;
};

const EffectIcon = ({ effectType, change }: { effectType: string, change: number }) => {
  const isPositive = isEffectPositive(effectType, change);
  
  if (effectType === 'capital') return <Coins className="h-4 w-4 text-amber-400" />;
  
  // Ícones específicos para movimento no tabuleiro
  if (effectType === 'board_position') {
    return change > 0 
      ? <ArrowUp className="h-4 w-4 text-emerald-500" /> 
      : <ArrowDown className="h-4 w-4 text-rose-500" />;
  }
  
  const indicatorKey = Object.keys(indicatorDetails).find(key => key.toLowerCase() === effectType.toLowerCase());

  if (indicatorKey) {
    const Icon = indicatorDetails[indicatorKey].icon;
    const iconColor = isPositive ? 'text-emerald-500' : 'text-rose-500';
    return <Icon className={cn("h-4 w-4", iconColor)} />;
  }

  return <HelpCircle className="h-4 w-4" />;
};

const getEffectText = (key: string, value: number) => {
    const effectName = indicatorDetails[key]?.name || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '));
    const sign = value > 0 ? '+' : '';
    
    if (key === 'board_position') {
      return value > 0 ? `Avança ${value} casa(s)` : `Recua ${Math.abs(value)} casa(s)`;
    }
     if (key === 'capital') {
      return `Capital: ${sign}${value}`;
    }
    return `${effectName}: ${sign}${value}`;
};

const EffectDisplay = ({ effect, difficulty }: { effect: Record<string, number>, difficulty: Difficulty }) => {
    // Nível Difícil: Não mostra nada (efeitos ocultos até o diário)
    if (difficulty === 'hard') {
        return null;
    }

    // Nível Médio: Mostra apenas bolinhas coloridas (sem texto, sem números)
    if (difficulty === 'medium') {
        return (
             <div className="flex flex-wrap gap-2 items-center mt-2">
                <span className="text-xs font-semibold text-muted-foreground mr-1">Consequências:</span>
                {Object.entries(effect).map(([key, value]) => {
                     // Ignora efeitos nulos
                     if (value === 0) return null;

                     const isPositive = isEffectPositive(key, value);
                     
                     return (
                        <div key={key} className="relative group">
                            <Circle 
                                className={cn(
                                    "h-3 w-3 fill-current", 
                                    isPositive ? "text-emerald-500" : "text-rose-500"
                                )} 
                            />
                        </div>
                     )
                })}
            </div>
        )
    }

    // Nível Fácil: Mostra detalhes completos
    return (
        <div className="flex flex-col gap-1.5 mt-2">
             <p className="text-xs font-semibold text-muted-foreground mb-0.5">Efeitos previstos:</p>
            {Object.entries(effect).map(([key, value]) => {
                if (value === 0) return null;
                return (
                    <div key={key} className="flex items-center gap-2 text-xs transition-colors hover:bg-secondary/50 p-1 rounded">
                        <EffectIcon effectType={key} change={value} />
                        <span className={cn("font-medium", isEffectPositive(key, value) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {getEffectText(key, value)}
                        </span>
                    </div>
                )
            })}
        </div>
    );
}

export default function DecisionCardComponent({ card, onDecision, isProcessing, isMyTurn, currentPlayer, difficulty }: DecisionCardProps) {
  const playerRole = roleDetails[currentPlayer.character_role];

  return (
    <Card className="shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md border-2 flex flex-col h-full overflow-hidden transition-all duration-300">
      <CardHeader className="pb-4 bg-secondary/10">
        <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-accent font-headline text-2xl md:text-3xl leading-tight">{card.title}</CardTitle>
            {difficulty === 'easy' && (
                <Badge variant="outline" className="shrink-0 bg-background/50">Fácil</Badge>
            )}
        </div>
        <CardDescription className="text-base md:text-lg pt-4 text-foreground/90 font-body leading-relaxed border-l-4 border-primary/40 pl-4 my-2">
          {card.dilemma}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow grid grid-cols-1 gap-4 p-4 md:p-6">
        {card.options.map((option, index) => (
            <button 
                key={index} 
                onClick={() => onDecision(index)}
                disabled={isProcessing || !isMyTurn}
                className={cn(
                    "relative flex flex-col rounded-xl border-2 bg-card p-5 text-left transition-all duration-200 group overflow-hidden",
                    // Estados de Hover e Focus
                    "hover:border-primary hover:shadow-lg hover:translate-y-[-2px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    // Estado Desabilitado
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-none",
                    // Estilização condicional baseada na dificuldade para dar pistas visuais sutis
                    difficulty === 'easy' ? "border-border/60" : "border-border/40"
                )}
            >
                {/* Efeito de fundo no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 w-full">
                    <h3 className="font-bold text-lg md:text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
                        {option.text}
                    </h3>
                    
                    {/* Divisor só aparece se não for Hard */}
                    {difficulty !== 'hard' && (
                        <div className="w-full h-px bg-border/50 my-3 group-hover:bg-primary/30 transition-colors" />
                    )}

                    <EffectDisplay effect={option.effect} difficulty={difficulty} />
                </div>
            </button>
        ))}
      </CardContent>

       <CardFooter className="bg-secondary/5 border-t border-border/10 py-4">
        <p className="text-sm w-full text-center flex items-center justify-center gap-2">
            {isMyTurn ? (
                <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-foreground font-semibold">Sua vez de decidir, {playerRole?.name || 'Líder'}.</span>
                </>
            ) : (
                <span className="text-muted-foreground">
                    Aguardando decisão de <span className="font-bold text-foreground">{currentPlayer.nickname}</span>...
                </span>
            )}
        </p>
      </CardFooter>
    </Card>
  );
}
