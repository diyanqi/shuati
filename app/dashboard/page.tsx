"use client";

import * as React from "react";
import { RecentActivities } from "@/components/recent-activities";
import { SystemOverview } from "@/components/system-overview";
import { QuickActions } from "@/components/quick-actions";
import { api } from "@/lib/api";
import { Organization, Exam, Question } from "@/types/api";
import { toast } from "sonner";

export default function Page() {
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // 获取仪表板数据
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 并行获取最新数据用于仪表板展示
        const [orgResult, examResult, questionResult] = await Promise.all([
          api.organization.getList({ pageSize: 10 }),
          api.exam.getList({ pageSize: 10 }),
          api.question.getList({ pageSize: 20 })
        ]);

        setOrganizations(orgResult.items);
        setExams(examResult.items);
        setQuestions(questionResult.items);
      } catch (error: any) {
        toast.error("获取仪表板数据失败", { 
          description: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 系统概览卡片 */}
      <SystemOverview 
        organizations={organizations} 
        exams={exams} 
        questions={questions}
        isLoading={isLoading}
      />
      
      {/* 快捷操作 */}
      <QuickActions />
      
      {/* 最近活动 */}
      <RecentActivities 
        organizations={organizations}
        exams={exams}
        questions={questions}
        isLoading={isLoading}
      />
    </div>
  );
}
