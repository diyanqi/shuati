"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Organization } from "@/types/api";
import { toast } from "sonner";

interface OrganizationDetailDialogProps {
  organizationId: string;
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

function OrganizationDetailContent({ organizationId }: { organizationId: string }) {
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!organizationId) return;

    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await api.organization.getDetail(organizationId);
        setOrganization(result);
      } catch (e: any) {
        setError(e.message);
        toast.error("获取组织详情失败", { description: e.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive"
    };

    const labels: Record<string, string> = {
      active: "活跃",
      inactive: "非活跃",
      suspended: "暂停"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !organization) {
    return (
      <div className="text-center py-8 text-red-500">
        {error || "组织未找到"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Organization Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">组织代码: {organization.organizationCode}</p>
        </div>
        {getStatusBadge(organization.status)}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">基本信息</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">组织名称</label>
              <p className="text-sm">{organization.name}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">组织代码</label>
              <p className="text-sm font-mono">{organization.organizationCode}</p>
            </div>

            {organization.description && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">描述</label>
                <p className="text-sm">{organization.description}</p>
              </div>
            )}

            {organization.region && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">地区</label>
                <p className="text-sm">{organization.region}</p>
              </div>
            )}

            {organization.establishmentDate && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">成立日期</label>
                <p className="text-sm">
                  {new Date(organization.establishmentDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">联系信息</h4>
          <div className="space-y-3">
            {organization.contactInfo?.email ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">邮箱</label>
                <p className="text-sm">{organization.contactInfo.email}</p>
              </div>
            ) : null}

            {organization.contactInfo?.phone ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">电话</label>
                <p className="text-sm">{organization.contactInfo.phone}</p>
              </div>
            ) : null}

            {organization.contactInfo?.address ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">地址</label>
                <p className="text-sm">{organization.contactInfo.address}</p>
              </div>
            ) : null}

            {organization.contactInfo?.website ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">网站</label>
                <p className="text-sm">
                  <a
                    href={organization.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {organization.contactInfo.website}
                  </a>
                </p>
              </div>
            ) : null}

            {!organization.contactInfo?.email &&
              !organization.contactInfo?.phone &&
              !organization.contactInfo?.address &&
              !organization.contactInfo?.website && (
                <p className="text-sm text-muted-foreground">暂无联系信息</p>
              )}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold mb-3">系统信息</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">创建时间</label>
            <p className="text-sm">
              {new Date(organization.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">更新时间</label>
            <p className="text-sm">
              {new Date(organization.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrganizationDetailDialog({
  organizationId,
  open,
  onOpenChange,
  children
}: OrganizationDetailDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>组织详情</DialogTitle>
            <DialogDescription>
              查看组织的详细信息和联系方式
            </DialogDescription>
          </DialogHeader>
          <OrganizationDetailContent organizationId={organizationId} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>组织详情</DrawerTitle>
          <DrawerDescription>
            查看组织的详细信息和联系方式
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <OrganizationDetailContent organizationId={organizationId} />
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
