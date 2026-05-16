import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Music4, Link2, AlertTriangle } from "lucide-react"; // 아이콘 라이브러리 (lucide-react) 사용 권장

const YoutubeDashboard = () => {
  // 20개의 빈 문자열로 초기화된 배열 상태
  const [urls, setUrls] = useState(Array(20).fill(""));
  const [loading, setLoading] = useState(false);

  // 입력값 변경 핸들러
  const handleInputChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  // API 호출 핸들러 (UI 로직만 구현됨)
  const handleConvert = async () => {
    const activeUrls = urls.filter((url) => url.trim() !== "");

    if (activeUrls.length === 0) {
      alert("적어도 하나의 유튜브 링크를 입력해주세요!");
      return;
    }

    setLoading(true);
    try {
      // 실제 API 엔드포인트로 변경 필요
      console.log("변환 시작:", activeUrls);

      // 예시: await fetch('/api/convert', { method: 'POST', body: JSON.stringify({ urls: activeUrls }) })

      // 임시로 대기 시간을 줌 (성공 가정)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `${activeUrls.length}개의 파일 변환 요청을 보냈습니다. 백엔드 처리가 완료되면 다운로드됩니다.`
      );
    } catch (error) {
      console.error("오류 발생:", error);
      alert("변환 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 입력된 링크 개수 카운트
  const filledCount = urls.filter((url) => url.trim() !== "").length;

  return (
    <div className="p-6 md:p-10 bg-background min-h-screen font-sans">
      <Card className="max-w-4xl mx-auto shadow-lg border-muted">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b border-muted/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Music4 className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                유튜브 MP3 대량 변환기
              </CardTitle>
              <CardDescription className="text-muted-foreground pt-1">
                최대 20개의 유튜브 링크를 입력하여 일괄적으로 MP3로 변환하세요.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-baseline gap-1 text-sm font-medium text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <Link2 className="h-4 w-4 text-primary" />
            <span>{filledCount}</span> / <span className="text-xs">20</span>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mb-4">
            <Label className="text-sm font-semibold text-foreground/80 pl-9 hidden md:block">
              링크 입력 (1~10)
            </Label>
            <Label className="text-sm font-semibold text-foreground/80 pl-9 hidden md:block">
              링크 입력 (11~20)
            </Label>
          </div>

          <ScrollArea className="h-[450px] pr-4 -mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-1">
              {urls.map((url, index) => (
                <div
                  key={index}
                  className="relative flex items-center gap-3 group transition-all duration-200"
                >
                  <span className="text-sm font-mono text-muted-foreground/70 w-7 text-right group-hover:text-primary group-hover:font-bold transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className={`flex-1 transition-all duration-150 ${url.trim() ? "border-primary/50 bg-primary/5" : "border-input hover:border-muted-foreground/50"}`}
                  />
                  {url.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        <Separator className="my-2" />

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-6">
          <div className="flex items-start gap-2.5 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900 w-full sm:w-auto">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">주의사항</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                대량 변환은 시간이 소요될 수 있습니다. 본인의 개인 대시보드
                용도로만 사용하세요.
              </p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleConvert}
            disabled={loading || filledCount === 0}
            className="w-full sm:w-auto px-10 h-14 text-base font-semibold transition-all duration-150 hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                변환 요청 중...
              </>
            ) : (
              `총 ${filledCount}개 MP3 변환 시작`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default YoutubeDashboard;
