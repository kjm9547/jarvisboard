import { Badge } from "@/components/ui/badge";

interface NewsBannerProps {
  newsCount: number;
  daysCount: number;
  isLoading: boolean;
}

export const NewsBanner = ({ newsCount, daysCount, isLoading }: NewsBannerProps) => {
  return (
    <div className="mb-6 relative rounded-2xl overflow-hidden border border-border bg-card">
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 pointer-events-none" />
      <div className="absolute -right-4 -bottom-6 h-24 w-24 rounded-full bg-primary/8 pointer-events-none" />

      <div className="absolute right-4 bottom-0 pointer-events-none select-none">
        <img
          src="/assets/icons/character_flying.png"
          alt=""
          className="h-28 object-contain opacity-60 drop-shadow-md"
        />
      </div>

      <div className="relative px-6 py-5 pr-36">
        <div className="flex items-center gap-2 mb-3">
          <img
            src="/assets/icons/icon_512_32x32_circle_resized_32px.png"
            alt="Jarvis"
            className="h-5 w-5 rounded-full"
          />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Jarvis Board
          </span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1 leading-tight">
          AI 뉴스 대시보드
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          맥 미니 서버가 매일 9시 자동 수집 · AI 요약한 최근 7일 뉴스
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="outline"
            className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-2"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            실시간 작동 중
          </Badge>
          {!isLoading && newsCount > 0 && (
            <span className="text-xs text-muted-foreground">
              총{" "}
              <span className="font-semibold text-foreground">{newsCount}</span>
              개 기사 · {daysCount}일치
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
