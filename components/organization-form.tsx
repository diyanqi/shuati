"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Organization } from "@/types/api"

const formSchema = z.object({
  name: z.string().min(2, { message: "组织名称至少需要2个字符。" }),
  organizationCode: z.string().min(3, { message: "组织代码至少需要3个字符。" }),
  description: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
});

type OrganizationFormValues = z.infer<typeof formSchema>;

interface OrganizationFormProps {
  initialData?: Organization | null;
  onSuccess: () => void;
}

export function OrganizationForm({ initialData, onSuccess }: OrganizationFormProps) {
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      organizationCode: initialData?.organizationCode || "",
      description: initialData?.description || "",
      region: initialData?.region || "",
      status: initialData?.status || "active",
    },
  });

  const {formState: {isSubmitting}} = form;

  const onSubmit = async (values: OrganizationFormValues) => {
    try {
      const promise = initialData
        ? api.organization.update(initialData.id, values)
        : api.organization.create(values);

      toast.promise(promise, {
        loading: initialData ? '正在更新组织...' : '正在创建组织...',
        success: () => {
          onSuccess();
          return `组织已成功${initialData ? '更新' : '创建'}！`;
        },
        error: (err) => `操作失败: ${err.message}`,
      });
    } catch (error) {
      // Toast will handle error display
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>组织名称</FormLabel>
              <FormControl>
                <Input placeholder="例如：江苏省重点中学联考联盟" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organizationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>组织代码</FormLabel>
              <FormControl>
                <Input placeholder="例如：JSLKLM001" {...field} />
              </FormControl>
              <FormDescription>
                组织代码是唯一的标识符。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="输入关于该组织的简短描述..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>地区</FormLabel>
              <FormControl>
                <Input placeholder="例如：江苏省" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>状态</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个状态" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">不活跃</SelectItem>
                  <SelectItem value="suspended">已暂停</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '正在保存...' : '保存'}
        </Button>
      </form>
    </Form>
  )
}
