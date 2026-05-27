import { useState, useEffect } from "react";
import { supabase } from "@/service/supabase";

export interface Transaction {
  id: string;
  created_at: string;
  transaction_at: string;
  merchant: string;
  amount: number;
  type: "expense" | "income";
  status: string;
  source: string;
  user_id: string;
  category: string | null;
  note: string | null;
}

export interface ParsedRow {
  transaction_at: string;
  merchant: string;
  amount: number;
  type: "expense" | "income";
  status: string;
  source: string;
}

const parseAmount = (raw: string): number => {
  const cleaned = raw.replace(/[^0-9\-+]/g, "");
  return parseInt(cleaned, 10) || 0;
};

export const parseXlsxRows = (rows: unknown[][]): ParsedRow[] => {
  return rows
    .slice(1)
    .filter((row) => row[0] && row[1] && row[2])
    .map((row) => {
      const amount = parseAmount(String(row[2]));
      return {
        transaction_at: String(row[0]),
        merchant: String(row[1]).trim(),
        amount,
        type: amount < 0 ? "expense" : "income",
        status: String(row[3] ?? ""),
        source: "kakaopay",
      };
    });
};

export const useExpenseData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (): Promise<Transaction[]> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_at", { ascending: false });

    const rows = (!error && data) ? (data as Transaction[]) : [];
    setTransactions(rows);
    setLoading(false);
    return rows;
  };

  const saveTransactions = async (rows: ParsedRow[]): Promise<{ inserted: number; skipped: number; fresh: Transaction[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { inserted: 0, skipped: 0, fresh: [] };

    const payload = rows.map((r) => ({ ...r, user_id: user.id }));

    const { data, error } = await supabase
      .from("transactions")
      .upsert(payload, {
        onConflict: "user_id,transaction_at,merchant,amount",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) throw error;

    const inserted = data?.length ?? 0;
    const skipped = rows.length - inserted;
    const fresh = await fetchTransactions();
    return { inserted, skipped, fresh };
  };

  const updateTransactionMeta = async (
    id: string,
    fields: { category?: string | null; note?: string | null }
  ) => {
    const { error } = await supabase
      .from("transactions")
      .update(fields)
      .eq("id", id);
    if (error) throw error;
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...fields } : t))
    );
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 일별 통계
  const dailyStats = (() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const date = t.transaction_at.slice(0, 10);
        map[date] = (map[date] ?? 0) + Math.abs(t.amount);
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30);
  })();

  // 주별 통계
  const weeklyStats = (() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const d = new Date(t.transaction_at);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay() + 1);
        const key = weekStart.toISOString().slice(0, 10);
        map[key] = (map[key] ?? 0) + Math.abs(t.amount);
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);
  })();

  // 월별 통계
  const monthlyStats = (() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const key = t.transaction_at.slice(0, 7);
        map[key] = (map[key] ?? 0) + Math.abs(t.amount);
      });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  })();

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const thisMonthExpense = (() => {
    const ym = new Date().toISOString().slice(0, 7);
    return transactions
      .filter((t) => t.type === "expense" && t.transaction_at.startsWith(ym))
      .reduce((s, t) => s + Math.abs(t.amount), 0);
  })();

  return {
    transactions,
    loading,
    dailyStats,
    weeklyStats,
    monthlyStats,
    totalExpense,
    totalIncome,
    thisMonthExpense,
    saveTransactions,
    fetchTransactions,
    updateTransactionMeta,
  };
};
