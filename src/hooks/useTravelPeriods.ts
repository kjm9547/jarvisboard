import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/service/supabase";
import type { Transaction } from "@/hooks/useExpenseData";

export interface TravelPeriod {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  budget?: number;
}

export const useTravelPeriods = () => {
  const [periods, setPeriods] = useState<TravelPeriod[]>([]);
  const [tags, setTags] = useState<Record<string, string>>({}); // txId → periodId
  const [loading, setLoading] = useState(true);
  const [pendingTag, setPendingTag] = useState<{ period: TravelPeriod; txIds: string[] } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 30초 후 배너 자동 닫힘
  useEffect(() => {
    if (pendingTag) {
      timerRef.current = setTimeout(() => setPendingTag(null), 30000);
      return () => clearTimeout(timerRef.current);
    }
  }, [pendingTag]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [periodsRes, tagsRes] = await Promise.all([
      supabase
        .from("travel_periods")
        .select("id, name, start_date, end_date, budget")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("travel_tags")
        .select("tx_id, period_id")
        .eq("user_id", user.id),
    ]);

    if (periodsRes.data) {
      setPeriods(periodsRes.data.map((p) => ({
        id: p.id,
        name: p.name,
        startDate: p.start_date,
        endDate: p.end_date,
        budget: p.budget ?? undefined,
      })));
    }

    if (tagsRes.data) {
      const tagMap: Record<string, string> = {};
      tagsRes.data.forEach(({ tx_id, period_id }: { tx_id: string; period_id: string }) => {
        tagMap[tx_id] = period_id;
      });
      setTags(tagMap);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addPeriod = async (
    name: string,
    startDate: string,
    endDate: string,
  ): Promise<TravelPeriod | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("travel_periods")
      .insert({ name: name.trim() || "여행", start_date: startDate, end_date: endDate, user_id: user.id })
      .select("id, name, start_date, end_date")
      .single();

    if (error || !data) return null;

    const newPeriod: TravelPeriod = {
      id: data.id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
    };
    setPeriods((prev) => [newPeriod, ...prev]);
    return newPeriod;
  };

  const updatePeriod = async (
    id: string,
    name: string,
    startDate: string,
    endDate: string,
  ): Promise<void> => {
    const trimmedName = name.trim() || "여행";
    const { error } = await supabase
      .from("travel_periods")
      .update({ name: trimmedName, start_date: startDate, end_date: endDate })
      .eq("id", id);

    if (!error) {
      setPeriods((prev) =>
        prev.map((p) => p.id === id ? { ...p, name: trimmedName, startDate, endDate } : p)
      );
    }
  };

  const removePeriod = async (id: string) => {
    await supabase.from("travel_periods").delete().eq("id", id);
    setPeriods((prev) => prev.filter((p) => p.id !== id));
    setTags((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((txId) => {
        if (next[txId] === id) delete next[txId];
      });
      return next;
    });
    if (pendingTag?.period.id === id) setPendingTag(null);
  };

  // 1거래 1여행: 기존 태그 제거 후 새 태그 삽입
  const tagTransactions = async (txIds: string[], periodId: string) => {
    setTags((prev) => {
      const next = { ...prev };
      txIds.forEach((id) => { next[id] = periodId; });
      return next;
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("travel_tags").delete().in("tx_id", txIds).eq("user_id", user.id);
    const rows = txIds.map((txId) => ({ tx_id: txId, period_id: periodId, user_id: user.id }));
    await supabase.from("travel_tags").insert(rows);
  };

  const untagTransactions = async (txIds: string[]) => {
    setTags((prev) => {
      const next = { ...prev };
      txIds.forEach((id) => { delete next[id]; });
      return next;
    });

    await supabase.from("travel_tags").delete().in("tx_id", txIds);
  };

  const getTaggedPeriod = (txId: string): TravelPeriod | undefined =>
    periods.find((p) => p.id === tags[txId]);

  const getDateRangePeriod = (dateStr: string): TravelPeriod | undefined => {
    const d = dateStr.slice(0, 10);
    return periods.find((p) => d >= p.startDate && d <= p.endDate);
  };

  // 날짜 범위 내 미태깅 거래가 있는 첫 번째 여행에 자동 태깅 배너를 띄운다.
  // newPeriod: addPeriod 직후 React 상태 반영 전에 호출할 때 명시적으로 전달
  const triggerAutoTag = (transactions: Transaction[], newPeriod?: TravelPeriod) => {
    const periodsToCheck = newPeriod ? [newPeriod, ...periods] : periods;
    for (const period of periodsToCheck) {
      const untagged = transactions.filter((t) => {
        const d = t.transaction_at.slice(0, 10);
        return (
          t.type === "expense" &&
          d >= period.startDate &&
          d <= period.endDate &&
          !tags[t.id]
        );
      });
      if (untagged.length > 0) {
        setPendingTag({ period, txIds: untagged.map((t) => t.id) });
        return;
      }
    }
  };

  const confirmPendingTag = () => {
    if (!pendingTag) return;
    tagTransactions(pendingTag.txIds, pendingTag.period.id);
    clearTimeout(timerRef.current);
    setPendingTag(null);
  };

  const dismissPendingTag = () => {
    clearTimeout(timerRef.current);
    setPendingTag(null);
  };

  return {
    periods,
    tags,
    loading,
    pendingTag,
    addPeriod,
    updatePeriod,
    removePeriod,
    tagTransactions,
    untagTransactions,
    getTaggedPeriod,
    getDateRangePeriod,
    triggerAutoTag,
    confirmPendingTag,
    dismissPendingTag,
    refetch: fetchAll,
  };
};
