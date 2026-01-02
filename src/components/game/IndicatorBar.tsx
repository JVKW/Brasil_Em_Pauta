import { Progress, ProgressIndicator } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

type IndicatorBarProps = {
  label: string;
  value: number;
  Icon: LucideIcon;
  isInverse?: boolean;
};

const PatchedProgress = React.forwardRef<
    React.ElementRef<typeof Progress>,
    React.ComponentPropsWithoutRef<typeof Progress> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
    <Progress
        ref={ref}
        className={className}
        value={(value || 0) * 10} // Convert 0-10 scale to 0-100 for progress bar
        {...props}
    >
        <ProgressIndicator
            className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
            style={{ transform: `translateX(-${100 - ((value || 0) * 10)}%)` }}
        />
    </Progress>
));
PatchedProgress.displayName = 'Progress';


export default function IndicatorBar({ label, value, Icon, isInverse = false }: IndicatorBarProps) {
  const displayValue = Math.round(value);
  const progressColor = isInverse
    ? value >= 8 ? 'bg-red-500' : value >= 5 ? 'bg-yellow-500' : 'bg-green-500'
    : value <= 2 ? 'bg-red-500' : value <= 5 ? 'bg-yellow-500' : 'bg-green-500';

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
            <PatchedProgress value={displayValue} className="h-3" indicatorClassName={progressColor} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}: {displayValue}/10</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
