import { Panel } from "../Panel";
import { StatBox } from "../StatBox";
import { calculateModifier } from "../../utils/rules";
import type { Translation } from "../../types/dnd";
import type { AbilityScores } from "../../types/dnd";

interface AbilityScoresGridProps {
  stats: AbilityScores;
  t: Translation;
  className?: string;
}

export function AbilityScoresGrid({
  stats,
  t,
  className,
}: AbilityScoresGridProps) {
  return (
    <Panel title={t.dashboard.abilitiesTitle} className={className}>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(stats).map(([key, score]) => {
          const mod = calculateModifier(score);
          return (
            <StatBox
              key={key}
              label={key}
              value={score}
              subValue={mod >= 0 ? `+${mod}` : mod.toString()}
              subValueColor={mod >= 0 ? "indigo" : "red"}
            />
          );
        })}
      </div>
    </Panel>
  );
}
