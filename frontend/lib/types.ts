export interface InventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  location: string
  category?: string
  lastUpdated: string
}

export interface Warehouse {
  id: string
  name: string
  itemCount: number
}
