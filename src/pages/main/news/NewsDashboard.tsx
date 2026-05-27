import { useEffect, useState } from "react";
import { useNewsData } from "./useNewsData";
import { NewsBanner } from "./NewsBanner";
import { NewsDetailPanel } from "./NewsDetailPanel";
import { DevNewsFeed } from "./DevNewsFeed";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, Newspaper, Calendar, Sparkles } from "lucide-react";
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

/* ── 그리드용 카드 (기사 미선택 상태) ── */
const NewsCard = ({
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
      "cursor-pointer rounded-xl border border-border bg-card overflow-hidden group",
      "transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5",
      isSelected && "ring-2 ring-primary border-primary/50 shadow-md",
    )}
  >
    <div className="h-44 bg-muted overflow-hidden">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.parentElement!.classList.add("flex", "items-center", "justify-center");
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <img
            src="/assets/icons/character_glow.png"
            alt=""
            className="h-14 w-14 object-contain opacity-15"
          />
        </div>
      )}
    </div>

    <div className="p-4 space-y-2">
      <p
        className={cn(
          "text-sm font-semibold leading-snug line-clamp-2 transition-colors",
          isSelected ? "text-primary" : "group-hover:text-primary",
        )}
      >
        {item.title}
      </p>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {item.summary}
      </p>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-muted-foreground/60">
          {new Date(item.created_at).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 text-primary border-primary/30 bg-primary/10 gap-1"
        >
          <Sparkles className="h-2 w-2" />
          AI 요약
        </Badge>
      </div>
    </div>
  </div>
);

/* ── 사이드바용 작은 행 (기사 선택 후 오른쪽 목록) ── */
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

/* ── 스켈레톤 ── */
const GridSkeletons = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-44 bg-muted animate-pulse" />
        <div className="p-4 space-y-2">
          <div className="h-3.5 rounded bg-muted animate-pulse w-4/5" />
          <div className="h-3 rounded bg-muted animate-pulse w-3/5" />
          <div className="h-2.5 rounded bg-muted animate-pulse w-2/5 mt-1" />
        </div>
      </div>
    ))}
  </>
);

const SidebarSkeletons = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="px-3 py-3 border-b border-border last:border-0">
        <div className="flex gap-3 items-start">
          <div className="h-14 w-14 rounded-lg bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded bg-muted animate-pulse w-4/5" />
            <div className="h-2.5 rounded bg-muted animate-pulse w-3/5" />
          </div>
        </div>
      </div>
    ))}
  </>
);

/* ── 날짜 탭 ── */
const DateTabs = ({
  sortedDates,
  dateGroups,
  selectedDate,
  isLoading,
  onSelect,
}: {
  sortedDates: string[];
  dateGroups: Record<string, News[]>;
  selectedDate: string;
  isLoading: boolean;
  onSelect: (date: string) => void;
}) => (
  <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none pb-0.5">
    {isLoading
      ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-16 rounded-lg bg-muted animate-pulse shrink-0" />
        ))
      : sortedDates.map((date) => {
          const isActive = selectedDate === date;
          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
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
);

/* ── 메인 컴포넌트 ── */
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
    <div className="min-h-screen bg-background px-3 pt-4 pb-10 md:px-5 md:pt-5">
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

          <DateTabs
            sortedDates={sortedDates}
            dateGroups={dateGroups}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onSelect={handleDateSelect}
          />

          {selectedNews ? (
            /* ── 기사 선택 상태: 상세 패널 + 오른쪽 리스트 ── */
            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="flex-1 min-w-0 w-full">
                <NewsDetailPanel
                  news={selectedNews}
                  onClose={() => setSelectedNews(null)}
                />
              </div>

              <div className="hidden md:block w-72 shrink-0 sticky top-16.5">
                <Card className="p-0 gap-0 overflow-hidden">
                  <ScrollArea style={{ height: "calc(100vh - 220px)" }}>
                    {filteredNews.map((item, i) => (
                      <div
                        key={item.id}
                        className="animate-in fade-in duration-200 fill-mode-[backwards]"
                        style={{ animationDelay: `${i * 20}ms` }}
                      >
                        <NewsRow
                          item={item}
                          isSelected={selectedNews?.id === item.id}
                          onSelect={setSelectedNews}
                        />
                      </div>
                    ))}
                  </ScrollArea>
                </Card>
                <p className="text-[10px] text-muted-foreground text-right mt-1.5 pr-1">
                  {filteredNews.length}개 기사
                </p>
              </div>
            </div>
          ) : (
            /* ── 기사 미선택 상태: 전체 너비 카드 그리드 ── */
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <GridSkeletons count={6} />
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="py-24 text-center text-sm text-muted-foreground">
                  해당 날짜의 뉴스가 없습니다
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNews.map((item, i) => (
                    <div
                      key={item.id}
                      className="animate-in fade-in duration-200 fill-mode-[backwards]"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <NewsCard
                        item={item}
                        isSelected={false}
                        onSelect={setSelectedNews}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <DevNewsFeed />
      )}
    </div>
  );
};
