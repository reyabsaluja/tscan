"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { InventoryItem, Warehouse } from "@/lib/types"

interface BatchEditModalProps {
  selectedItems: InventoryItem[]
  warehouses: Warehouse[]
  onClose: () => void
  onUpdateItems: (items: InventoryItem[]) => void
}

export function BatchEditModal({ selectedItems, warehouses, onClose, onUpdateItems }: BatchEditModalProps) {
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    location: false,
    category: false,
    quantity: false,
  })

  const [formData, setFormData] = useState({
    location: "",
    category: "",
    quantity: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedItems = selectedItems.map((item) => {
      const updatedItem = { ...item }

      if (fieldsToUpdate.location && formData.location) {
        updatedItem.location = formData.location
      }

      if (fieldsToUpdate.category) {
        updatedItem.category = formData.category || undefined
      }

      if (fieldsToUpdate.quantity && formData.quantity) {
        updatedItem.quantity = Number.parseInt(formData.quantity)
      }

      updatedItem.lastUpdated = new Date().toISOString()
      return updatedItem
    })

    onUpdateItems(updatedItems)
    onClose()
  }

  const toggleField = (field: keyof typeof fieldsToUpdate) => {
    setFieldsToUpdate((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Batch Edit Items</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Editing {selectedItems.length} items</h3>
            <p className="text-sm text-blue-600">
              Select which fields to update. Only checked fields will be modified for all selected items.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="location-checkbox"
                  checked={fieldsToUpdate.location}
                  onCheckedChange={() => toggleField("location")}
                />
                <Label htmlFor="location-checkbox" className="font-medium">
                  Update Warehouse Location
                </Label>
              </div>

              {fieldsToUpdate.location && (
                <div className="pl-6">
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    disabled={!fieldsToUpdate.location}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.name}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-checkbox"
                  checked={fieldsToUpdate.category}
                  onCheckedChange={() => toggleField("category")}
                />
                <Label htmlFor="category-checkbox" className="font-medium">
                  Update Category
                </Label>
              </div>

              {fieldsToUpdate.category && (
                <div className="pl-6">
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter category"
                    disabled={!fieldsToUpdate.category}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quantity-checkbox"
                  checked={fieldsToUpdate.quantity}
                  onCheckedChange={() => toggleField("quantity")}
                />
                <Label htmlFor="quantity-checkbox" className="font-medium">
                  Update Quantity
                </Label>
              </div>

              {fieldsToUpdate.quantity && (
                <div className="pl-6">
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    disabled={!fieldsToUpdate.quantity}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={
                  !Object.values(fieldsToUpdate).some(Boolean) ||
                  (fieldsToUpdate.location && !formData.location) ||
                  (fieldsToUpdate.quantity && !formData.quantity)
                }
              >
                Update {selectedItems.length} Items
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
