"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Warehouse } from "@/lib/types"

interface AddWarehouseModalProps {
  existingWarehouses: Warehouse[]
  onClose: () => void
  onAddWarehouse: (name: string) => void
}

export function AddWarehouseModal({ existingWarehouses, onClose, onAddWarehouse }: AddWarehouseModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Warehouse name is required")
      return
    }

    if (existingWarehouses.some((w) => w.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A warehouse with this name already exists")
      return
    }

    onAddWarehouse(name.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Warehouse</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Warehouse Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              placeholder="Enter warehouse name"
              required
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Add Warehouse
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
