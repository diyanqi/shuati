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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { Organization, PaginationInfo } from "@/types/api";
import { OrganizationDetailDialog } from "@/components/organization-detail-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { DrawerTrigger } from "@/components/ui/drawer";

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
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-24" />
          </CardFooter>
        </Card>
      ))}
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
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(12);
  const [pagination, setPagination] = React.useState<PaginationInfo | null>(null);

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
      const result = await api.organization.getList({ page, pageSize });
      setOrganizations(result.items);
      setPagination(result.pagination);
    } catch (e: any) {
      setError(e.message);
      toast.error("获取组织列表失败", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

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
      <div>
        {table.getRowModel().rows?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {table.getRowModel().rows.map((row) => {
              const org = row.original as Organization;
              return (
                <Card key={org.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-semibold leading-tight line-clamp-2 break-anywhere">
                          {org.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{org.organizationCode}</p>
                      </div>
                      <Badge variant={org.status === 'active' ? 'default' : 'destructive'} className="capitalize whitespace-nowrap">
                        {org.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">地区</span>
                      <span>{org.region || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">创建日期</span>
                      <span>{org.createdAt ? new Date(org.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <Button variant="outline" size="sm" className="h-8" onClick={() => openOrganizationDialog(org.id)}>
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(org.id)}>
                          复制组织 ID
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
