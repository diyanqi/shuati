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
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Question } from "@/types/api";
import { QuestionDetailDialog } from "@/components/question-detail-dialog";

import { useMediaQuery } from "@/hooks/use-media-query";

// Loading skeleton component
const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center py-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="ml-auto h-10 w-24" />
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(8)].map((_, i) => (
              <TableHead key={i}><Skeleton className="h-6 w-full" /></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(8)].map((_, j) => (
                <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
      const result = await api.question.getList();
      setData(result.items);
    } catch (e: any) {
      setError(e.message);
      toast.error("获取题目列表失败", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            已选择 {table.getFilteredSelectedRowModel().rows.length} 行，共 {table.getFilteredRowModel().rows.length} 行
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              下一页
            </Button>
          </div>
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
