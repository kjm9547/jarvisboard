import { useState } from "react";
import { Check, Plus, Trash2, Target, Sparkles, Zap, Flame, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoals, type Timeframe, type Goal } from "@/hooks/useGoals";
import { cn } from "@/lib/utils";

// ─── Column config ───────────────────────────────────────────────────────────

interface ColConfig {
  tf: Timeframe;
  label: string;
  sub: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  border: string;
  hoverBg: string;
  numColor: string;
  checkActive: string;
  checkHover: string;
  addBtn: string;
  badge: string;
}

const GOAL_COLS: ColConfig[] = [
  {
    tf: "long", label: "장기 목표", sub: "5년 이상",
    Icon: Sparkles,
    iconColor: "text-violet-400", iconBg: "bg-violet-500/15",
    border: "border-l-violet-500/70",
    hoverBg: "hover:bg-violet-500/5",
    numColor: "text-violet-400/50",
    checkActive: "text-violet-400 bg-violet-500/20 border-violet-400",
    checkHover: "border-muted-foreground/30 hover:border-violet-400",
    addBtn: "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20",
    badge: "bg-violet-500/15 text-violet-400",
  },
  {
    tf: "medium", label: "중기 목표", sub: "1 ~ 5년",
    Icon: Target,
    iconColor: "text-sky-400", iconBg: "bg-sky-500/15",
    border: "border-l-sky-500/70",
    hoverBg: "hover:bg-sky-500/5",
    numColor: "text-sky-400/50",
    checkActive: "text-sky-400 bg-sky-500/20 border-sky-400",
    checkHover: "border-muted-foreground/30 hover:border-sky-400",
    addBtn: "bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20",
    badge: "bg-sky-500/15 text-sky-400",
  },
  {
    tf: "short", label: "단기 목표", sub: "1년 이내",
    Icon: Zap,
    iconColor: "text-amber-400", iconBg: "bg-amber-500/15",
    border: "border-l-amber-500/70",
    hoverBg: "hover:bg-amber-500/5",
    numColor: "text-amber-400/50",
    checkActive: "text-amber-400 bg-amber-500/20 border-amber-400",
    checkHover: "border-muted-foreground/30 hover:border-amber-400",
    addBtn: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-400",
  },
];

// ─── Inline edit helpers ─────────────────────────────────────────────────────

interface EditState {
  title: string;
  memo: string;
}

const useInlineEdit = (goal: Goal, onUpdate: (p: Partial<Pick<Goal, "title" | "memo">>) => void) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditState>({ title: goal.title, memo: goal.memo ?? "" });

  const open = () => { setDraft({ title: goal.title, memo: goal.memo ?? "" }); setEditing(true); };
  const close = () => setEditing(false);
  const save = () => {
    const t = draft.title.trim();
    if (!t) return;
    onUpdate({ title: t, memo: draft.memo.trim() || null });
    setEditing(false);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
    if (e.key === "Escape") close();
  };

  return { editing, draft, setDraft, open, close, save, onKey };
};

// ─── EditForm ────────────────────────────────────────────────────────────────

interface EditFormProps {
  draft: EditState;
  setDraft: (d: EditState) => void;
  onKey: (e: React.KeyboardEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  focusClass?: string;
}

const EditForm = ({ draft, setDraft, onKey, onSave, onCancel, focusClass = "focus:ring-foreground/20" }: EditFormProps) => (
  <div className="space-y-1.5 w-full">
    <input
      autoFocus
      value={draft.title}
      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      onKeyDown={onKey}
      className={cn(
        "w-full text-sm bg-muted/50 border border-border rounded-md px-2.5 py-1.5 text-foreground outline-none focus:ring-1",
        focusClass
      )}
    />
    <textarea
      value={draft.memo}
      onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
      onKeyDown={onKey}
      placeholder="메모 (선택)"
      rows={2}
      className={cn(
        "w-full text-xs bg-muted/50 border border-border rounded-md px-2.5 py-1.5 text-muted-foreground outline-none focus:ring-1 resize-none placeholder:text-muted-foreground/40",
        focusClass
      )}
    />
    <div className="flex gap-1.5">
      <button onClick={onSave} className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-foreground/10 hover:bg-foreground/15 text-foreground transition-colors">저장</button>
      <button onClick={onCancel} className="text-[10px] px-2.5 py-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">취소</button>
    </div>
  </div>
);

// ─── BucketCard ──────────────────────────────────────────────────────────────

interface BucketCardProps {
  goal: Goal;
  index: number;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Pick<Goal, "title" | "memo">>) => void;
}

