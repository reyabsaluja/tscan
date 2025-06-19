"use client"

import { useState, useEffect } from "react"
import { Inter } from "next/font/google"
import { Sidebar } from "@/components/sidebar"
import { InventoryTable } from "@/components/inventory-table"
import { TopBar } from "@/components/top-bar"
import { AddItemModal } from "@/components/add-item-modal"
import { EditItemModal } from "@/components/edit-item-modal"
import { TransferModal } from "@/components/transfer-modal"
import { AddWarehouseModal } from "@/components/add-warehouse-modal"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { BarcodeResultModal } from "@/components/barcode-result-modal"
import { BatchEditModal } from "@/components/batch-edit-modal"
import { BatchTransferModal } from "@/components/batch-transfer-modal"
import type { InventoryItem, Warehouse } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { Dashboard } from "@/components/dashboard"
import { GraphVisualizer } from "@/components/graph-visualizer"

const inter = Inter({ subsets: ["latin"] })

export default function InventoryManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: generateId(), name: "WH-001: Main Distribution Center", itemCount: 0 },
    { id: generateId(), name: "WH-002: West Coast Hub", itemCount: 0 },
    { id: generateId(), name: "WH-003: East Coast Store", itemCount: 0 },
  ])

  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [showAddItem, setShowAddItem] = useState(false)
  const [showEditItem, setShowEditItem] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showAddWarehouse, setShowAddWarehouse] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [transferringItem, setTransferringItem] = useState<InventoryItem | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "dashboard" | "graph">("table")

  // Add new state variables for batch operations and barcode scanning
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])
  const [showBatchEdit, setShowBatchEdit] = useState(false)
  const [showBatchTransfer, setShowBatchTransfer] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showBarcodeResult, setShowBarcodeResult] = useState(false)
  const [scannedCode, setScannedCode] = useState<string>("")
  const [addWithScannedSku, setAddWithScannedSku] = useState<string | null>(null)

  // Update warehouse item counts
  useEffect(() => {
    setWarehouses((prev) =>
      prev.map((warehouse) => ({
        ...warehouse,
        itemCount: items.filter((item) => item.location === warehouse.name).length,
      })),
    )
  }, [items])

  // Add handlers for batch operations
  const handleSelectItem = (item: InventoryItem, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, item])
    } else {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id))
    }
  }

  const handleSelectAllItems = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([])
    }
  }

  const handleBatchEdit = () => {
    if (selectedItems.length > 0) {
      setShowBatchEdit(true)
    }
  }

  const handleBatchTransfer = () => {
    if (selectedItems.length > 0) {
      setShowBatchTransfer(true)
    }
  }

  const handleUpdateBatchItems = (updatedItems: InventoryItem[]) => {
    setItems((prev) =>
      prev.map((item) => {
        const updatedItem = updatedItems.find((updated) => updated.id === item.id)
        return updatedItem || item
      }),
    )
    setSelectedItems([])
  }

  const handleBatchTransferItems = (itemIds: string[], newLocation: string) => {
    setItems((prev) =>
      prev.map((item) =>
        itemIds.includes(item.id) ? { ...item, location: newLocation, lastUpdated: new Date().toISOString() } : item,
      ),
    )
    setSelectedItems([])
  }

  // Add handlers for barcode scanning
  const handleScanBarcode = () => {
    setShowBarcodeScanner(true)
  }

  const handleScanSuccess = (decodedText: string) => {
    setScannedCode(decodedText)
    setShowBarcodeScanner(false)
    setShowBarcodeResult(true)
  }

  const handleAddWithScannedSku = () => {
    setAddWithScannedSku(scannedCode)
    setShowBarcodeResult(false)
    setShowAddItem(true)
  }

  // Keep the existing handlers
  const addItem = (item: Omit<InventoryItem, "id" | "lastUpdated">) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      lastUpdated: new Date().toISOString(),
    }
    setItems((prev) => [...prev, newItem])
    setAddWithScannedSku(null)
  }

  const updateItem = (updatedItem: InventoryItem) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...updatedItem, lastUpdated: new Date().toISOString() } : item,
      ),
    )
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setSelectedItems((prev) => prev.filter((item) => item.id !== id))
  }

  const transferItem = (itemId: string, newLocation: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, location: newLocation, lastUpdated: new Date().toISOString() } : item,
      ),
    )
  }

  const addWarehouse = (name: string) => {
    const newWarehouse: Warehouse = {
      id: generateId(),
      name,
      itemCount: 0,
    }
    setWarehouses((prev) => [...prev, newWarehouse])
  }

  const filteredItems =
    selectedWarehouse === "all" ? items : items.filter((item) => item.location === selectedWarehouse)

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowEditItem(true)
  }

  const handleTransferItem = (item: InventoryItem) => {
    setTransferringItem(item)
    setShowTransfer(true)
  }

  // Reset selected items when changing view mode
  useEffect(() => {
    setSelectedItems([])
  }, [viewMode])

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      <div className="flex flex-col lg:flex-row h-screen">
        <Sidebar
          warehouses={warehouses}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={setSelectedWarehouse}
          onAddWarehouse={() => setShowAddWarehouse(true)}
        />

        <div className="flex-1 flex flex-col pt-16 lg:pt-0">
          <TopBar
            items={filteredItems}
            selectedItems={selectedItems}
            onAddItem={() => setShowAddItem(true)}
            onBatchEdit={handleBatchEdit}
            onBatchTransfer={handleBatchTransfer}
            onScanBarcode={handleScanBarcode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {viewMode === "table" ? (
              <InventoryTable
                items={filteredItems}
                onEditItem={handleEditItem}
                onDeleteItem={deleteItem}
                onTransferItem={handleTransferItem}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onSelectAllItems={handleSelectAllItems}
              />
            ) : viewMode === "dashboard" ? (
              <Dashboard items={items} warehouses={warehouses} selectedWarehouse={selectedWarehouse} />
            ) : (
              <GraphVisualizer
                items={items}
                warehouses={warehouses}
                selectedWarehouse={selectedWarehouse}
                onItemSelect={handleEditItem}
                onTransferItem={handleTransferItem}
              />
            )}
          </main>
        </div>
      </div>

      {showAddItem && (
        <AddItemModal
          warehouses={warehouses}
          onClose={() => {
            setShowAddItem(false)
            setAddWithScannedSku(null)
          }}
          onAddItem={addItem}
          initialSku={addWithScannedSku || undefined}
        />
      )}

      {showEditItem && editingItem && (
        <EditItemModal
          item={editingItem}
          warehouses={warehouses}
          onClose={() => {
            setShowEditItem(false)
            setEditingItem(null)
          }}
          onUpdateItem={updateItem}
        />
      )}

      {showTransfer && transferringItem && (
        <TransferModal
          item={transferringItem}
          warehouses={warehouses}
          onClose={() => {
            setShowTransfer(false)
            setTransferringItem(null)
          }}
          onTransfer={transferItem}
        />
      )}

      {showAddWarehouse && (
        <AddWarehouseModal
          existingWarehouses={warehouses}
          onClose={() => setShowAddWarehouse(false)}
          onAddWarehouse={addWarehouse}
        />
      )}

      {/* Add new modals for batch operations and barcode scanning */}
      {showBatchEdit && (
        <BatchEditModal
          selectedItems={selectedItems}
          warehouses={warehouses}
          onClose={() => setShowBatchEdit(false)}
          onUpdateItems={handleUpdateBatchItems}
        />
      )}

      {showBatchTransfer && (
        <BatchTransferModal
          selectedItems={selectedItems}
          warehouses={warehouses}
          onClose={() => setShowBatchTransfer(false)}
          onTransferItems={handleBatchTransferItems}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner onClose={() => setShowBarcodeScanner(false)} onScanSuccess={handleScanSuccess} />
      )}

      {showBarcodeResult && (
        <BarcodeResultModal
          scannedCode={scannedCode}
          items={items}
          onClose={() => setShowBarcodeResult(false)}
          onAddItem={handleAddWithScannedSku}
          onEditItem={(item) => {
            setEditingItem(item)
            setShowBarcodeResult(false)
            setShowEditItem(true)
          }}
        />
      )}
    </div>
  )
}
