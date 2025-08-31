"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ItemDetail } from "@/components/item-detail"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardPage() {
  const [selectedItem, setSelectedItem] = React.useState<{ type: string; id: string } | null>(null)

  const handleSelectedItemChange = (type: string, id:string) => {
    setSelectedItem({ type, id })
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "200px",
          "--sidebar-width-icon": "50px",
        } as React.CSSProperties
      }
    >
      <AppSidebar onSelectedItemChange={handleSelectedItemChange} />
      <SidebarInset>
        <main className="h-full flex-1 ml-[var(--sidebar-width)]">
          <ItemDetail item={selectedItem} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
