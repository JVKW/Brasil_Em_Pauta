import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameSession } from "@/lib/types";
import { indicatorDetails } from "@/lib/game-data";
import IndicatorBar from "./IndicatorBar";

type ResourceDashboardProps = {
  indicators: Pick<
    GameSession,
    | "economy"
    | "education"
    | "wellbeing"
    | "popular_support"
    | "hunger"
    | "military_religion"
  >;
};

export default function ResourceDashboard({ indicators }: ResourceDashboardProps) {
  const {
    economy,
    education,
    wellbeing,
    popular_support,
    hunger,
    military_religion,
  } = indicators;

  const indicatorValues = {
    economy,
    education,
    wellbeing,
    popular_support,
    hunger,
    military_religion,
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>Painel da Nação</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        {Object.entries(indicatorValues).map(([key, value]) => {
          if (value === undefined || value === null) return null;

          const details = indicatorDetails[key as keyof typeof indicatorDetails];
          if (!details) return null;

          return (
            <IndicatorBar
              key={key}
              label={details.name}
              value={value}
              Icon={details.icon}
              isInverse={key === "hunger"}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