const BucketCard = ({ goal, index, onToggle, onRemove, onUpdate }: BucketCardProps) => {
  const { editing, draft, setDraft, open, close, save, onKey } = useInlineEdit(goal, onUpdate);

  return (
    <div className={cn(
      "group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200",
      "hover:shadow-lg hover:ring-1 hover:ring-amber-500/25 hover:-translate-y-0.5",
      goal.completed && "opacity-65"
    )}>
      {/* Top gradient strip */}
      <div className="h-1 bg-linear-to-r from-amber-400/60 via-orange-400/30 to-transparent" />

      <div className="p-4 relative min-h-28">
        {/* Watermark number */}
        <div className="absolute right-3 bottom-3 text-6xl font-black text-foreground/[0.05] font-mono leading-none select-none pointer-events-none">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Top row */}
        <div className="flex items-center justify-between h-5 mb-2.5">
          <span className="text-[10px] font-bold font-mono text-amber-500/60 tracking-wider">
            NO.{String(index + 1).padStart(2, "0")}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={open}
              className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={onRemove}
              className="p-1 rounded text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {editing ? (
          <EditForm
            draft={draft}
            setDraft={setDraft}
            onKey={onKey}
            onSave={save}
            onCancel={close}
            focusClass="focus:ring-amber-500/30"
          />
        ) : (
          <>
            <p
              className={cn(
                "text-sm font-semibold text-foreground leading-snug mb-1.5 pr-6 cursor-default",
                goal.completed && "line-through text-muted-foreground"
              )}
              onDoubleClick={open}
            >
              {goal.title}
            </p>
            {goal.memo && (
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3 pr-6">
                {goal.memo}
              </p>
            )}
            <button
              onClick={onToggle}
              className={cn(
                "mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-all",
                goal.completed
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-muted/50 text-muted-foreground hover:bg-amber-500/15 hover:text-amber-400"
              )}
            >
              {goal.completed
                ? <><Check className="w-3.5 h-3.5" strokeWidth={3} />달성 완료</>
                : "달성하기"
              }
            </button>
          </>
        )}
      </div>

      {/* DONE stamp */}
      {goal.completed && !editing && (
        <div className="absolute top-4 right-4 rotate-12 pointer-events-none">
          <div className="border-2 border-emerald-500/40 rounded-md px-2 py-0.5 bg-emerald-500/5">
            <p className="text-emerald-500/70 font-black text-[9px] tracking-[0.2em]">DONE</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── AddBucketForm ───────────────────────────────────────────────────────────

const AddBucketForm = ({ onAdd }: { onAdd: (t: string, m: string) => Promise<void> }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await onAdd(title.trim(), memo.trim());
    setTitle(""); setMemo(""); setLoading(false); setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === "Escape") { setOpen(false); setTitle(""); setMemo(""); }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-2 w-full rounded-2xl border border-dashed border-amber-500/30 hover:border-amber-500/50 bg-transparent hover:bg-amber-500/5 text-amber-400/60 hover:text-amber-400 transition-all min-h-28 text-sm font-medium"
      >
        <Plus className="w-5 h-5" />
        항목 추가
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-card p-4 space-y-2.5">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKey}
        placeholder="꼭 해보고 싶은 것은?"
        className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-amber-500/30 placeholder:text-muted-foreground/50"
      />
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onKeyDown={onKey}
        placeholder="메모 / 상세 내용 (선택)"
        rows={2}
        className="w-full text-xs bg-muted/50 border border-border rounded-lg px-3 py-2 text-muted-foreground outline-none focus:ring-1 focus:ring-amber-500/30 resize-none placeholder:text-muted-foreground/40"
      />
      <div className="flex gap-1.5">
        <Button size="sm" className="h-7 text-xs" onClick={submit} disabled={!title.trim() || loading}>
          {loading ? "추가 중..." : "추가"}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setOpen(false); setTitle(""); setMemo(""); }}>
          취소
        </Button>
      </div>
    </div>
  );
};

