import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GameState } from "@/lib/types";
import { indicatorDetails } from "@/lib/game-data";
import IndicatorBar from "./IndicatorBar";

type ResourceDashboardProps = {
  indicators: GameState['indicators'];
};

export default function ResourceDashboard({ indicators }: ResourceDashboardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>Painel da Nação</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        {Object.entries(indicators).map(([key, value]) => {
          const details = indicatorDetails[key as keyof typeof indicatorDetails];
          return (
            <IndicatorBar
              key={key}
              label={details.name}
              value={value}
              Icon={details.icon}
              isInverse={key === 'hunger'}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
