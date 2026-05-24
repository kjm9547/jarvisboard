import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import parse from "html-react-parser";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ExternalLink, GitFork, Star, X } from "lucide-react";
import type { DevNewsItem } from "./useDevNewsData";
import { useDevNewsDetail } from "./useDevNewsDetail";

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

const SkeletonLines = ({ count = 8 }: { count?: number }) => (
  <div className="space-y-2.5 py-2">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="h-3 rounded bg-muted animate-pulse"
        style={{ width: `${55 + (i % 4) * 12}%` }}
      />
    ))}
  </div>
);

const BigTechContent = ({ item }: { item: DevNewsItem }) => {
  const company = item.company ? (COMPANY_CONFIG[item.company] ?? null) : null;

  return (
    <div className="space-y-5">
      {/* 메타 */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-center">
        {company && (
          <Badge variant="outline" className={cn("text-[11px]", company.color)}>
            {company.label}
          </Badge>
        )}
        {item.author && <span>by <span className="font-medium text-foreground">{item.author}</span></span>}
        <span>{timeAgo(item.createdAt)}</span>
      </div>

      {/* 썸네일 */}
      {item.thumbnail && (
        <div className="overflow-hidden rounded-xl border border-border">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full max-h-64 object-cover"
            onError={(e) => {
              e.currentTarget.parentElement!.style.display = "none";
            }}
          />
        </div>
      )}

      <Separator />

      {/* 본문 */}
      {item.content ? (
        <div
          className={cn(
            "text-sm leading-7 text-foreground",
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-6",
            "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2.5 [&_h2]:mt-5",
            "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4",
            "[&_p]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-7",
            "[&_code]:bg-muted [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono",
            "[&_pre]:bg-muted [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:border [&_pre]:border-border",
            "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs",
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1",
            "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:space-y-1",
            "[&_li]:text-muted-foreground [&_li]:leading-6",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:my-3",
            "[&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-3",
            "[&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:my-3",
            "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:font-semibold [&_th]:text-left",
            "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted-foreground",
            "[&_hr]:border-border [&_hr]:my-5",
            "[&_strong]:text-foreground [&_strong]:font-semibold",
            "[&_figure]:my-3 [&_figure]:overflow-hidden [&_figure]:rounded-xl",
            "[&_figcaption]:text-xs [&_figcaption]:text-muted-foreground [&_figcaption]:mt-1 [&_figcaption]:text-center",
          )}
        >
          {parse(item.content)}
        </div>
      ) : item.description ? (
        <p className="text-sm text-muted-foreground leading-7">{item.description}</p>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">본문이 없습니다</p>
      )}

      <Separator />
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary underline"
      >
        원문 전체 읽기 <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};

const GitHubContent = ({
  item,
  readme,
  isLoading,
  error,
}: {
  item: DevNewsItem;
  readme?: string;
  isLoading: boolean;
  error: string | null;
}) => {
  const [owner, repo] = item.title.split("/");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {item.language && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary/60 shrink-0" />
            {item.language}
          </span>
        )}
        {item.stars !== undefined && (
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-foreground">{item.stars.toLocaleString()}</span> stars
          </span>
        )}
        {item.forks !== undefined && (
          <span className="flex items-center gap-1.5">
            <GitFork className="h-4 w-4" />
            <span className="font-medium text-foreground">{item.forks.toLocaleString()}</span> forks
          </span>
        )}
      </div>

      {item.description && (
        <p className="text-base text-muted-foreground leading-relaxed border-l-2 border-border pl-4">
          {item.description}
        </p>
      )}

      <Separator />
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        README.md
      </p>

      {isLoading ? (
        <SkeletonLines count={12} />
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline"
          >
            GitHub에서 보기 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : readme ? (
        <div
          className={cn(
            "text-sm leading-7 text-foreground",
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-foreground",
            "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2.5 [&_h2]:mt-5 [&_h2]:text-foreground",
            "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground",
            "[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mb-1.5 [&_h4]:mt-3",
            "[&_p]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-7",
            "[&_code]:bg-muted [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono [&_code]:text-foreground",
            "[&_pre]:bg-muted [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:border [&_pre]:border-border",
            "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs",
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1",
            "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:space-y-1",
            "[&_li]:text-muted-foreground [&_li]:leading-6",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/40",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:my-3",
            "[&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-3",
            "[&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:my-3",
            "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:font-semibold [&_th]:text-left",
            "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted-foreground",
            "[&_hr]:border-border [&_hr]:my-5",
            "[&_strong]:text-foreground [&_strong]:font-semibold",
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {readme}
          </ReactMarkdown>
        </div>
      ) : null}

      <Separator />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{owner}</span>/{repo} · GitHub
      </p>
    </div>
  );
};

interface DevNewsDetailPanelProps {
  item: DevNewsItem;
  onClose: () => void;
}

export const DevNewsDetailPanel = ({ item, onClose }: DevNewsDetailPanelProps) => {
  const { detail, isLoading, error } = useDevNewsDetail(item);
  const company = item.company ? (COMPANY_CONFIG[item.company] ?? null) : null;
  const [owner, repo] = item.source === "github" ? item.title.split("/") : [];

  return (
    <Card className="sticky top-16.5 p-0 gap-0 animate-in fade-in slide-in-from-left-3 duration-300">
      <CardHeader className="border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {item.source === "bigtech" && company && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", company.color)}>
                  {company.label}
                </Badge>
              )}
              {item.source === "github" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 border-foreground/20 bg-foreground/5">
                  GitHub
                </Badge>
              )}
            </div>
            <h2 className="text-base font-semibold leading-snug text-foreground">
              {item.source === "github" ? (
                <>
                  <span className="text-muted-foreground font-normal">{owner}/</span>
                  {repo}
                </>
              ) : (
                item.title
              )}
            </h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="원본 열기">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="닫기">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea style={{ height: "calc(100vh - 256px)" }}>
        <CardContent className="px-6 py-5">
          {item.source === "bigtech" ? (
            <BigTechContent item={item} />
          ) : (
            <GitHubContent
              item={item}
              readme={detail.readme}
              isLoading={isLoading}
              error={error}
            />
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
