"use client";

import * as React from "react";
import { IconBuilding, IconFileText, IconQuestionMark, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Organization, Exam, Question } from "@/types/api";

interface SystemOverviewProps {
  organizations: Organization[];
  exams: Exam[];
  questions: Question[];
  isLoading: boolean;
}

const StatCardSkeleton = () => (
  <Card className="@container/card">
    <CardHeader>
      <CardDescription><Skeleton className="h-4 w-20" /></CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        <Skeleton className="h-8 w-24" />
      </CardTitle>
      <CardAction>
        <Skeleton className="h-6 w-16" />
      </CardAction>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
    </CardFooter>
  </Card>
);

export function SystemOverview({ organizations, exams, questions, isLoading }: SystemOverviewProps) {
  // 计算统计数据
  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter(org => org.status === 'active').length;
  
  const totalExams = exams.length;
  const publishedExams = exams.filter(exam => exam.status === 'published').length;
  
  const totalQuestions = questions.length;
  const publishedQuestions = questions.filter(q => q.status === 'published').length;
  
  // 计算各学科题目分布
  const subjectStats = questions.reduce((acc, question) => {
    acc[question.subject] = (acc[question.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topSubject = Object.entries(subjectStats).sort(([,a], [,b]) => b - a)[0];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 组织统计 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>组织机构</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalOrganizations}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBuilding className="w-3 h-3" />
              {activeOrganizations} 活跃
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            活跃组织占比 {totalOrganizations > 0 ? Math.round((activeOrganizations / totalOrganizations) * 100) : 0}%
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            系统中注册的教育机构
          </div>
        </CardFooter>
      </Card>

      {/* 考试统计 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>考试管理</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalExams}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFileText className="w-3 h-3" />
              {publishedExams} 已发布
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            发布率 {totalExams > 0 ? Math.round((publishedExams / totalExams) * 100) : 0}%
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            平台上的考试总数
          </div>
        </CardFooter>
      </Card>

      {/* 题目统计 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>题目资源</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalQuestions}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconQuestionMark className="w-3 h-3" />
              {publishedQuestions} 可用
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            可用率 {totalQuestions > 0 ? Math.round((publishedQuestions / totalQuestions) * 100) : 0}%
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            题库中的题目总数
          </div>
        </CardFooter>
      </Card>

      {/* 热门学科 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>热门学科</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {topSubject ? topSubject[1] : 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="w-3 h-3" />
              {topSubject ? topSubject[0] : '暂无'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            最多题目的学科 <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {topSubject ? `${topSubject[0]}学科题目最多` : '各学科题目均衡分布'}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
