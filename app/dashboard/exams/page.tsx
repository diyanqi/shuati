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
import { Exam } from "@/types/api";
import { ExamDetailDialog } from "@/components/exam-detail-dialog";

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
            {[...Array(7)].map((_, i) => (
              <TableHead key={i}><Skeleton className="h-6 w-full" /></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(7)].map((_, j) => (
                <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default function ExamsPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [data, setData] = React.useState<Exam[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialog state
  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null);
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
        organizationName: false,
        gradeLevel: false,
        totalQuestions: false,
        startDate: false,
        endDate: false,
      });
    } else if (isTablet) {
      // 平板端隐藏部分列
      setColumnVisibility({
        select: false,
        gradeLevel: false,
        startDate: false,
        endDate: false,
      });
    } else {
      // 桌面端显示所有列
      setColumnVisibility({});
    }
  }, [isMobile, isTablet]);

  const fetchExams = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.exam.getList();
      setData(result.items);
    } catch (e: any) {
      setError(e.message);
      toast.error("获取考试列表失败", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const openExamDialog = (examId: string) => {
    setSelectedExamId(examId);
    setIsDialogOpen(true);
  };

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

  const columns: ColumnDef<Exam>[] = [
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
      accessorKey: "name",
      header: "考试名称",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.getValue("name")}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.examCode}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "organizationName",
      header: "组织",
      cell: ({ row }) => <div className="text-sm">{row.getValue("organizationName")}</div>,
    },
    {
      accessorKey: "examType",
      header: "考试类型",
      cell: ({ row }) => <div className="text-sm">{row.getValue("examType")}</div>,
    },
    {
      accessorKey: "gradeLevel",
      header: "年级",
      cell: ({ row }) => <div className="text-sm">{row.getValue("gradeLevel")}</div>,
    },
    {
      accessorKey: "difficultyLevel",
      header: "难度",
      cell: ({ row }) => getDifficultyBadge(row.getValue("difficultyLevel")),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            考试日期
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("startDate")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "totalQuestions",
      header: "题目数",
      cell: ({ row }) => (
        <div className="text-center font-mono">
          {row.getValue("totalQuestions")}
        </div>
      ),
    },
    {
      id: "details",
      header: "详情",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openExamDialog(row.original.id)}
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
        const exam = row.original;
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(exam.id)}>
                复制考试 ID
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
        <h1 className="text-3xl font-bold tracking-tight">考试管理</h1>
        <p className="text-muted-foreground">管理各类考试和测验</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="筛选考试名称..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
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

      {/* Exam Detail Dialog */}
      {selectedExamId && (
        <ExamDetailDialog
          examId={selectedExamId}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          {/* Dialog trigger is handled programmatically */}
          <div style={{ display: 'none' }} />
        </ExamDetailDialog>
      )}
    </div>
  );
}