// ─── GoalCard ────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal: Goal;
  index: number;
  config: ColConfig;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Pick<Goal, "title" | "memo">>) => void;
}

const GoalCard = ({ goal, index, config, onToggle, onRemove, onUpdate }: GoalCardProps) => {
  const { editing, draft, setDraft, open, close, save, onKey } = useInlineEdit(goal, onUpdate);

  return (
    <div className={cn(
      "group relative rounded-xl border border-border/60 bg-card overflow-hidden border-l-[3px]",
      config.border,
      config.hoverBg,
      "transition-all duration-150 hover:shadow-md hover:border-border",
      goal.completed && "opacity-55"
    )}>
      <div className="px-3 py-2.5 flex items-start gap-2.5">
        {/* Number */}
        <span className={cn("text-[10px] font-black font-mono mt-0.5 shrink-0 tabular-nums leading-none", config.numColor)}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
            goal.completed ? config.checkActive : config.checkHover
          )}
        >
          {goal.completed && <Check className="w-2.5 h-2.5" strokeWidth={3.5} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <EditForm
              draft={draft}
              setDraft={setDraft}
              onKey={onKey}
              onSave={save}
              onCancel={close}
            />
          ) : (
            <>
              <p
                className={cn(
                  "text-sm font-medium text-foreground leading-snug cursor-default",
                  goal.completed && "line-through text-muted-foreground"
                )}
                onDoubleClick={open}
              >
                {goal.title}
              </p>
              {goal.memo && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                  {goal.memo}
                </p>
              )}
            </>
          )}
        </div>

        {!editing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 shrink-0 mt-0.5">
            <button
              onClick={open}
              className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={onRemove}
              className="p-1 rounded text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── AddGoalForm ─────────────────────────────────────────────────────────────

interface AddGoalFormProps {
  config: ColConfig;
  onAdd: (t: string, m: string) => Promise<void>;
}

const AddGoalForm = ({ config, onAdd }: AddGoalFormProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await onAdd(title.trim(), memo.trim());
    setTitle(""); setMemo(""); setLoading(false); setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === "Escape") { setOpen(false); setTitle(""); setMemo(""); }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
          config.addBtn
        )}
      >
        <Plus className="w-4 h-4" />
        목표 추가
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKey}
        placeholder="목표를 입력하세요..."
        className="w-full text-sm bg-muted/50 border border-border rounded-md px-2.5 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50"
      />
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onKeyDown={onKey}
        placeholder="메모 / 상세 내용 (선택)"
        rows={2}
        className="w-full text-xs bg-muted/50 border border-border rounded-md px-2.5 py-1.5 text-muted-foreground outline-none focus:ring-1 focus:ring-foreground/20 resize-none placeholder:text-muted-foreground/40"
      />
      <div className="flex gap-1.5">
        <Button size="sm" className="h-7 text-xs" onClick={submit} disabled={!title.trim() || loading}>
          {loading ? "추가 중..." : "추가"}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setOpen(false); setTitle(""); setMemo(""); }}>
          취소
        </Button>
      </div>
    </div>
  );
};

