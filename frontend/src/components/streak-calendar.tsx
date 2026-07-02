import Panel from "@/components/ui/panel";
import { Label, Value } from "@/components/ui/typography";
import { addDays } from "@/lib/daily";
import type { DailyStore } from "@/lib/types";
import { cn } from "@/lib/utils";

type StreakCalendarProps = {
  store: DailyStore;
  today: string;
  days?: number;
};

type DayState = "completed" | "today" | "future" | "missed";

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const stateStyles: Record<DayState, string> = {
  completed: "border-[var(--color-correct)] bg-[var(--color-correct)]/15 text-[var(--color-fg)]",
  today: "border-[var(--color-primary)] bg-[var(--color-accent-soft)] text-[var(--color-fg)]",
  future:
    "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] opacity-50",
  missed: "border-[var(--color-incorrect)] bg-[var(--color-incorrect)]/10 text-[var(--color-dim)]",
};

const StreakCalendar = ({ store, today, days = 14 }: StreakCalendarProps) => {
  const cells = [];
  for (let i = -(days - 1); i <= 2; i++) {
    const date = addDays(today, i);
    const result = store[date];
    const weekday = WEEKDAY[new Date(`${date}T00:00:00`).getDay()];

    let state: DayState;
    if (date === today) {
      state = "today";
    } else if (date > today) {
      state = "future";
    } else if (result) {
      state = "completed";
    } else {
      state = "missed";
    }

    cells.push({ date, state, wpm: result?.bestWpm, weekday });
  }

  return (
    <Panel accent="ink" className="flex gap-2 overflow-x-auto p-4">
      {cells.map((cell) => (
        <div
          key={cell.date}
          data-state={cell.state}
          className={cn(
            "flex w-16 shrink-0 flex-col items-center gap-1 border-[2px] px-2 py-2",
            stateStyles[cell.state],
          )}
        >
          <Label className="text-[10px]">{cell.weekday}</Label>
          <span className="font-mono text-xs">{cell.date.slice(5)}</span>
          {cell.state === "completed" && cell.wpm != null && (
            <Value className="text-sm text-[var(--color-correct)]">{cell.wpm}</Value>
          )}
          {cell.state === "today" && cell.wpm != null && (
            <Value className="text-sm text-[var(--color-primary)]">{cell.wpm}</Value>
          )}
          {cell.state === "today" && cell.wpm == null && (
            <Label className="text-[10px] text-[var(--color-primary)]">Play</Label>
          )}
          {cell.state === "missed" && (
            <Label className="text-[10px] text-[var(--color-incorrect)]">Missed</Label>
          )}
          {cell.state === "future" && <Label className="text-[10px]">Locked</Label>}
        </div>
      ))}
    </Panel>
  );
};

export default StreakCalendar;
