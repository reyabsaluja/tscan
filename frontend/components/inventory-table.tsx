"use client"

import { useState } from "react"
import { Edit, Trash2, ArrowRightLeft, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { InventoryItem } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface InventoryTableProps {
  items: InventoryItem[]
  onEditItem: (item: InventoryItem) => void
  onDeleteItem: (id: string) => void
  onTransferItem: (item: InventoryItem) => void
  selectedItems: InventoryItem[]
  onSelectItem: (item: InventoryItem, isSelected: boolean) => void
  onSelectAllItems: (isSelected: boolean) => void
}

type SortField = "name" | "sku" | "quantity" | "location" | "category" | "lastUpdated"
type SortDirection = "asc" | "desc"

export function InventoryTable({
  items,
  onEditItem,
  onDeleteItem,
  onTransferItem,
  selectedItems,
  onSelectItem,
  onSelectAllItems,
}: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const isItemSelected = (id: string) => {
    return selectedItems.some((item) => item.id === id)
  }

  const areAllItemsSelected = () => {
    return items.length > 0 && selectedItems.length === items.length
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (sortField === "lastUpdated") {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-gray-500 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p>Add your first inventory item to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4">
                <Checkbox
                  checked={areAllItemsSelected()}
                  onCheckedChange={(checked) => onSelectAllItems(!!checked)}
                  aria-label="Select all items"
                />
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                <button
                  onClick={() => handleSort("sku")}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  SKU
                  <SortIcon field="sku" />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                <button
                  onClick={() => handleSort("quantity")}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  Quantity
                  <SortIcon field="quantity" />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                <button
                  onClick={() => handleSort("location")}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  Location
                  <SortIcon field="location" />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                <button
                  onClick={() => handleSort("category")}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  Category
                  <SortIcon field="category" />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-gray-900">
                <button
                  onClick={() => handleSort("lastUpdated")}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  Last Updated
                  <SortIcon field="lastUpdated" />
                </button>
              </th>
              <th className="text-right p-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                } ${isItemSelected(item.id) ? "bg-blue-50" : ""}`}
              >
                <td className="p-4">
                  <Checkbox
                    checked={isItemSelected(item.id)}
                    onCheckedChange={(checked) => onSelectItem(item, !!checked)}
                    aria-label={`Select ${item.name}`}
                  />
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-600 font-mono text-sm">{item.sku}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-900 font-medium">{item.quantity}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-600">{item.location}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-600">{item.category || "-"}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-600 text-sm">{formatDate(item.lastUpdated)}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => onTransferItem(item)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onEditItem(item)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onDeleteItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
