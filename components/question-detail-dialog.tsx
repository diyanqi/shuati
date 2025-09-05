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
import { Question } from "@/types/api";
import { toast } from "sonner";

interface QuestionDetailDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

// Loading skeleton for dialog content
const DetailSkeleton = () => (
  <div className="space-y-4">
    <div className="grid gap-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-16 w-full" />
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
    </div>
  </div>
);

function QuestionDetailContent({ questionId }: { questionId: string }) {
  const [question, setQuestion] = React.useState<Question | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!questionId) return;

    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await api.question.getDetail(questionId);
        setQuestion(result);
      } catch (e: any) {
        setError(e.message);
        toast.error("获取题目详情失败", { description: e.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      published: "default",
      draft: "secondary",
      archived: "outline",
      reviewed: "default"
    };

    const labels: Record<string, string> = {
      published: "已发布",
      draft: "草稿",
      archived: "已归档",
      reviewed: "已审核"
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

  if (error || !question) {
    return (
      <div className="text-center py-8 text-red-500">
        {error || "题目未找到"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Question Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">题目代码: {question.questionCode}</p>
          <p className="text-sm text-muted-foreground">学科: {question.subject}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(question.status)}
          {getDifficultyBadge(question.difficultyLevel)}
        </div>
      </div>

      {/* Question Content */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold">题目内容</label>
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-sm">{question.questionText}</p>
            {question.japaneseText && (
              <p className="text-sm mt-2 text-blue-600">{question.japaneseText}</p>
            )}
            {question.pronunciationGuide && (
              <p className="text-xs mt-1 text-gray-500">{question.pronunciationGuide}</p>
            )}
          </div>
        </div>

        {/* Question Images */}
        {question.questionImages && question.questionImages.length > 0 && (
          <div>
            <label className="text-sm font-semibold">题目图片</label>
            <div className="mt-2 grid gap-2 grid-cols-2">
              {question.questionImages.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`题目图片 ${index + 1}`}
                  className="rounded-lg border max-h-32 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Audio for Japanese questions */}
        {question.audioUrl && (
          <div>
            <label className="text-sm font-semibold">音频</label>
            <div className="mt-2">
              <audio controls className="w-full">
                <source src={question.audioUrl} type="audio/mpeg" />
                您的浏览器不支持音频播放。
              </audio>
            </div>
          </div>
        )}

        {/* Options */}
        {question.options && question.options.length > 0 && (
          <div>
            <label className="text-sm font-semibold">选项</label>
            <div className="mt-2 space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 rounded border",
                    option.isCorrect ? "bg-green-50 border-green-200" : "bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm">{option.label}:</span>
                    <span className="text-sm flex-1">{option.content}</span>
                    {option.isCorrect && (
                      <Badge variant="default" className="text-xs">正确答案</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference Answer */}
        {question.referenceAnswer && (
          <div>
            <label className="text-sm font-semibold">参考答案</label>
            <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm">{question.referenceAnswer}</p>
            </div>
          </div>
        )}

        {/* Knowledge Points */}
        {question.knowledgePoints && question.knowledgePoints.length > 0 && (
          <div>
            <label className="text-sm font-semibold">知识点</label>
            <div className="mt-2 flex flex-wrap gap-1">
              {question.knowledgePoints.map((point, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {point}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Japanese-specific fields */}
        {question.subject === "日语" && (
          <div className="space-y-3">
            {question.grammarPoints && question.grammarPoints.length > 0 && (
              <div>
                <label className="text-sm font-semibold">语法点</label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {question.grammarPoints.map((point, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {question.vocabularyLevel && (
              <div>
                <label className="text-sm font-semibold">词汇等级</label>
                <p className="text-sm mt-1">{question.vocabularyLevel}</p>
              </div>
            )}

            {question.kanjiList && question.kanjiList.length > 0 && (
              <div>
                <label className="text-sm font-semibold">汉字</label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {question.kanjiList.map((kanji, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {kanji}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
          <div>
            <label className="text-xs font-medium text-muted-foreground">分值</label>
            <p className="text-sm font-mono">{question.totalScore}</p>
          </div>
          {question.correctRate !== undefined && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">正确率</label>
              <p className="text-sm font-mono">{(question.correctRate * 100).toFixed(1)}%</p>
            </div>
          )}
          {question.averageScore !== undefined && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">平均得分</label>
              <p className="text-sm font-mono">{question.averageScore.toFixed(1)}</p>
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">系统信息</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">创建时间</label>
              <p className="text-sm">
                {new Date(question.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">更新时间</label>
              <p className="text-sm">
                {new Date(question.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestionDetailDialog({
  questionId,
  open,
  onOpenChange,
  children
}: QuestionDetailDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>题目详情</DialogTitle>
            <DialogDescription>
              查看题目的详细内容和相关信息
            </DialogDescription>
          </DialogHeader>
          <QuestionDetailContent questionId={questionId} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>题目详情</DrawerTitle>
          <DrawerDescription>
            查看题目的详细内容和相关信息
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <QuestionDetailContent questionId={questionId} />
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
