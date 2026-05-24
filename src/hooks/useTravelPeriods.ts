import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/service/superbase";

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
  };

  const tagTransactions = async (txIds: string[], periodId: string) => {
    // Optimistic update
    setTags((prev) => {
      const next = { ...prev };
      txIds.forEach((id) => { next[id] = periodId; });
      return next;
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = txIds.map((txId) => ({ tx_id: txId, period_id: periodId, user_id: user.id }));
    await supabase
      .from("travel_tags")
      .upsert(rows, { onConflict: "tx_id,period_id" });
  };

  const untagTransactions = async (txIds: string[]) => {
    // Optimistic update
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

  return {
    periods,
    tags,
    loading,
    addPeriod,
    removePeriod,
    tagTransactions,
    untagTransactions,
    getTaggedPeriod,
    getDateRangePeriod,
    refetch: fetchAll,
  };
};
