import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseXlsxRows, type ParsedRow } from "@/hooks/useExpenseData";
import * as XLSX from "xlsx";

interface Props {
  onSave: (rows: ParsedRow[]) => Promise<{ inserted: number; skipped: number }>;
}

type Status = "idle" | "parsed" | "saving" | "done" | "error";

export const ExpenseUploadCard = ({ onSave }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const processFile = (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setErrorMsg("xlsx 또는 xls 파일만 업로드 가능합니다.");
      setStatus("error");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
        const parsed = parseXlsxRows(rows);
        setPreview(parsed);
        setStatus("parsed");
      } catch {
        setErrorMsg("파일을 읽을 수 없습니다. 비밀번호가 설정된 파일은 먼저 비밀번호를 제거해주세요.");
        setStatus("error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = async () => {
    setStatus("saving");
    try {
      const r = await onSave(preview);
      setResult(r);
      setStatus("done");
    } catch {
      setErrorMsg("저장 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setFileName("");
    setPreview([]);
    setResult(null);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const expenseCount = preview.filter((r) => r.type === "expense").length;
  const incomeCount = preview.filter((r) => r.type === "income").length;
  const totalAmount = preview
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + Math.abs(r.amount), 0);

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
          내역 가져오기
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          카카오페이 xlsx 파일을 드래그하거나 클릭해서 업로드하세요
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 비밀번호 안내 */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-500 leading-relaxed">
            비밀번호가 설정된 파일은 Excel에서 <strong>다른 이름으로 저장</strong> →{" "}
            <strong>도구 → 일반 옵션 → 비밀번호 삭제</strong> 후 업로드해주세요.
          </p>
        </div>

        {/* 드롭존 */}
        {(status === "idle" || status === "error") && (
          <div
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-white/5"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className={cn("h-8 w-8 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">파일을 여기에 드래그하거나 클릭</p>
              <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls 파일 지원</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive flex-1">{errorMsg}</p>
            <button onClick={handleReset} className="text-destructive hover:opacity-70">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 파싱 결과 미리보기 */}
        {status === "parsed" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="truncate max-w-48">{fileName}</span>
              </div>
              <button onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">지출</p>
                <p className="text-lg font-bold text-red-500">{expenseCount}건</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">수입/환급</p>
                <p className="text-lg font-bold text-emerald-500">{incomeCount}건</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">총 지출액</p>
                <p className="text-sm font-bold text-foreground">
                  {totalAmount.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 미리보기 테이블 */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 px-3 py-2 gap-2">
                <span>사용처</span>
                <span className="text-right">금액</span>
                <span className="text-right">유형</span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-border/50">
                {preview.slice(0, 20).map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center px-3 py-2 gap-2 hover:bg-white/5">
                    <span className="text-xs text-foreground truncate">{row.merchant}</span>
                    <span className={cn(
                      "text-xs font-mono font-bold whitespace-nowrap",
                      row.type === "expense" ? "text-red-500" : "text-emerald-500"
                    )}>
                      {row.type === "expense" ? "-" : "+"}{Math.abs(row.amount).toLocaleString()}원
                    </span>
                    <Badge variant="outline" className={cn(
                      "text-[10px] py-0 px-1.5",
                      row.type === "expense"
                        ? "border-red-500/30 text-red-500"
                        : "border-emerald-500/30 text-emerald-500"
                    )}>
                      {row.type === "expense" ? "지출" : "수입"}
                    </Badge>
                  </div>
                ))}
                {preview.length > 20 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    외 {preview.length - 20}건 더 있음
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full" onClick={handleSave}>
              {preview.length}건 Supabase에 저장
            </Button>
          </div>
        )}

        {status === "saving" && (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <span className="h-4 w-4 rounded-full border-2 border-muted border-t-primary animate-spin" />
            <span className="text-sm">저장 중...</span>
          </div>
        )}

        {status === "done" && result && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-500">저장 완료</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  신규 {result.inserted}건 저장 · 중복 {result.skipped}건 건너뜀
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleReset}>
              다른 파일 업로드
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
