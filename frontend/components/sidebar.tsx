"use client"

import { useState } from "react"
import { Building2, Plus, BarChart3, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Warehouse } from "@/lib/types"

interface SidebarProps {
  warehouses: Warehouse[]
  selectedWarehouse: string
  onSelectWarehouse: (warehouseId: string) => void
  onAddWarehouse: () => void
}

export function Sidebar({ warehouses, selectedWarehouse, onSelectWarehouse, onAddWarehouse }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleWarehouseSelect = (warehouseId: string) => {
    onSelectWarehouse(warehouseId)
    // Close sidebar on mobile after selection
    if (isMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button onClick={toggleMobileSidebar} variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar content */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-20
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Warehouses</h2>
          </div>
          <Button onClick={onAddWarehouse} variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <button
            onClick={() => handleWarehouseSelect("all")}
            className={`w-full text-left p-3 rounded-lg transition-colors mb-2 ${
              selectedWarehouse === "all"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <div className="font-medium">All Warehouses</div>
            <div className="text-sm text-gray-500">{warehouses.reduce((sum, w) => sum + w.itemCount, 0)} items</div>
          </button>

          {warehouses.map((warehouse) => {
            const maxQuantity = Math.max(...warehouses.map((w) => w.itemCount), 1)
            const percentage = (warehouse.itemCount / maxQuantity) * 100

            return (
              <button
                key={warehouse.id}
                onClick={() => handleWarehouseSelect(warehouse.name)}
                className={`w-full text-left p-3 rounded-lg transition-colors mb-2 relative overflow-hidden ${
                  selectedWarehouse === warehouse.name
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="relative z-10">
                  <div className="font-medium flex items-center justify-between">
                    {warehouse.name}
                    <BarChart3 className="w-4 h-4 opacity-50" />
                  </div>
                  <div className="text-sm text-gray-500">{warehouse.itemCount} items</div>
                </div>
                <div
                  className="absolute bottom-0 left-0 h-1 bg-blue-200 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
