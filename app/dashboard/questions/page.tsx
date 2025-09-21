"use client";

import * as React from "react";
import {
  CaretSortIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Question, PaginationInfo } from "@/types/api";
import { QuestionDetailDialog } from "@/components/question-detail-dialog";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Loading skeleton component
const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center py-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="ml-auto h-10 w-24" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="border">
          <CardHeader className="space-y-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/5" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);

export default function QuestionsPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [data, setData] = React.useState<Question[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(12);
  const [pagination, setPagination] = React.useState<PaginationInfo | null>(null);

  // Dialog state
  const [selectedQuestionId, setSelectedQuestionId] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // 检测是否为移动设备
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // 根据屏幕尺寸动态设置列可见性
  React.useEffect(() => {
    if (isMobile) {
      // 移动端只显示最重要的列
      setColumnVisibility({
        select: false,
        questionType: false,
        totalScore: false,
        correctRate: false,
        actions: false,
      });
    } else if (isTablet) {
      // 平板端隐藏部分列
      setColumnVisibility({
        select: false,
        questionType: false,
        correctRate: false,
        actions: false,
      });
    } else {
      // 桌面端显示所有列
      setColumnVisibility({});
    }
  }, [isMobile, isTablet]);

  const fetchQuestions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.question.getList({ page, pageSize });
      setData(result.items);
      setPagination(result.pagination);
    } catch (e: any) {
      setError(e.message);
      toast.error("获取题目列表失败", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const openQuestionDialog = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setIsDialogOpen(true);
  };

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

  const getSubjectBadge = (subject: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      "语文": "default",
      "数学": "default",
      "英语": "default",
      "物理": "default",
      "化学": "default",
      "生物": "default",
      "日语": "outline"
    };

    return (
      <Badge variant={variants[subject] || "secondary"} className="text-xs">
        {subject}
      </Badge>
    );
  };

  const columns: ColumnDef<Question>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "questionText",
      header: "题目内容",
      cell: ({ row }) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-medium text-foreground truncate">
            {row.getValue("questionText")}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.questionCode}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "学科",
      cell: ({ row }) => getSubjectBadge(row.getValue("subject")),
    },
    {
      accessorKey: "questionType",
      header: "题型",
      cell: ({ row }) => <div className="text-sm">{row.getValue("questionType")}</div>,
    },
    {
      accessorKey: "difficultyLevel",
      header: "难度",
      cell: ({ row }) => getDifficultyBadge(row.getValue("difficultyLevel")),
    },
    {
      accessorKey: "totalScore",
      header: "分值",
      cell: ({ row }) => (
        <div className="text-center font-mono">
          {row.getValue("totalScore")}
        </div>
      ),
    },
    {
      accessorKey: "correctRate",
      header: "正确率",
      cell: ({ row }) => {
        const rate = row.getValue("correctRate") as number;
        return rate !== undefined ? (
          <div className="text-center font-mono">
            {(rate * 100).toFixed(1)}%
          </div>
        ) : (
          <div className="text-center text-muted-foreground">-</div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      id: "details",
      header: "详情",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openQuestionDialog(row.original.id)}
          className="h-8"
        >
          显示详情
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const question = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(question.id)}>
                复制题目 ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading && data.length === 0) {
    return <TableSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 p-4">获取数据时出错: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">题目管理</h1>
        <p className="text-muted-foreground">管理各类题目和知识点</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="搜索题目内容..."
            value={(table.getColumn("questionText")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("questionText")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div>
          {table.getRowModel().rows?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {table.getRowModel().rows.map((row) => {
                const q = row.original as Question;
                return (
                  <Card key={q.id} className="hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-base font-semibold leading-tight line-clamp-2 break-anywhere" title={q.questionText}>
                            {q.questionText}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{q.questionCode}</p>
                        </div>
                        {getStatusBadge(q.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">学科</span>
                        <span>{getSubjectBadge(q.subject)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">难度</span>
                        <span>{getDifficultyBadge(q.difficultyLevel)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">分值</span>
                        <span className="font-mono">{q.totalScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">正确率</span>
                        <span className="font-mono">{q.correctRate !== undefined ? `${(q.correctRate * 100).toFixed(1)}%` : '-'}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="h-8" onClick={() => openQuestionDialog(q.id)}>
                        显示详情
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(q.id)}>
                            复制题目 ID
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground">暂无数据</div>
          )}
        </div>
        <div className="py-4">
          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={!pagination.hasPrev ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasPrev) setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                {(() => {
                  const total = pagination.totalPages;
                  const current = pagination.page;
                  const pages: (number | "ellipsis")[] = [];
                  const push = (v: number | "ellipsis") => pages.push(v);
                  const addRange = (s: number, e: number) => { for (let i = s; i <= e; i++) push(i); };
                  const showLeft = Math.max(2, current - 1);
                  const showRight = Math.min(total - 1, current + 1);
                  push(1);
                  if (showLeft > 2) push("ellipsis");
                  addRange(showLeft, showRight);
                  if (showRight < total - 1) push("ellipsis");
                  if (total > 1) push(total);
                  return pages.map((p, idx) => (
                    <PaginationItem key={idx}>
                      {p === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={p === current}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}
                <PaginationItem>
                  <PaginationNext
                    className={!pagination.hasNext ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasNext) setPage((p) => Math.min(pagination.totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* Question Detail Dialog */}
      {selectedQuestionId && (
        <QuestionDetailDialog
          questionId={selectedQuestionId}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          {/* Dialog trigger is handled programmatically */}
          <div style={{ display: 'none' }} />
        </QuestionDetailDialog>
      )}
    </div>
  );
}
