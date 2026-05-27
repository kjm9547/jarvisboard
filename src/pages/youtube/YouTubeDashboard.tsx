import { useState } from "react";
import {
  Youtube, LogIn, LogOut, RefreshCw, Eye, Clock, MousePointerClick,
  Users, Video, ThumbsUp, MessageSquare, Music4, Link2, Loader2,
  Film, Upload, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactECharts from "echarts-for-react";
import { useYouTubeAuth } from "@/hooks/useYouTubeAuth";
import { useYouTubeChannel } from "@/hooks/useYouTubeChannel";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";

// ────────────────────────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString();

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// ────────────────────────────────────────────────────────────────────────────
// 로그인 화면
// ────────────────────────────────────────────────────────────────────────────
const LoginScreen = ({ onSignIn, loading }: { onSignIn: () => void; loading: boolean }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="p-4 rounded-full bg-red-500/10">
        <Youtube className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">YouTube 채널 대시보드</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Google 계정으로 로그인하면 내 채널 통계와 분석 데이터를 확인할 수 있습니다
      </p>
    </div>
    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500 max-w-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span><b>VITE_GOOGLE_CLIENT_ID</b> 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.</span>
      </div>
    )}
    <Button size="lg" onClick={onSignIn} className="gap-2 px-8">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
      Google로 로그인
    </Button>
    <p className="text-xs text-muted-foreground">
      youtube.readonly · yt-analytics.readonly 권한이 필요합니다
    </p>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// 채널 통계 카드
// ────────────────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon, label, value, sub, color,
}: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) => (
  <Card className="rounded-xl border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-foreground/15">
    <div className={cn("h-1 w-full", color)} />
    <CardContent className="pt-3 pb-3 px-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", color.replace("bg-", "text-").replace("/20", ""))} />
      </div>
      <p className="text-xl font-bold font-mono text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </CardContent>
  </Card>
);

// ────────────────────────────────────────────────────────────────────────────
// 분석 차트
// ────────────────────────────────────────────────────────────────────────────
const AnalyticsCharts = ({ data }: { data: ReturnType<typeof useYouTubeAnalytics>["data"] }) => {
  const labels = data.map((d) => fmtDate(d.date));
  const views = data.map((d) => d.views);
  const watchTime = data.map((d) => Math.round(d.estimatedMinutesWatched / 60)); // hours
  const ctr = data.map((d) => d.impressionClickThroughRate);

  const lineOption = (label: string, values: number[], color: string, unit: string) => ({
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(12,12,18,0.95)",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      textStyle: { color: "#f1f5f9", fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}<br/><b style="color:${color}">${params[0].value.toLocaleString()}${unit}</b>`,
    },
    grid: { left: "2%", right: "2%", bottom: "3%", top: "10%", containLabel: true },
    xAxis: {
      type: "category", data: labels,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" } },
      axisLabel: { color: "rgba(255,255,255,0.35)", fontSize: 10 },
    },
    series: [{
      type: "line", data: values, name: label,
      smooth: true, symbol: "none",
      lineStyle: { color, width: 2 },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + "50" }, { offset: 1, color: color + "00" }] } },
    }],
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="rounded-2xl border-border bg-white/5">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground">조회수 (28일)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <ReactECharts option={lineOption("조회수", views, "#ef4444", "회")} style={{ height: 130 }} notMerge />
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border bg-white/5">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground">시청 시간 (시간)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <ReactECharts option={lineOption("시청시간", watchTime, "#3b82f6", "h")} style={{ height: 130 }} notMerge />
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border bg-white/5">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground">CTR (%)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <ReactECharts option={lineOption("CTR", ctr, "#10b981", "%")} style={{ height: 130 }} notMerge />
        </CardContent>
      </Card>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// MP3 변환 섹션 (UI only — 서버 연결 시 TODO 부분 교체)
