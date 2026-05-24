import { useEffect, useState } from "react";
import { useNewsData } from "./useNewsData";
import { NewsBanner } from "./NewsBanner";
import { NewsDetailPanel } from "./NewsDetailPanel";
import { DevNewsFeed } from "./DevNewsFeed";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, MousePointerClick, Newspaper, Calendar } from "lucide-react";
import type { News } from "./types";

type FeedTab = "news" | "dev";

const TAB_CONFIG: { id: FeedTab; label: string; icon: React.ReactNode }[] = [
  { id: "news", label: "AI 뉴스", icon: <Newspaper className="h-3.5 w-3.5" /> },
  { id: "dev", label: "개발 소식", icon: <Code2 className="h-3.5 w-3.5" /> },
];

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

const EmptyContentState = () => (
  <Card className="h-full flex flex-col items-center justify-center text-center py-24 gap-4">
    <div className="flex flex-col items-center gap-3 text-muted-foreground/60">
      <MousePointerClick className="h-10 w-10" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">기사를 선택하세요</p>
        <p className="text-xs mt-1">
          오른쪽에서 뉴스 기사를 클릭하면 요약과 원문 발췌가 여기에 표시됩니다.
        </p>
      </div>
    </div>
  </Card>
);

const NewsSkeletonRows = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="px-3 py-3 border-b border-border last:border-0">
        <div className="flex gap-3 items-start">
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded bg-muted animate-pulse w-4/5" />
            <div className="h-2.5 rounded bg-muted animate-pulse w-3/5" />
          </div>
        </div>
      </div>
    ))}
  </>
);

const NewsRow = ({
  item,
  isSelected,
  onSelect,
}: {
  item: News;
  isSelected: boolean;
  onSelect: (news: News) => void;
}) => (
  <div
    onClick={() => onSelect(item)}
    className={cn(
      "flex items-start gap-3 px-3 py-3 cursor-pointer border-b border-border last:border-0",
      "transition-colors duration-100 hover:bg-muted/60 group",
      isSelected && "bg-primary/8 border-l-2 border-l-primary",
    )}
  >
    {/* 썸네일 */}
    <div className="h-14 w-14 rounded-lg bg-muted shrink-0 overflow-hidden">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <img
            src="/assets/icons/character_glow.png"
            alt=""
            className="h-8 w-8 object-contain opacity-20"
          />
        </div>
      )}
    </div>

    {/* 텍스트 */}
    <div className="flex-1 min-w-0">
      <p
        className={cn(
          "text-xs font-medium leading-snug line-clamp-2 transition-colors",
          isSelected ? "text-primary" : "group-hover:text-primary",
        )}
      >
        {item.title}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.summary}</p>
      <span className="text-[10px] text-muted-foreground/60 mt-0.5 block">
        {new Date(item.created_at).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  </div>
);

export const NewsDashboard = () => {
  const { news, isLoading, dateGroups, sortedDates } = useNewsData();
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FeedTab>("news");

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

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-5 pb-10">
      {/* 피드 탭 */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl bg-muted/50 border border-border w-fit">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "news" ? (
        <>
          <NewsBanner
            newsCount={news.length}
            daysCount={sortedDates.length}
            isLoading={isLoading}
          />

          <div className="flex gap-5 items-start">
            {/* 왼쪽: 본문 영역 */}
            <div className="flex-1 min-w-0 min-h-[calc(100vh-200px)]">
              {selectedNews ? (
                <NewsDetailPanel
                  news={selectedNews}
                  onClose={() => setSelectedNews(null)}
                />
              ) : (
                <EmptyContentState />
              )}
            </div>

            {/* 오른쪽: 날짜 탭 + 뉴스 리스트 */}
            <div className="w-80 shrink-0 sticky top-16.5">
              {/* 날짜 탭 */}
              {isLoading ? (
                <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none pb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-7 w-16 rounded-lg bg-muted animate-pulse shrink-0" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none pb-0.5">
                  {sortedDates.map((date) => {
                    const isActive = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all duration-150",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border",
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {formatDateTab(date)}
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-4 text-[9px] px-1 ml-0.5 border-transparent",
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {dateGroups[date].length}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 뉴스 리스트 */}
              <Card className="p-0 gap-0 overflow-hidden">
                <ScrollArea style={{ height: "calc(100vh - 300px)" }}>
                  {isLoading ? (
                    <NewsSkeletonRows count={8} />
                  ) : filteredNews.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      해당 날짜의 뉴스가 없습니다
                    </div>
                  ) : (
                    filteredNews.map((item, i) => (
                      <div
                        key={item.id}
                        className="animate-in fade-in duration-200 fill-mode-[backwards]"
                        style={{ animationDelay: `${i * 25}ms` }}
                      >
                        <NewsRow
                          item={item}
                          isSelected={selectedNews?.id === item.id}
                          onSelect={setSelectedNews}
                        />
                      </div>
                    ))
                  )}
                </ScrollArea>
              </Card>

              {!isLoading && filteredNews.length > 0 && (
                <p className="text-[10px] text-muted-foreground text-right mt-1.5 pr-1">
                  {filteredNews.length}개 기사
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <DevNewsFeed />
      )}
    </div>
  );
};
