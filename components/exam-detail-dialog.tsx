"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "@/lib/api";
import { Exam } from "@/types/api";
import { toast } from "sonner";

interface ExamDetailDialogProps {
  examId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

// Loading skeleton for dialog content
const DetailSkeleton = () => (
  <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  </div>
);

function ExamDetailContent({ examId }: { examId: string }) {
  const [exam, setExam] = React.useState<Exam | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await api.exam.getDetail(examId);
        setExam(result);
      } catch (e: any) {
        setError(e.message);
        toast.error("获取考试详情失败", { description: e.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      published: "default",
      draft: "secondary",
      archived: "outline",
      cancelled: "destructive"
    };

    const labels: Record<string, string> = {
      published: "已发布",
      draft: "草稿",
      archived: "已归档",
      cancelled: "已取消"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getDifficultyBadge = (level: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      "容易": "outline",
      "中等": "secondary",
      "困难": "default",
      "极难": "destructive"
    };

    return (
      <Badge variant={variants[level] || "secondary"}>
        {level}
      </Badge>
    );
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !exam) {
    return (
      <div className="text-center py-8 text-red-500">
        {error || "考试未找到"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exam Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">考试代码: {exam.examCode}</p>
          <p className="text-sm text-muted-foreground">组织: {exam.organizationName}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(exam.status)}
          {getDifficultyBadge(exam.difficultyLevel)}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">基本信息</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">考试名称</label>
              <p className="text-sm">{exam.name}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">考试代码</label>
              <p className="text-sm font-mono">{exam.examCode}</p>
            </div>

            {exam.description && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">描述</label>
                <p className="text-sm">{exam.description}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground">考试类型</label>
              <p className="text-sm">{exam.examType}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">年级</label>
              <p className="text-sm">{exam.gradeLevel}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">题目总数</label>
              <p className="text-sm font-mono">{exam.totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* Exam Schedule */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">考试安排</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">开始日期</label>
              <p className="text-sm">
                {new Date(exam.startDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">结束日期</label>
              <p className="text-sm">
                {new Date(exam.endDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">开始时间</label>
              <p className="text-sm">{exam.startTime}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">结束时间</label>
              <p className="text-sm">{exam.endTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects */}
      {exam.subjects && exam.subjects.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">科目详情</h4>
          <div className="grid gap-3">
            {exam.subjects.map((subject, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{subject.subject}</h5>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{subject.questionCount} 题</p>
                    <p>{subject.totalScore} 分</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>考试时长: {subject.duration} 分钟</p>
                  {subject.pdfUrl && (
                    <p className="mt-1">
                      <a 
                        href={subject.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        查看试卷
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold mb-3">系统信息</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">创建时间</label>
            <p className="text-sm">
              {new Date(exam.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">更新时间</label>
            <p className="text-sm">
              {new Date(exam.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamDetailDialog({
  examId,
  open,
  onOpenChange,
  children
}: ExamDetailDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>考试详情</DialogTitle>
            <DialogDescription>
              查看考试的详细信息和安排
            </DialogDescription>
          </DialogHeader>
          <ExamDetailContent examId={examId} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>考试详情</DrawerTitle>
          <DrawerDescription>
            查看考试的详细信息和安排
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <ExamDetailContent examId={examId} />
        </div>
        <DrawerFooter className="pt-2 flex-shrink-0">
          <DrawerClose asChild>
            <Button variant="outline">关闭</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
