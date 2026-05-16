import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { News } from "./types";

interface NewsGridProps {
  news: News[];
  selectedNewsId: number | null;
  isLoading: boolean;
  onSelect: (news: News) => void;
}

const SkeletonCards = () => (
  <div className="flex flex-wrap gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="w-72 h-72 rounded-xl bg-card ring-1 ring-foreground/10 animate-pulse"
      />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3 animate-in fade-in duration-500">
    <img
      src="/assets/icons/character_glow.png"
      alt="Jarvis"
      className="h-20 w-20 object-contain opacity-50 animate-float-slow"
    />
    <p className="text-sm">해당 날짜의 뉴스가 없습니다</p>
  </div>
);

export const NewsGrid = ({ news, selectedNewsId, isLoading, onSelect }: NewsGridProps) => {
  if (isLoading) return <SkeletonCards />;
  if (news.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-wrap gap-4">
      {news.map((item, index) => (
        <Card
          key={item.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className={cn(
            "group flex w-72 flex-col justify-between cursor-pointer overflow-hidden p-0 gap-0",
            "animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-[backwards]",
            "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
            selectedNewsId === item.id
              ? "ring-2 ring-primary shadow-md"
              : "hover:ring-1 hover:ring-foreground/20",
          )}
          onClick={() => onSelect(item)}
        >
          {/* 썸네일 */}
          <div className="relative h-36 w-full bg-muted shrink-0 overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                item.image_url ? "hidden" : "opacity-100 group-hover:opacity-30",
              )}
            >
              <img
                src="/assets/icons/character_glow.png"
                alt=""
                className="h-16 w-16 object-contain opacity-20"
              />
            </div>
            <div className="absolute top-2 left-2">
              <Badge
                variant="secondary"
                className="text-[10px] px-2 py-0.5 backdrop-blur-sm bg-background/70"
              >
                AI 요약
              </Badge>
            </div>
          </div>

          {/* 본문 */}
          <CardContent className="flex flex-col gap-1.5 px-4 pt-3 pb-2 flex-1">
            <span className="text-[11px] text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
              })}
            </span>
            <CardTitle className="text-sm leading-snug line-clamp-2">
              {item.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-0.5">
              {item.summary}
            </p>
          </CardContent>

          <CardFooter className="border-t px-4 py-2">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center text-xs font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              원본 기사 읽기 →
            </a>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
