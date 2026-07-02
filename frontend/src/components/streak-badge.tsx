import Panel from "@/components/ui/panel";
import { Label, Value } from "@/components/ui/typography";
import type { DailyStreak } from "@/lib/types";

type StreakBadgeProps = {
  streak: DailyStreak;
};

const StreakBadge = ({ streak }: StreakBadgeProps) => {
  return (
    <div className="flex gap-3">
      <Panel accent="primary" className="flex flex-col items-center px-4 py-2">
        <Label>Current streak</Label>
        <Value>{streak.current}</Value>
      </Panel>
      <Panel accent="ink" className="flex flex-col items-center px-4 py-2">
        <Label>Longest streak</Label>
        <Value className="text-[var(--color-fg)]">{streak.longest}</Value>
      </Panel>
    </div>
  );
};

export default StreakBadge;
