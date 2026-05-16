import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { News } from "./types";

interface NewsDateTabsProps {
  dates: string[];
  dateGroups: Record<string, News[]>;
  selectedDate: string;
  isLoading: boolean;
  onDateSelect: (date: string) => void;
}

const formatDateTab = (dateStr: string): string => {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (target.getTime() === today.getTime()) return "오늘";
  if (target.getTime() === yesterday.getTime()) return "어제";
  return target.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
};

export const NewsDateTabs = ({
  dates,
  dateGroups,
  selectedDate,
  isLoading,
  onDateSelect,
}: NewsDateTabsProps) => {
  if (isLoading) {
    return (
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-lg bg-muted animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
      {dates.map((date) => {
        const isActive = selectedDate === date;
        return (
          <Button
            key={date}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => onDateSelect(date)}
          >
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTab(date)}
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className={cn(
                "h-4 text-[10px] px-1.5 ml-0.5",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                  : "",
              )}
            >
              {dateGroups[date].length}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};