// ─── GoalsDashboard ──────────────────────────────────────────────────────────

export const GoalsDashboard = () => {
  const { goals, loading, addGoal, updateGoal, removeGoal, byTimeframe } = useGoals();

  const nonBucket = goals.filter((g) => g.timeframe !== "bucket");
  const doneCount = nonBucket.filter((g) => g.completed).length;
  const pct = nonBucket.length > 0 ? Math.round((doneCount / nonBucket.length) * 100) : 0;

  const bucketGoals = byTimeframe("bucket");
  const bucketDone = bucketGoals.filter((g) => g.completed).length;

  return (
    <div className="px-3 pt-4 pb-8 md:px-5 md:pt-5">
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-2 mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">꿈 & 목표</h2>
          <p className="text-sm text-muted-foreground">인생의 방향을 설정하고 꿈을 기록하세요</p>
        </div>
        {!loading && nonBucket.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">목표 달성률</p>
              <p className="text-sm font-bold font-mono text-foreground">
                {doneCount} / {nonBucket.length}
              </p>
            </div>
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle r={14} cx={18} cy={18} fill="none" stroke="currentColor"
                  strokeWidth={3.5} className="text-muted/30" />
                <circle r={14} cx={18} cy={18} fill="none" stroke="currentColor"
                  strokeWidth={3.5} className="text-violet-500"
                  strokeDasharray={`${(pct / 100) * 2 * Math.PI * 14} ${2 * Math.PI * 14}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
                {pct}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bucket List ── */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-500/15 p-2 shrink-0">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">버킷 리스트</h3>
              <p className="text-[10px] text-muted-foreground">죽기 전에 꼭 해보고 싶은 것들</p>
            </div>
          </div>
          {bucketGoals.length > 0 && (
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-mono">
              {bucketDone} / {bucketGoals.length} 달성
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bucketGoals.map((goal, i) => (
              <BucketCard
                key={goal.id}
                goal={goal}
                index={i}
                onToggle={() => updateGoal(goal.id, { completed: !goal.completed })}
                onRemove={() => removeGoal(goal.id)}
                onUpdate={(patch) => updateGoal(goal.id, patch)}
              />
            ))}
            <AddBucketForm
              onAdd={(t, m) => addGoal(t, "bucket", m || undefined).then(() => {})}
            />
          </div>
        )}
      </div>

      {/* ── Goals columns ── */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">목표</h3>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {GOAL_COLS.map((col) => {
          const colGoals = byTimeframe(col.tf);
          const done = colGoals.filter((g) => g.completed).length;
          const sorted = [
            ...colGoals.filter((g) => !g.completed),
            ...colGoals.filter((g) => g.completed),
          ];

          return (
            <div key={col.tf} className="flex flex-col gap-2.5">
              {/* Column header */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-border">
                <div className={cn("rounded-lg p-1.5 shrink-0", col.iconBg)}>
                  <col.Icon className={cn("w-4 h-4", col.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{col.sub}</p>
                </div>
                {colGoals.length > 0 && (
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 font-mono", col.badge)}>
                    {done}/{colGoals.length}
                  </span>
                )}
              </div>

              {/* Cards */}
              {loading ? (
                <div className="space-y-1.5">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-11 rounded-xl bg-muted/25 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sorted.map((goal, i) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      index={i}
                      config={col}
                      onToggle={() => updateGoal(goal.id, { completed: !goal.completed })}
                      onRemove={() => removeGoal(goal.id)}
                      onUpdate={(patch) => updateGoal(goal.id, patch)}
                    />
                  ))}
                  {colGoals.length === 0 && (
                    <p className="text-xs text-muted-foreground/40 text-center py-6">
                      아직 목표가 없습니다
                    </p>
                  )}
                </div>
              )}

              <AddGoalForm
                config={col}
                onAdd={(t, m) => addGoal(t, col.tf, m || undefined).then(() => {})}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
