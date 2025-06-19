"use client"

import { useMemo, useEffect, useRef } from "react"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { InventoryItem } from "@/lib/types"

interface InventoryTrendsProps {
  items: InventoryItem[]
}

export function InventoryTrends({ items }: InventoryTrendsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    // Group items by date (last 7 days for demo)
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return last7Days.map((date) => {
      // For demo purposes, we'll simulate some trend data
      // In a real app, you'd track actual inventory changes over time
      const dayOfWeek = date.getDay()
      const baseValue = Math.max(
        1,
        items.reduce((sum, item) => sum + item.quantity, 0),
      )
      const variation = Math.sin(dayOfWeek) * 0.1 + Math.random() * 0.05
      const value = Math.floor(baseValue * (1 + variation))

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        quantity: value,
        items: Math.floor(Math.max(1, items.length) * (1 + variation * 0.5)),
      }
    })
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

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Inventory Trends</CardTitle>
        <CardDescription>Total quantity over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef}>
        <ChartContainer
          config={{
            quantity: {
              label: "Total Quantity",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-quantity)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-quantity)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} domain={[0, "dataMax + 5"]} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-blue-600">
                          Quantity: <span className="font-semibold">{data.quantity}</span>
                        </p>
                        <p className="text-gray-600 text-sm">Items: {data.items}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="quantity"
                stroke="var(--color-quantity)"
                fillOpacity={1}
                fill="url(#colorQuantity)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
