import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameState } from "@/lib/types";
import { indicatorDetails } from "@/lib/game-data";
import IndicatorBar from "./IndicatorBar";

type ResourceDashboardProps = {
  indicators: GameState['indicators'];
};

export default function ResourceDashboard({ indicators }: ResourceDashboardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Painel de Controle da Nação</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
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
