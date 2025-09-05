"use client";

import * as React from "react";
import Link from "next/link";
import { IconBuilding, IconFileText, IconQuestionMark, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Organization, Exam, Question } from "@/types/api";

interface RecentActivitiesProps {
  organizations: Organization[];
  exams: Exam[];
  questions: Question[];
  isLoading: boolean;
}

const ActivitySkeleton = () => (
  <div className="flex items-center gap-4 p-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-6 w-16" />
  </div>
);

const getStatusBadge = (status: string, type: 'organization' | 'exam' | 'question') => {
  const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    active: "default",
    inactive: "secondary",
    suspended: "destructive",
    published: "default",
    draft: "secondary",
    archived: "outline",
  };

  const labels: Record<string, string> = {
    active: "活跃",
    inactive: "未激活",
    suspended: "已暂停",
    published: "已发布",
    draft: "草稿",
    archived: "已归档",
  };

  return (
    <Badge variant={variants[status] || "secondary"} className="text-xs">
      {labels[status] || status}
    </Badge>
  );
};

export function RecentActivities({ organizations, exams, questions, isLoading }: RecentActivitiesProps) {
  // 合并并排序最近的活动
  const recentActivities = React.useMemo(() => {
    const activities = [
      ...organizations.map(org => ({
        id: org.id,
        type: 'organization' as const,
        title: org.name,
        subtitle: `组织代码: ${org.organizationCode}`,
        status: org.status,
        updatedAt: org.updatedAt,
        icon: IconBuilding,
        href: `/dashboard/organizations`
      })),
      ...exams.map(exam => ({
        id: exam.id,
        type: 'exam' as const,
        title: exam.name,
        subtitle: `考试代码: ${exam.examCode}`,
        status: exam.status,
        updatedAt: exam.updatedAt,
        icon: IconFileText,
        href: `/dashboard/exams`
      })),
      ...questions.slice(0, 5).map(question => ({
        id: question.id,
        type: 'question' as const,
        title: question.questionText.slice(0, 50) + (question.questionText.length > 50 ? '...' : ''),
        subtitle: `学科: ${question.subject} | ${question.questionType}`,
        status: question.status,
        updatedAt: question.updatedAt,
        icon: IconQuestionMark,
        href: `/dashboard/questions`
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }, [organizations, exams, questions]);

  return (
    <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>
            系统中最近更新的内容
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <ActivitySkeleton key={i} />
              ))}
            </>
          ) : recentActivities.length > 0 ? (
            <>
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none line-clamp-1">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {activity.subtitle}
                      </p>
                      <div className="flex items-center gap-2">
                        <IconClock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(activity.status, activity.type)}
                    </div>
                  </div>
                );
              })}
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/organizations">查看更多</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无活动记录
            </div>
          )}
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <Card>
        <CardHeader>
          <CardTitle>系统状态</CardTitle>
          <CardDescription>
            各模块的运行状态概览
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 组织模块 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">组织管理</span>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-300">
              正常运行
            </Badge>
          </div>

          {/* 考试模块 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">考试管理</span>
            </div>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              正常运行
            </Badge>
          </div>

          {/* 题目模块 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-sm font-medium">题目管理</span>
            </div>
            <Badge variant="outline" className="text-purple-700 border-purple-300">
              正常运行
            </Badge>
          </div>

          {/* 数据同步 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-sm font-medium">数据同步</span>
            </div>
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              同步中
            </Badge>
          </div>

          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              查看详细状态
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
