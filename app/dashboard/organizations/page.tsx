"use client";

import * as React from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
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
  DropdownMenuSeparator,
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

import { Organization } from "@/types/api";
import { OrganizationDetailDialog } from "@/components/organization-detail-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { DrawerTrigger } from "@/components/ui/drawer";

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
            {[...Array(6)].map((_, i) => (
              <TableHead key={i}><Skeleton className="h-6 w-full" /></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(6)].map((_, j) => (
                <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default function OrganizationsPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string>('');
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
        region: false,
        createdAt: false,
      });
    } else if (isTablet) {
      // 平板端隐藏部分列
      setColumnVisibility({
        select: false,
        createdAt: false,
      });
    } else {
      // 桌面端显示所有列
      setColumnVisibility({});
    }
  }, [isMobile, isTablet]);

  const fetchOrganizations = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.organization.getList();
      setOrganizations(result.items);
    } catch (e: any) {
      setError(e.message);
      toast.error("获取组织列表失败", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const openOrganizationDialog = (organizationId: string) => {
    setSelectedOrganizationId(organizationId);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Organization>[] = [
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
      header: "组织名称",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.getValue("name")}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.organizationCode}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "region",
      header: "地区",
      cell: ({ row }) => <div>{row.getValue("region")}</div>,
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'active' ? 'default' : 'destructive';
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            创建日期
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
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
          onClick={() => openOrganizationDialog(row.original.id)}
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
        const organization = row.original;
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(organization.id)}>
                复制组织 ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: organizations,
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

  if (isLoading && organizations.length === 0) {
    return <TableSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 p-4">获取数据时出错: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">组织管理</h1>
        <p className="text-muted-foreground">管理合作组织和教育机构</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="筛选组织名称..."
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

      {/* Organization Detail Dialog */}
      {selectedOrganizationId && (
        <OrganizationDetailDialog
          organizationId={selectedOrganizationId}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          {/* Dialog trigger is handled programmatically */}
          <div style={{ display: 'none' }} />
        </OrganizationDetailDialog>
      )}
    </div>
  );
}
