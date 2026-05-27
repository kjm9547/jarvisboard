import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/service/supabase";

export type Timeframe = "short" | "medium" | "long" | "bucket";

export interface Goal {
  id: string;
  title: string;
  memo: string | null;
  timeframe: Timeframe;
  completed: boolean;
  created_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("goals")
      .select("id, title, memo, timeframe, completed, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (data) setGoals(data as Goal[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const addGoal = async (title: string, timeframe: Timeframe, memo?: string): Promise<Goal | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("goals")
      .insert({ title: title.trim(), timeframe, memo: memo?.trim() || null, user_id: user.id })
      .select("id, title, memo, timeframe, completed, created_at")
      .single();

    if (error || !data) return null;
    const newGoal = data as Goal;
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = async (id: string, patch: Partial<Pick<Goal, "title" | "memo" | "completed">>) => {
    const { error } = await supabase
      .from("goals")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    }
  };

  const removeGoal = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const byTimeframe = (tf: Timeframe) => goals.filter((g) => g.timeframe === tf);

  return { goals, loading, addGoal, updateGoal, removeGoal, byTimeframe };
};
