"use client";

import Link from "next/link";
import { IconPlus, IconEye, IconSearch, IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function QuickActions() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>
            快速访问系统的主要功能
          </CardDescription>
          <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
            {/* 查看组织 */}
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/dashboard/organizations">
                <IconEye className="h-6 w-6" />
                <span className="text-sm">查看组织</span>
              </Link>
            </Button>

            {/* 查看考试 */}
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/dashboard/exams">
                <IconEye className="h-6 w-6" />
                <span className="text-sm">查看考试</span>
              </Link>
            </Button>

            {/* 查看题目 */}
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/dashboard/questions">
                <IconEye className="h-6 w-6" />
                <span className="text-sm">查看题目</span>
              </Link>
            </Button>

            {/* 搜索功能 */}
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/dashboard/search">
                <IconSearch className="h-6 w-6" />
                <span className="text-sm">全局搜索</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
