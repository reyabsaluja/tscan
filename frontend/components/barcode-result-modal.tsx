"use client"
import { X, Check, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { InventoryItem } from "@/lib/types"

interface BarcodeResultModalProps {
  scannedCode: string
  items: InventoryItem[]
  onClose: () => void
  onAddItem: () => void
  onEditItem: (item: InventoryItem) => void
}

export function BarcodeResultModal({ scannedCode, items, onClose, onAddItem, onEditItem }: BarcodeResultModalProps) {
  // Check if the scanned code matches any item's SKU
  const matchingItem = items.find((item) => item.sku === scannedCode)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scan Result</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Scanned Code:</div>
            <div className="font-mono text-lg font-medium">{scannedCode}</div>
            {scannedCode === "123456789012" && (
              <div className="text-xs text-blue-600 mt-1">(Demo barcode - automatically generated for testing)</div>
            )}
          </div>

          {matchingItem ? (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Item Found</h3>
                  <p className="text-sm text-green-700">This code matches an item in your inventory.</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="font-medium text-gray-900">{matchingItem.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">SKU:</span> {matchingItem.sku}
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span> {matchingItem.quantity}
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span> {matchingItem.location}
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span> {matchingItem.category || "-"}
                  </div>
                </div>
              </div>

              <Button onClick={() => onEditItem(matchingItem)} className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                <Search className="w-4 h-4" />
                View/Edit Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4 flex items-start gap-3">
                <Search className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">No Match Found</h3>
                  <p className="text-sm text-yellow-700">This code doesn't match any item in your inventory.</p>
                </div>
              </div>

              <Button onClick={onAddItem} className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                Add New Item with this SKU
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
