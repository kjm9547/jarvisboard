import { useState, useEffect } from "react";
import { supabase } from "@/service/superbase";

export interface ProjectTask {
  id: string;
  title: string;
  status: "시작 전" | "진행 중" | "완료";
  milestone: string;
  assignee: string;
  startDate: string | null;
  dueDate: string | null;
  url: string;
}

export interface ProjectIssue {
  id: string;
  title: string;
  status: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  type: string;
  milestone: string;
  url: string;
}

export const useNotionProject = () => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("notion-project");
      if (fnError) throw fnError;
      setTasks(data.tasks ?? []);
      setIssues(data.issues ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 마일스톤별 태스크 집계
  const milestoneStats = (milestone: string) => {
    const t = tasks.filter((t) => t.milestone === milestone);
    return {
      total: t.length,
      done: t.filter((t) => t.status === "완료").length,
      inProgress: t.filter((t) => t.status === "진행 중").length,
      todo: t.filter((t) => t.status === "시작 전").length,
    };
  };

  // 현재 활성 마일스톤 (진행 중 태스크가 있거나, 가장 앞선 미완료 마일스톤)
  const MILESTONE_ORDER = ["M1 MVP", "M2 기능강화", "M3 탐방프로그램", "M4 QA", "M5 스토어등록", "M6 출시"];
  const activeMilestone =
    MILESTONE_ORDER.find((m) => tasks.some((t) => t.milestone === m && t.status !== "완료")) ??
    MILESTONE_ORDER[0];

  // 현재 마일스톤 진행률
  const activeStats = milestoneStats(activeMilestone);
  const progressPct = activeStats.total > 0
    ? Math.round((activeStats.done / activeStats.total) * 100)
    : 0;

  // D-day 임박 태스크 (7일 이내 마감)
  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.dueDate || t.status === "완료") return false;
      const diff = (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  return {
    tasks,
    issues,
    loading,
    error,
    refetch: fetchData,
    milestoneStats,
    activeMilestone,
    activeStats,
    progressPct,
    upcomingTasks,
    MILESTONE_ORDER,
  };
};
