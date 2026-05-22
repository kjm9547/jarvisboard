import { ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock, Circle, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotionProject } from "@/hooks/useNotionProject";

const MILESTONE_SHORT: Record<string, string> = {
  "M1 MVP": "M1",
  "M2 기능강화": "M2",
  "M3 탐방프로그램": "M3",
  "M4 QA": "M4",
  "M5 스토어등록": "M5",
  "M6 출시": "M6",
};

const SEVERITY_CONFIG = {
  Critical: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/30", dot: "bg-red-500" },
  High:     { color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30", dot: "bg-orange-500" },
  Medium:   { color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30", dot: "bg-yellow-500" },
  Low:      { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30", dot: "bg-slate-400" },
} as const;

const STATUS_ICON = {
  "완료": <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  "진행 중": <Clock className="h-3.5 w-3.5 text-blue-500" />,
  "시작 전": <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
} as const;

const dday = (dateStr: string | null) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
};

export const ProjectDashboard = () => {
  const {
    tasks, issues, loading, error, refetch,
    milestoneStats, activeMilestone, activeStats, progressPct,
    upcomingTasks, MILESTONE_ORDER,
  } = useNotionProject();

  return (
    <div className="px-5 pt-5 pb-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">TripRoute</h2>
            <Badge variant="secondary" className="font-mono text-xs">
              {MILESTONE_SHORT[activeMilestone] ?? "M1"} 진행 중
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">소멸 위기 지역에 여행자를 연결하는 동선 기록 앱</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost" size="sm"
            onClick={refetch}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            새로고침
          </Button>
          <a
            href="https://www.notion.so/362ecbfcfe83812aa192fd265336d83f"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              노션에서 열기
            </Button>
          </a>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>데이터를 불러오지 못했습니다. NOTION_TOKEN 설정을 확인해주세요.</span>
        </div>
      )}

      {/* 마일스톤 스테퍼 */}
      <Card className="mb-6 rounded-2xl border-border bg-white/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-1">
            {MILESTONE_ORDER.map((m, i) => {
              const stats = milestoneStats(m);
              const isActive = m === activeMilestone;
              const isDone = stats.total > 0 && stats.done === stats.total;
              const hasStarted = stats.inProgress > 0 || stats.done > 0;

              return (
                <div key={m} className="flex items-center flex-1 min-w-0">
                  <div className={cn(
                    "flex flex-col items-center gap-1 flex-1 min-w-0 px-1",
                  )}>
                    <div className={cn(
                      "w-full h-1.5 rounded-full transition-all",
                      isDone ? "bg-emerald-500" :
                      isActive ? "bg-blue-500" :
                      hasStarted ? "bg-blue-500/40" :
                      "bg-muted/40"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold font-mono truncate",
                      isDone ? "text-emerald-500" :
                      isActive ? "text-blue-500" :
                      "text-muted-foreground"
                    )}>
                      {MILESTONE_SHORT[m]}
                    </span>
                  </div>
                  {i < MILESTONE_ORDER.length - 1 && (
                    <div className="h-px w-2 bg-border shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 메인 그리드 */}
      <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-5 mb-5">

        {/* 현재 마일스톤 태스크 */}
        <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                {activeMilestone}
              </CardTitle>
              {!loading && (
                <div className="flex items-center gap-1.5">
                  <div className="text-xs text-muted-foreground font-mono">{progressPct}%</div>
                  <div className="h-1.5 w-20 rounded-full bg-muted/30">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {!loading && (
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium">✓ {activeStats.done}완료</span>
                <span className="text-blue-500 font-medium">● {activeStats.inProgress}진행</span>
                <span>○ {activeStats.todo}대기</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              {loading ? (
                <div className="space-y-2 pt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 py-2">
                      <div className="h-3.5 w-3.5 rounded-full bg-muted/40 animate-pulse shrink-0" />
                      <div className="h-3.5 flex-1 rounded bg-muted/40 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5 pt-1">
                  {tasks
                    .filter((t) => t.milestone === activeMilestone)
                    .sort((a, b) => {
                      const order = { "진행 중": 0, "시작 전": 1, "완료": 2 };
                      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
                    })
                    .map((t) => (
                      <a
                        key={t.id}
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <span className="mt-0.5 shrink-0">
                          {STATUS_ICON[t.status as keyof typeof STATUS_ICON] ?? STATUS_ICON["시작 전"]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate group-hover:text-blue-400 transition-colors",
                            t.status === "완료" ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {t.assignee && (
                              <span className="text-[10px] text-muted-foreground">{t.assignee}</span>
                            )}
                            {t.dueDate && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ~{t.dueDate.slice(5)}
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 이슈 */}
        <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              🐛 이슈
              {!loading && issues.length > 0 && (
                <Badge variant="secondary" className="text-xs font-mono">{issues.length}</Badge>
              )}
            </CardTitle>
            {!loading && (
              <div className="flex gap-2 text-xs">
                {(["Critical", "High", "Medium"] as const).map((sev) => {
                  const count = issues.filter((i) => i.severity === sev).length;
                  if (!count) return null;
                  return (
                    <span key={sev} className={SEVERITY_CONFIG[sev].color}>
                      {sev} {count}
                    </span>
                  );
                })}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              {loading ? (
                <div className="space-y-2 pt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-7 w-7 opacity-30" />
                  <p className="text-sm">이슈가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {issues
                    .sort((a, b) => {
                      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
                      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
                    })
                    .map((issue) => {
                      const cfg = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.Low;
                      return (
                        <a
                          key={issue.id}
                          href={issue.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "flex items-start gap-2.5 rounded-xl border px-3 py-2.5",
                            "hover:opacity-80 transition-opacity",
                            cfg.bg
                          )}
                        >
                          <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn("text-[10px] font-bold", cfg.color)}>{issue.severity}</span>
                              {issue.type && (
                                <span className="text-[10px] text-muted-foreground">{issue.type}</span>
                              )}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* D-day 임박 + 전체 통계 */}
        <div className="flex flex-col gap-5">
          {/* 마감 임박 */}
          <Card className="rounded-2xl border-border bg-white/5 shadow-2xl flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                ⏰ 마감 임박
                <span className="text-xs text-muted-foreground font-normal">7일 이내</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center">임박한 마감이 없습니다</p>
              ) : (
                <div className="space-y-1.5">
                  {upcomingTasks.map((t) => {
                    const d = dday(t.dueDate);
                    return (
                      <a
                        key={t.id}
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
                      >
                        <p className="text-sm text-foreground truncate flex-1">{t.title}</p>
                        <span className={cn(
                          "text-xs font-bold font-mono shrink-0",
                          d === "D-Day" ? "text-red-500" : "text-orange-500"
                        )}>
                          {d}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 전체 통계 */}
          <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "전체", value: tasks.length, color: "text-foreground" },
                  { label: "완료", value: tasks.filter((t) => t.status === "완료").length, color: "text-emerald-500" },
                  { label: "진행", value: tasks.filter((t) => t.status === "진행 중").length, color: "text-blue-500" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    {loading ? (
                      <div className="h-6 w-10 mx-auto rounded bg-muted/40 animate-pulse mb-1" />
                    ) : (
                      <p className={cn("text-2xl font-bold font-mono", color)}>{value}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
