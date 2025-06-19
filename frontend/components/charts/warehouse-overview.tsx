"use client"

import { useMemo, useEffect, useRef } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InventoryItem, Warehouse } from "@/lib/types"

interface WarehouseOverviewProps {
  items: InventoryItem[]
  warehouses: Warehouse[]
  selectedWarehouse: string
}

export function WarehouseOverview({ items, warehouses, selectedWarehouse }: WarehouseOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    if (selectedWarehouse !== "all") {
      // Show item distribution within the selected warehouse
      const warehouseItems = items.filter((item) => item.location === selectedWarehouse)
      return warehouseItems.map((item) => ({
        name: item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name,
        quantity: item.quantity,
        fullName: item.name,
      }))
    }

    // Show warehouse comparison - use shorter names to prevent overflow
    return warehouses.map((warehouse) => {
      const warehouseItems = items.filter((item) => item.location === warehouse.name)
      const totalQuantity = warehouseItems.reduce((sum, item) => sum + item.quantity, 0)

      // Shorten warehouse names more aggressively
      const shortName = warehouse.name.length > 8 ? `${warehouse.name.substring(0, 8)}...` : warehouse.name

      return {
        name: shortName,
        quantity: totalQuantity,
        items: warehouseItems.length,
        fullName: warehouse.name,
      }
    })
  }, [items, warehouses, selectedWarehouse])

  const title = selectedWarehouse === "all" ? "Inventory by Warehouse" : `Items in ${selectedWarehouse}`

  const description =
    selectedWarehouse === "all"
      ? "Total quantity of items across all warehouses"
      : "Quantity distribution of individual items"

  // Force re-render on window resize to fix chart responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Force a re-render by slightly modifying the container
        containerRef.current.style.width = `${containerRef.current.offsetWidth - 0.1}px`
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.width = ""
          }
        }, 10)
      }
    }

    window.addEventListener("resize", handleResize)
    // Initial render fix
    setTimeout(handleResize, 100)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="overflow-hidden">
        <div className="h-[300px] w-[95%] mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 40,
              }}
              barSize={chartData.length === 1 ? 60 : chartData.length < 3 ? 80 : 40}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={0}
                textAnchor="middle"
                height={40}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
                tickMargin={10}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12 }}
                domain={[0, "dataMax + 5"]}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                        <p className="font-medium text-gray-900">{data.fullName}</p>
                        <p className="text-blue-600">
                          Quantity: <span className="font-semibold">{payload[0].value}</span>
                        </p>
                        {data.items && <p className="text-gray-600 text-sm">Items: {data.items}</p>}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="quantity"
                fill="var(--color-quantity)"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
