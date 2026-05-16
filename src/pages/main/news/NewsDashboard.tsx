import { useEffect, useState } from "react";
import { useNewsData } from "./useNewsData";
import { NewsBanner } from "./NewsBanner";
import { NewsDateTabs } from "./NewsDateTabs";
import { NewsGrid } from "./NewsGrid";
import { NewsDetailPanel } from "./NewsDetailPanel";
import type { News } from "./types";

export const NewsDashboard = () => {
  const { news, isLoading, dateGroups, sortedDates } = useNewsData();
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (sortedDates.length > 0 && !selectedDate) {
      setSelectedDate(sortedDates[0]);
    }
  }, [sortedDates, selectedDate]);

  const filteredNews = selectedDate ? (dateGroups[selectedDate] ?? []) : [];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-5 pb-10">
      <NewsBanner
        newsCount={news.length}
        daysCount={sortedDates.length}
        isLoading={isLoading}
      />

      <NewsDateTabs
        dates={sortedDates}
        dateGroups={dateGroups}
        selectedDate={selectedDate}
        isLoading={isLoading}
        onDateSelect={handleDateSelect}
      />

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <NewsGrid
            news={filteredNews}
            selectedNewsId={selectedNews?.id ?? null}
            isLoading={isLoading}
            onSelect={setSelectedNews}
          />
        </div>

        {selectedNews && <NewsDetailPanel news={selectedNews} />}
      </div>
    </div>
  );
};
