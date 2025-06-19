"use client"

import { useMemo } from "react"
import { WarehouseOverview } from "./charts/warehouse-overview"
import { CategoryDistribution } from "./charts/category-distribution"
import { InventoryTrends } from "./charts/inventory-trends"
import { QuickStats } from "./charts/quick-stats"
import type { InventoryItem, Warehouse } from "@/lib/types"

interface DashboardProps {
  items: InventoryItem[]
  warehouses: Warehouse[]
  selectedWarehouse: string
}

export function Dashboard({ items, warehouses, selectedWarehouse }: DashboardProps) {
  const filteredItems = useMemo(() => {
    return selectedWarehouse === "all" ? items : items.filter((item) => item.location === selectedWarehouse)
  }, [items, selectedWarehouse])

  const dashboardTitle = selectedWarehouse === "all" ? "All Warehouses Overview" : `${selectedWarehouse} Dashboard`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{dashboardTitle}</h2>
          <p className="text-gray-600 mt-1">Visual insights into your inventory distribution</p>
        </div>
      </div>

      <QuickStats items={filteredItems} warehouses={warehouses} selectedWarehouse={selectedWarehouse} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WarehouseOverview items={items} warehouses={warehouses} selectedWarehouse={selectedWarehouse} />
        <CategoryDistribution items={filteredItems} />
      </div>

      <InventoryTrends items={filteredItems} />
    </div>
  )
}
