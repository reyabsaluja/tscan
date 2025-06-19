"use client"

import { useMemo } from "react"
import { Package, Building2, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { InventoryItem, Warehouse } from "@/lib/types"

interface QuickStatsProps {
  items: InventoryItem[]
  warehouses: Warehouse[]
  selectedWarehouse: string
}

export function QuickStats({ items, warehouses, selectedWarehouse }: QuickStatsProps) {
  const stats = useMemo(() => {
    const filteredItems =
      selectedWarehouse === "all" ? items : items.filter((item) => item.location === selectedWarehouse)

    const totalItems = filteredItems.length
    const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
    const lowStockItems = filteredItems.filter((item) => item.quantity < 10).length
    const activeWarehouses = selectedWarehouse === "all" ? warehouses.filter((w) => w.itemCount > 0).length : 1

    return {
      totalItems,
      totalQuantity,
      lowStockItems,
      activeWarehouses,
    }
  }, [items, warehouses, selectedWarehouse])

  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Quantity",
      value: stats.totalQuantity.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Warehouses",
      value: stats.activeWarehouses,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="transition-all duration-200 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
