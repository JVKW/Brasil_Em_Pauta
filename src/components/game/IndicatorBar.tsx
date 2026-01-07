import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type IndicatorBarProps = {
  label: string;
  value: number;
  Icon: LucideIcon;
  isInverse?: boolean;
};

export default function IndicatorBar({ label, value, Icon, isInverse = false }: IndicatorBarProps) {
  const displayValue = Math.round(value);
  
  // Define colors based on the value and whether the indicator is inverse
  let progressColor = 'bg-green-500'; // Default to green
  if (isInverse) {
    // For inverse indicators (like hunger), high values are bad
    if (displayValue >= 8) progressColor = 'bg-red-500';
    else if (displayValue >= 5) progressColor = 'bg-yellow-500';
  } else {
    // For normal indicators, low values are bad
    if (displayValue <= 2) progressColor = 'bg-red-500';
    else if (displayValue <= 5) progressColor = 'bg-yellow-500';
  }

  const progressValue = displayValue * 10; // Convert 0-10 scale to 0-100

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full text-left">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="truncate">{label}</span>
              </div>
              <span className="font-bold text-primary">{displayValue}</span>
            </div>
            <Progress value={progressValue} indicatorClassName={progressColor} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}: {displayValue}/10</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
