import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, X } from "lucide-react";
import parse from "html-react-parser";
import type { News } from "./types";

interface NewsDetailPanelProps {
  news: News;
  onClose: () => void;
}

export const NewsDetailPanel = ({ news, onClose }: NewsDetailPanelProps) => {
  return (
    <Card
      key={news.id}
      className="animate-in fade-in slide-in-from-left-3 duration-300 p-0 gap-0"
    >
      <CardHeader className="border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-primary border-primary/30 bg-primary/10 shrink-0"
              >
                AI 요약
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(news.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <CardTitle className="text-base leading-snug text-foreground">
              {news.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" asChild>
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="원본 기사 열기"
              >
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
        <CardContent className="px-6 py-5 space-y-5">
          {news.image_url && (
            <div className="w-full overflow-hidden rounded-xl border border-border">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full max-h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement!.style.display = "none";
                }}
              />
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              AI 요약
            </p>
            <p className="text-sm text-foreground leading-7 whitespace-pre-wrap">
              {news.summary}
            </p>
          </div>

          {news.description && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  원문 발췌
                </p>
                <div className="text-sm text-muted-foreground leading-7 [&_p]:mb-2 [&_a]:text-primary [&_a]:underline">
                  {parse(news.description)}
                </div>
              </div>
            </>
          )}

          <Separator />
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline"
          >
            원본 기사 전체 읽기 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
