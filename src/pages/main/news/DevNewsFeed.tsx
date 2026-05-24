import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Building2, Code2, ExternalLink, GitFork, Star } from "lucide-react";
import { useDevNewsData, type DevNewsItem } from "./useDevNewsData";
import { DevNewsDetailPanel } from "./DevNewsDetailPanel";

const COMPANY_CONFIG: Record<string, { label: string; color: string }> = {
  google:    { label: "Google",    color: "text-blue-500 border-blue-500/30 bg-blue-500/10" },
  deepmind:  { label: "DeepMind",  color: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10" },
  meta:      { label: "Meta",      color: "text-blue-600 border-blue-600/30 bg-blue-600/10" },
  openai:    { label: "OpenAI",    color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" },
  anthropic: { label: "Anthropic", color: "text-orange-500 border-orange-500/30 bg-orange-500/10" },
  naver:     { label: "Naver D2",  color: "text-green-500 border-green-500/30 bg-green-500/10" },
  kakao:     { label: "Kakao",     color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10" },
  kakaopay:  { label: "KakaoPay", color: "text-yellow-600 border-yellow-600/30 bg-yellow-600/10" },
  toss:      { label: "Toss",     color: "text-cyan-500 border-cyan-500/30 bg-cyan-500/10" },
  line:      { label: "Line",     color: "text-green-600 border-green-600/30 bg-green-600/10" },
  daangn:    { label: "당근",     color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
};

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
}

const SkeletonRows = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="px-3 py-3 border-b border-border last:border-0">
        <div className="flex gap-2 items-start">
          <div className="h-4 w-14 rounded-full bg-muted animate-pulse shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded bg-muted animate-pulse w-4/5" />
            <div className="h-2.5 rounded bg-muted animate-pulse w-2/5" />
          </div>
        </div>
      </div>
    ))}
  </>
);

const BigTechRow = ({
  item,
  isSelected,
  onSelect,
}: {
  item: DevNewsItem;
  isSelected: boolean;
  onSelect: (item: DevNewsItem) => void;
}) => {
  const company = item.company ? (COMPANY_CONFIG[item.company] ?? null) : null;

  return (
    <div
      onClick={() => onSelect(item)}
      className={cn(
        "flex items-start gap-2.5 px-3 py-3 cursor-pointer border-b border-border last:border-0",
        "transition-colors duration-100 hover:bg-muted/60 group",
        isSelected && "bg-primary/8 border-l-2 border-l-primary",
      )}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {company && (
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 shrink-0 leading-4", company.color)}
            >
              {company.label}
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "text-xs font-medium leading-snug line-clamp-2 transition-colors",
            isSelected ? "text-primary" : "group-hover:text-primary",
          )}
        >
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.author && (
            <span className="text-[10px] text-muted-foreground">{item.author}</span>
          )}
          {item.author && (
            <span className="text-[10px] text-muted-foreground/50">·</span>
          )}
          <span className="text-[10px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
        </div>
      </div>
      {item.thumbnail && (
        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-muted">
          <img
            src={item.thumbnail}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.parentElement!.style.display = "none"; }}
          />
        </div>
      )}
    </div>
  );
};

const GitHubRow = ({
  item,
  isSelected,
  onSelect,
}: {
  item: DevNewsItem;
  isSelected: boolean;
  onSelect: (item: DevNewsItem) => void;
}) => {
  const [owner, repo] = item.title.split("/");

  return (
    <div
      onClick={() => onSelect(item)}
      className={cn(
        "flex items-start gap-2 px-3 py-3 cursor-pointer border-b border-border last:border-0",
        "transition-colors duration-100 hover:bg-muted/60 group",
        isSelected && "bg-primary/8 border-l-2 border-l-primary",
      )}
    >
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs font-medium leading-snug transition-colors",
            isSelected ? "text-primary" : "group-hover:text-primary",
          )}
        >
          <span className="text-muted-foreground font-normal">{owner}/</span>
          {repo}
        </p>
        {item.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
          {item.language && (
            <span className="text-[10px] text-muted-foreground">{item.language}</span>
          )}
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            {item.stars?.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <GitFork className="h-2.5 w-2.5" />
            {item.forks?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const EmptyContentState = () => (
  <Card className="h-full flex flex-col items-center justify-center text-center py-24 gap-4 min-h-[calc(100vh-200px)]">
    <div className="flex flex-col items-center gap-3 text-muted-foreground/60">
      <ExternalLink className="h-10 w-10" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">항목을 선택하세요</p>
        <p className="text-xs mt-1">
          오른쪽에서 기사나 저장소를 클릭하면 본문이 여기에 표시됩니다.
        </p>
      </div>
    </div>
  </Card>
);

type ListTab = "bigtech" | "github";

export const DevNewsFeed = () => {
  const { techItems, ghItems, isLoadingTech, isLoadingGH } = useDevNewsData();
  const [selectedItem, setSelectedItem] = useState<DevNewsItem | null>(null);
  const [listTab, setListTab] = useState<ListTab>("bigtech");

  const handleSelect = (item: DevNewsItem) => {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  return (
    <div className="flex gap-5 items-start">
      {/* 왼쪽: 본문 영역 */}
      <div className="flex-1 min-w-0">
        {selectedItem ? (
          <DevNewsDetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
        ) : (
          <EmptyContentState />
        )}
      </div>

      {/* 오른쪽: 리스트 사이드바 */}
      <div className="w-80 shrink-0 sticky top-16.5">
        {/* 피드 탭 */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted/50 border border-border mb-3">
          {(
            [
              { id: "bigtech" as ListTab, label: "빅테크", icon: <Building2 className="h-3.5 w-3.5" /> },
              { id: "github" as ListTab, label: "GitHub", icon: <Code2 className="h-3.5 w-3.5" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setListTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                listTab === tab.id
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 리스트 카드 */}
        <Card className="p-0 gap-0 overflow-hidden">
          <ScrollArea style={{ height: "calc(100vh - 240px)" }}>
            {listTab === "bigtech" ? (
              isLoadingTech ? (
                <SkeletonRows count={10} />
              ) : techItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  데이터가 없습니다. 수집 스크립트를 먼저 실행해주세요.
                </div>
              ) : (
                techItems.map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-in fade-in duration-200 fill-mode-[backwards]"
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <BigTechRow
                      item={item}
                      isSelected={selectedItem?.id === item.id}
                      onSelect={handleSelect}
                    />
                  </div>
                ))
              )
            ) : isLoadingGH ? (
              <SkeletonRows count={8} />
            ) : ghItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">불러오기 실패</div>
            ) : (
              ghItems.map((item, i) => (
                <div
                  key={item.id}
                  className="animate-in fade-in duration-200 fill-mode-[backwards]"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <GitHubRow
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onSelect={handleSelect}
                  />
                </div>
              ))
            )}
          </ScrollArea>
        </Card>

        <p className="text-[10px] text-muted-foreground text-right mt-1.5 pr-1">
          {listTab === "bigtech"
            ? `${techItems.length}개 기사`
            : `${ghItems.length}개 저장소`}
        </p>
      </div>
    </div>
  );
};
