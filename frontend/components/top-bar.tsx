"use client"

import { Download, Plus, BarChart3, Table, Network, Scan, Edit, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { InventoryItem } from "@/lib/types"
import { exportToCSV, exportToExcel } from "@/lib/export"

interface TopBarProps {
  items: InventoryItem[]
  selectedItems: InventoryItem[]
  onAddItem: () => void
  onBatchEdit: () => void
  onBatchTransfer: () => void
  onScanBarcode: () => void
  viewMode: "table" | "dashboard" | "graph"
  onViewModeChange: (mode: "table" | "dashboard" | "graph") => void
}

export function TopBar({
  items,
  selectedItems,
  onAddItem,
  onBatchEdit,
  onBatchTransfer,
  onScanBarcode,
  viewMode,
  onViewModeChange,
}: TopBarProps) {
  const handleExportCSV = () => {
    exportToCSV(items, "inventory-export.csv")
  }

  const handleExportExcel = () => {
    exportToExcel(items, "inventory-export.xlsx")
  }

  // Calculate if batch operations should be enabled
  const batchOperationsEnabled = selectedItems.length > 0

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">
            {items.length} items displayed
            {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              onClick={() => onViewModeChange("table")}
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className={`gap-2 ${viewMode === "table" ? "bg-gray-900 text-white hover:bg-gray-800" : ""}`}
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              onClick={() => onViewModeChange("dashboard")}
              variant={viewMode === "dashboard" ? "default" : "ghost"}
              size="sm"
              className={`gap-2 ${viewMode === "dashboard" ? "bg-gray-900 text-white hover:bg-gray-800" : ""}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button
              onClick={() => onViewModeChange("graph")}
              variant={viewMode === "graph" ? "default" : "ghost"}
              size="sm"
              className={`gap-2 ${viewMode === "graph" ? "bg-gray-900 text-white hover:bg-gray-800" : ""}`}
            >
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Graph</span>
            </Button>
          </div>

          {/* Hide batch operation buttons on smaller screens */}
          {viewMode === "table" && (
            <div className="hidden lg:flex items-center gap-2">
              <Button
                onClick={onBatchEdit}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!batchOperationsEnabled}
              >
                <Edit className="w-4 h-4" />
                Batch Edit
              </Button>
              <Button
                onClick={onBatchTransfer}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!batchOperationsEnabled}
              >
                <ArrowRightLeft className="w-4 h-4" />
                Batch Transfer
              </Button>
            </div>
          )}

          {/* Export buttons - show on medium screens and up */}
          <div className="hidden md:flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Export CSV</span>
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Export Excel</span>
            </Button>
          </div>

          {/* Always show scan barcode button */}
          <Button onClick={onScanBarcode} variant="outline" size="sm" className="gap-2">
            <Scan className="w-4 h-4" />
            <span className="hidden sm:inline">Scan</span>
          </Button>

          {/* Always show add item button */}
          <Button onClick={onAddItem} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>

      {/* Show batch operations in a second row on smaller screens when items are selected */}
      {viewMode === "table" && selectedItems.length > 0 && (
        <div className="lg:hidden flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mr-2">{selectedItems.length} items selected:</div>
          <Button onClick={onBatchEdit} variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button onClick={onBatchTransfer} variant="outline" size="sm" className="gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Transfer
          </Button>
        </div>
      )}

      {/* Show export buttons on small screens */}
      <div className="md:hidden flex items-center gap-2 mt-4">
        <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2 flex-1">
          <Download className="w-4 h-4" />
          CSV
        </Button>
        <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-2 flex-1">
          <Download className="w-4 h-4" />
          Excel
        </Button>
      </div>
    </div>
  )
}
