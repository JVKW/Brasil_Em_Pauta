import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { NationState } from "@/lib/types";
import { indicatorDetails } from "@/lib/game-data";
import IndicatorBar from "./IndicatorBar";

type ResourceDashboardProps = {
  indicators: NationState;
};

export default function ResourceDashboard({ indicators }: ResourceDashboardProps) {
  const { id, game_session_id, ...indicatorValues } = indicators;
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>Painel da Nação</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        {Object.entries(indicatorValues).map(([key, value]) => {
          if (key === 'board_position') return null; // Don't show board position here
          const details = indicatorDetails[key as keyof typeof indicatorDetails];
          if (!details) return null;
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
