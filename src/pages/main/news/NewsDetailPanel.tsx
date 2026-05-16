import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import parse from "html-react-parser";
import type { News } from "./types";

interface NewsDetailPanelProps {
  news: News;
}

export const NewsDetailPanel = ({ news }: NewsDetailPanelProps) => {
  return (
    <div
      key={news.id}
      className="w-90 shrink-0 hidden lg:block animate-in slide-in-from-right-4 fade-in duration-300"
    >
      <Card className="sticky top-16.5">
        <CardHeader className="border-b border-border">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{news.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="shrink-0 mt-0.5"
            >
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="원본 기사 열기"
              >
                <ExternalLink />
              </a>
            </Button>
          </div>
          <CardDescription>
            {new Date(news.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <CardContent className="py-4 space-y-5">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                AI 요약
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {news.summary}
              </p>
            </div>

            {news.description && (
              <>
                <Separator />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    원문 발췌
                  </p>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {parse(news.description)}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};
