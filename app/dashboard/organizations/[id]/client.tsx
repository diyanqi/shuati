"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { api } from "@/lib/api";
import { Organization } from "@/types/api";
import { toast } from "sonner";

// Loading skeleton component for the detail view
const DetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export function OrganizationDetailClient() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchOrganization = React.useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setIsLoading(true);
      const result = await api.organization.getDetail(organizationId);
      setOrganization(result);
    } catch (e: any) {
      setError(e.message);
      toast.error("获取组织详情失败", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  React.useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">组织详情</h1>
          </div>
        </div>
        <div className="text-red-500 p-4 text-center">
          {error || "组织未找到"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
            {getStatusBadge(organization.status)}
          </div>
          <p className="text-muted-foreground">
            组织代码: {organization.organizationCode}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>组织的基本详细信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">组织名称</label>
              <p className="text-sm">{organization.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">组织代码</label>
              <p className="text-sm font-mono">{organization.organizationCode}</p>
            </div>
            
            {organization.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">描述</label>
                <p className="text-sm">{organization.description}</p>
              </div>
            )}

            {organization.region && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">地区</label>
                <p className="text-sm">{organization.region}</p>
              </div>
            )}

            {organization.establishmentDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">成立日期</label>
                <p className="text-sm">
                  {new Date(organization.establishmentDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">状态</label>
              <div className="pt-1">
                {getStatusBadge(organization.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>联系信息</CardTitle>
            <CardDescription>组织的联系方式和地址</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {organization.contactInfo?.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">邮箱</label>
                <p className="text-sm">{organization.contactInfo.email}</p>
              </div>
            )}

            {organization.contactInfo?.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">电话</label>
                <p className="text-sm">{organization.contactInfo.phone}</p>
              </div>
            )}

            {organization.contactInfo?.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">地址</label>
                <p className="text-sm">{organization.contactInfo.address}</p>
              </div>
            )}

            {organization.contactInfo?.website && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">网站</label>
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
            )}

            {!organization.contactInfo?.email && 
             !organization.contactInfo?.phone && 
             !organization.contactInfo?.address && 
             !organization.contactInfo?.website && (
              <p className="text-sm text-muted-foreground">暂无联系信息</p>
            )}
          </CardContent>
        </Card>

        {/* Logo */}
        {organization.logoUrl && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>组织标志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img
                  src={organization.logoUrl}
                  alt={`${organization.name} Logo`}
                  className="max-h-32 w-auto rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
            <CardDescription>创建和更新时间</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">创建时间</label>
              <p className="text-sm">
                {new Date(organization.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">更新时间</label>
              <p className="text-sm">
                {new Date(organization.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