// ────────────────────────────────────────────────────────────────────────────
const Mp3Section = () => {
  const [urls, setUrls] = useState<string[]>(Array(10).fill(""));
  const [converting, setConverting] = useState(false);
  const [jobStatus, setJobStatus] = useState<"idle" | "running" | "done">("idle");

  const filledCount = urls.filter((u) => u.trim()).length;

  const handleChange = (i: number, val: string) => {
    const next = [...urls];
    next[i] = val;
    setUrls(next);
  };

  const handleConvert = async () => {
    const active = urls.filter((u) => u.trim());
    if (!active.length) return;
    setConverting(true);
    setJobStatus("running");
    // TODO: 서버 연결 시 교체
    // const res = await fetch("http://localhost:3001/api/mp3", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ urls: active }),
    // });
    await new Promise((r) => setTimeout(r, 1500)); // 임시 딜레이
    setJobStatus("done");
    setConverting(false);
  };

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Music4 className="w-5 h-5 text-purple-500" />
            MP3 추출
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1 rounded-full">
            <Link2 className="h-3 w-3" />
            {filledCount} / 10
          </div>
        </div>
        <p className="text-xs text-muted-foreground">YouTube URL을 입력하면 MP3로 추출합니다</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-52">
          <div className="space-y-2 pr-2">
            {urls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <span className="text-[10px] font-mono text-muted-foreground/60 w-5 text-right shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Input
                  value={url}
                  onChange={(e) => handleChange(i, e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={cn(
                    "h-7 text-xs bg-white/5 border-border transition-all",
                    url.trim() && "border-purple-500/40 bg-purple-500/5"
                  )}
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleConvert}
            disabled={converting || filledCount === 0}
            className="flex-1 h-8 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {converting
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />변환 중...</>
              : <><Music4 className="h-3.5 w-3.5" />{filledCount}개 MP3 추출</>
            }
          </Button>
          {jobStatus === "done" && (
            <Badge className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              완료 — 서버 연결 후 다운로드 가능
            </Badge>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-500/80">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>로컬 서버(<code>node server/index.js</code>) 실행 후 사용 가능합니다</span>
        </div>
      </CardContent>
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// 영상 자동 생성 섹션 (UI only)
// ────────────────────────────────────────────────────────────────────────────
const VideoCreatorSection = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);

  const handleCreate = async () => {
    if (!audioFile || !coverFile) return;
    setCreating(true);
    setDone(false);
    // TODO: 서버 연결 시 교체
    // const form = new FormData();
    // form.append("audio", audioFile);
    // form.append("cover", coverFile);
    // const res = await fetch("http://localhost:3001/api/video", { method: "POST", body: form });
    await new Promise((r) => setTimeout(r, 1500));
    setDone(true);
    setCreating(false);
  };

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Film className="w-5 h-5 text-sky-500" />
          영상 자동 생성
        </CardTitle>
        <p className="text-xs text-muted-foreground">MP3 + 커버 이미지 → 유튜브 업로드용 MP4</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 오디오 파일 */}
        <label className={cn(
          "flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 cursor-pointer transition-colors",
          audioFile ? "border-sky-500/40 bg-sky-500/5" : "border-border hover:border-muted-foreground/40"
        )}>
          <Music4 className={cn("h-4 w-4 shrink-0", audioFile ? "text-sky-500" : "text-muted-foreground")} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              {audioFile ? audioFile.name : "MP3 파일 선택"}
            </p>
            <p className="text-[10px] text-muted-foreground">.mp3 파일을 업로드하세요</p>
          </div>
          <input type="file" accept=".mp3,audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
        </label>

        {/* 커버 이미지 */}
        <label className={cn(
          "flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 cursor-pointer transition-colors",
          coverFile ? "border-sky-500/40 bg-sky-500/5" : "border-border hover:border-muted-foreground/40"
        )}>
          <Upload className={cn("h-4 w-4 shrink-0", coverFile ? "text-sky-500" : "text-muted-foreground")} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              {coverFile ? coverFile.name : "커버 이미지 선택"}
            </p>
            <p className="text-[10px] text-muted-foreground">JPG / PNG (1920×1080 권장)</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
        </label>

        <Button
          onClick={handleCreate}
          disabled={creating || !audioFile || !coverFile}
          className="w-full h-8 text-xs gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
        >
          {creating
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />생성 중...</>
            : <><Film className="h-3.5 w-3.5" />MP4 생성</>
          }
        </Button>

        {done && (
          <Badge className="w-full justify-center py-1.5 text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            완료 — 서버 연결 후 MP4 다운로드 가능
          </Badge>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-500/80">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>로컬 서버(<code>node server/index.js</code>) 실행 후 사용 가능합니다</span>
        </div>
      </CardContent>
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// 메인 대시보드
// ────────────────────────────────────────────────────────────────────────────
const YouTubeDashboard = () => {
  const { token, gisReady, isSignedIn, signIn, signOut } = useYouTubeAuth();
  const { channel, videos, loading: chLoading, refetch } = useYouTubeChannel(token);
  const { data: analyticsData, loading: analyticsLoading, totalViews, totalWatchMinutes, avgCTR } =
    useYouTubeAnalytics(token);

  const loading = chLoading || analyticsLoading;

  if (!isSignedIn) {
    return (
      <div className="px-5 pt-5 pb-8">
        <LoginScreen onSignIn={signIn} loading={!gisReady} />
      </div>
    );
  }

  return (
    <div className="px-3 pt-4 pb-8 md:px-5 md:pt-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {channel?.thumbnail && (
            <img src={channel.thumbnail} alt="channel" className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 ring-red-500/30 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
                {channel?.title ?? "내 채널"}
              </h2>
              <Youtube className="h-5 w-5 text-red-500 shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">채널 통계 대시보드</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-8 gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">새로고침</span>
          </Button>
          <Button variant="outline" size="sm" onClick={signOut} className="h-8 gap-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">로그아웃</span>
          </Button>
        </div>
      </div>

      {/* 채널 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />
          ))
        ) : (
          <>
            <StatCard icon={Users} label="구독자" value={fmt(channel?.subscriberCount ?? 0)} color="bg-red-500/20" />
            <StatCard icon={Eye} label="총 조회수" value={fmt(channel?.viewCount ?? 0)} color="bg-blue-500/20" />
            <StatCard icon={Video} label="영상 수" value={channel?.videoCount ?? 0} color="bg-purple-500/20" />
            <StatCard icon={Eye} label="조회수 (28일)" value={fmt(totalViews)} sub="최근 28일" color="bg-orange-500/20" />
            <StatCard icon={Clock} label="시청시간 (28일)" value={`${Math.round(totalWatchMinutes / 60)}h`} sub="최근 28일" color="bg-emerald-500/20" />
            <StatCard icon={MousePointerClick} label="평균 CTR" value={`${avgCTR}%`} sub="최근 28일" color="bg-cyan-500/20" />
          </>
        )}
      </div>

      {/* 분석 차트 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">분석</h3>
        <div className="flex-1 h-px bg-border" />
      </div>

      {analyticsLoading ? (
        <div className="grid grid-cols-3 gap-5 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : analyticsData.length > 0 ? (
        <AnalyticsCharts data={analyticsData} />
      ) : null}

      {/* 최근 영상 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">최근 영상</h3>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="mb-6">
        <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
          <CardContent className="pt-4">
            <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border px-2 gap-3 sm:gap-4">
              <span className="w-14 sm:w-16" />
              <span>제목</span>
              <span className="text-right">조회수</span>
              <span className="hidden sm:block text-right">좋아요</span>
              <span className="hidden sm:block text-right">댓글</span>
            </div>
            <ScrollArea className="h-64">
              {chLoading ? (
                <div className="space-y-2 pt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">영상이 없습니다</div>
              ) : (
                <div className="space-y-0.5 pt-1">
                  {videos.map((v) => (
                    <a
                      key={v.id}
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 sm:gap-4 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <img src={v.thumbnail} alt={v.title} className="w-14 h-8 sm:w-16 sm:h-9 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-red-400 transition-colors">
                          {v.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(v.publishedAt).toLocaleDateString("ko-KR")} · {v.duration}
                        </p>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground text-right whitespace-nowrap">
                        <Eye className="inline h-3 w-3 mr-0.5" />{fmt(v.viewCount)}
                      </span>
                      <span className="hidden sm:block text-sm font-mono text-muted-foreground text-right whitespace-nowrap">
                        <ThumbsUp className="inline h-3 w-3 mr-0.5" />{fmt(v.likeCount)}
                      </span>
                      <span className="hidden sm:block text-sm font-mono text-muted-foreground text-right whitespace-nowrap">
                        <MessageSquare className="inline h-3 w-3 mr-0.5" />{fmt(v.commentCount)}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* MP3 + 영상 자동화 섹션 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">자동화 도구</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Mp3Section />
        <VideoCreatorSection />
      </div>
    </div>
  );
};

export default YouTubeDashboard;
