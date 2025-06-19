import type { InventoryItem } from "./types"

export function exportToCSV(items: InventoryItem[], filename: string) {
  const headers = ["ID", "Name", "SKU", "Quantity", "Location", "Category", "Last Updated"]

  const csvContent = [
    headers.join(","),
    ...items.map((item) =>
      [
        item.id,
        `"${item.name}"`,
        item.sku,
        item.quantity,
        `"${item.location}"`,
        `"${item.category || ""}"`,
        `"${new Date(item.lastUpdated).toLocaleString()}"`,
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function exportToExcel(items: InventoryItem[], filename: string) {
  // Simple Excel export using CSV format with .xlsx extension
  // For a more robust Excel export, you would use a library like xlsx
  const headers = ["ID", "Name", "SKU", "Quantity", "Location", "Category", "Last Updated"]

  const csvContent = [
    headers.join("\t"),
    ...items.map((item) =>
      [
        item.id,
        item.name,
        item.sku,
        item.quantity,
        item.location,
        item.category || "",
        new Date(item.lastUpdated).toLocaleString(),
      ].join("\t"),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
