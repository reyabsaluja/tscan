"use client"

import { useMemo, useEffect, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import type { InventoryItem } from "@/lib/types"

interface CategoryDistributionProps {
  items: InventoryItem[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function CategoryDistribution({ items }: CategoryDistributionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const categoryMap = new Map<string, { count: number; quantity: number }>()

    items.forEach((item) => {
      const category = item.category || "Uncategorized"
      const existing = categoryMap.get(category) || { count: 0, quantity: 0 }
      categoryMap.set(category, {
        count: existing.count + 1,
        quantity: existing.quantity + item.quantity,
      })
    })

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      name: category,
      value: data.quantity,
      count: data.count,
    }))
  }, [items])

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

  if (chartData.length === 0) {
    return (
      <Card className="transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Inventory breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">📊</div>
              <p>No items to display</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>Inventory breakdown by category</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef}>
        <ChartContainer
          config={{
            value: {
              label: "Quantity",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => (percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : "")}
                labelLine={true}
                fontSize={12}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                layout="horizontal"
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value, entry) => (
                  <span style={{ color: "var(--foreground)", fontSize: "12px" }}>{value}</span>
                )}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                        <p className="font-medium text-gray-900">{data.name}</p>
                        <p className="text-blue-600">
                          Quantity: <span className="font-semibold">{data.value}</span>
                        </p>
                        <p className="text-gray-600 text-sm">Items: {data.count}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
