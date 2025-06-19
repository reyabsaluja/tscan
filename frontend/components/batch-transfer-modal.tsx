"use client"

import type React from "react"

import { useState } from "react"
import { X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InventoryItem, Warehouse } from "@/lib/types"

interface BatchTransferModalProps {
  selectedItems: InventoryItem[]
  warehouses: Warehouse[]
  onClose: () => void
  onTransferItems: (itemIds: string[], newLocation: string) => void
}

export function BatchTransferModal({ selectedItems, warehouses, onClose, onTransferItems }: BatchTransferModalProps) {
  const [newLocation, setNewLocation] = useState("")

  // Group items by their current location
  const itemsByLocation = selectedItems.reduce<Record<string, InventoryItem[]>>((acc, item) => {
    if (!acc[item.location]) {
      acc[item.location] = []
    }
    acc[item.location].push(item)
    return acc
  }, {})

  // Get unique current locations
  const currentLocations = Object.keys(itemsByLocation)

  // Get available warehouses (excluding current locations if only one location)
  const availableWarehouses =
    currentLocations.length === 1 ? warehouses.filter((w) => w.name !== currentLocations[0]) : warehouses

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newLocation) {
      return
    }

    onTransferItems(
      selectedItems.map((item) => item.id),
      newLocation,
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Batch Transfer Items</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Transferring {selectedItems.length} items</h3>
            {currentLocations.length > 1 ? (
              <p className="text-sm text-blue-600">
                Items are currently in {currentLocations.length} different locations. All will be moved to the selected
                destination.
              </p>
            ) : (
              <p className="text-sm text-blue-600">
                All items are currently in {currentLocations[0]}. Select a new destination.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex-1 text-center">
                <div className="font-medium text-gray-900">From</div>
                <div className="mt-1">
                  {currentLocations.length === 1 ? (
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{currentLocations[0]}</div>
                  ) : (
                    <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">Multiple locations</div>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex-1 text-center">
                <div className="font-medium text-gray-900">To</div>
                <div className="mt-1">
                  {newLocation ? (
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full">{newLocation}</div>
                  ) : (
                    <div className="text-gray-400">Select destination</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="newLocation">Destination Warehouse *</Label>
              <Select value={newLocation} onValueChange={setNewLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {availableWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.name}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={!newLocation}>
                Transfer {selectedItems.length} Items
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
