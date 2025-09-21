"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

export function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
}

export function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("list-none", className)} {...props} />
}

export interface PaginationLinkProps extends React.ComponentProps<"a"> {
  isActive?: boolean
}

export const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border bg-background text-sm font-medium",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  )
)
PaginationLink.displayName = "PaginationLink"

export const PaginationPrevious = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
  ({ className, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-md border bg-background px-3 text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="hidden sm:inline">上一页</span>
      <span className="sm:hidden">上一页</span>
    </a>
  )
)
PaginationPrevious.displayName = "PaginationPrevious"

export const PaginationNext = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
  ({ className, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-md border bg-background px-3 text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="hidden sm:inline">下一页</span>
      <span className="sm:hidden">下一页</span>
    </a>
  )
)
PaginationNext.displayName = "PaginationNext"

export function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("inline-flex size-9 items-center justify-center", className)} {...props}>
      …
    </span>
  )
}
