"use client"

import type React from "react"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw, Info } from "lucide-react"
import type { InventoryItem, Warehouse } from "@/lib/types"

interface GraphVisualizerProps {
  items: InventoryItem[]
  warehouses: Warehouse[]
  selectedWarehouse: string
  onItemSelect: (item: InventoryItem) => void
  onTransferItem: (item: InventoryItem) => void
}

interface Node {
  id: string
  type: "warehouse" | "item" | "category"
  label: string
  x: number
  y: number
  radius: number
  color: string
  data?: InventoryItem | Warehouse
  connections: string[]
}

interface Edge {
  from: string
  to: string
  weight: number
  color: string
}

export function GraphVisualizer({
  items,
  warehouses,
  selectedWarehouse,
  onItemSelect,
  onTransferItem,
}: GraphVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isInitialized, setIsInitialized] = useState(false)

  // Generate graph data with explicit positioning
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>()
    const edgeList: Edge[] = []

    // Calculate canvas center
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2

    // Create warehouse nodes in a circle around the center
    warehouses.forEach((warehouse, index) => {
      const warehouseCount = Math.max(1, warehouses.length)
      const angle = (index / warehouseCount) * 2 * Math.PI
      const radius = Math.min(centerX, centerY) * 0.6 // Use 60% of the smaller dimension

      nodeMap.set(warehouse.id, {
        id: warehouse.id,
        type: "warehouse",
        label: warehouse.name,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 40 + Math.min(warehouse.itemCount * 2, 20),
        color: "#3b82f6",
        data: warehouse,
        connections: [],
      })
    })

    // Create category nodes in a smaller inner circle
    const categories = new Set(items.map((item) => item.category || "Uncategorized"))
    const categoryColors = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

    Array.from(categories).forEach((category, index) => {
      const categoryItems = items.filter((item) => (item.category || "Uncategorized") === category)
      const categoryCount = Math.max(1, categories.size)
      const angle = (index / categoryCount) * 2 * Math.PI
      const radius = Math.min(centerX, centerY) * 0.3 // Use 30% of the smaller dimension

      nodeMap.set(`category-${category}`, {
        id: `category-${category}`,
        type: "category",
        label: category,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 25 + Math.min(categoryItems.length * 1.5, 15),
        color: categoryColors[index % categoryColors.length],
        data: undefined,
        connections: [],
      })
    })

    // Create item nodes and connections
    items.forEach((item, index) => {
      const warehouse = warehouses.find((w) => w.name === item.location)
      const warehouseNode = warehouse ? nodeMap.get(warehouse.id) : null
      const categoryNode = nodeMap.get(`category-${item.category || "Uncategorized"}`)

      if (warehouseNode && categoryNode) {
        // Position item between warehouse and category with some randomness
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * 40 + 20

        // Calculate midpoint between warehouse and category
        const midX = (warehouseNode.x + categoryNode.x) / 2
        const midY = (warehouseNode.y + categoryNode.y) / 2

        // Add some randomness to prevent overlap
        const itemX = midX + Math.cos(angle) * distance
        const itemY = midY + Math.sin(angle) * distance

        const itemNode: Node = {
          id: item.id,
          type: "item",
          label: item.name,
          x: itemX,
          y: itemY,
          radius: 8 + Math.min(item.quantity / 5, 15),
          color: "#6b7280",
          data: item,
          connections: [warehouse.id, `category-${item.category || "Uncategorized"}`],
        }

        nodeMap.set(item.id, itemNode)

        // Create edges
        edgeList.push({
          from: warehouse.id,
          to: item.id,
          weight: item.quantity,
          color: "#e5e7eb",
        })

        edgeList.push({
          from: item.id,
          to: `category-${item.category || "Uncategorized"}`,
          weight: 1,
          color: "#f3f4f6",
        })

        // Update connections
        warehouseNode.connections.push(item.id)
        categoryNode.connections.push(item.id)
      }
    })

    return { nodes: Array.from(nodeMap.values()), edges: edgeList }
  }, [items, warehouses, canvasSize])

  // Draw the graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get actual canvas dimensions
    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)

    // Clear canvas with a slight background color
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and offset
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(zoom, zoom)

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)

      if (fromNode && toNode) {
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = edge.color
        ctx.lineWidth = Math.max(1, edge.weight / 10)
        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id
      const isHighlighted =
        selectedWarehouse !== "all" &&
        ((node.type === "warehouse" && (node.data as Warehouse)?.name === selectedWarehouse) ||
          (node.type === "item" && (node.data as InventoryItem)?.location === selectedWarehouse))

      // Node shadow
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius + 2, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fill()

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? "#1d4ed8" : isHighlighted ? node.color : node.color + "80"
      ctx.fill()

      // Node border
      if (isSelected || isHighlighted) {
        ctx.strokeStyle = isSelected ? "#1d4ed8" : node.color
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Node label
      ctx.fillStyle = "#1f2937"
      ctx.font = `${Math.max(10, 12 / zoom)}px Inter, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const text = node.label.length > 12 ? node.label.substring(0, 12) + "..." : node.label

      if (node.type === "warehouse") {
        ctx.fillText(text, node.x, node.y - 5)
        ctx.font = `${Math.max(8, 10 / zoom)}px Inter, sans-serif`
        ctx.fillStyle = "#6b7280"
        ctx.fillText(`${(node.data as Warehouse)?.itemCount || 0} items`, node.x, node.y + 8)
      } else if (node.type === "item") {
        ctx.fillText(text, node.x, node.y - 5)
        ctx.font = `${Math.max(8, 10 / zoom)}px Inter, sans-serif`
        ctx.fillStyle = "#6b7280"
        ctx.fillText(`Qty: ${(node.data as InventoryItem)?.quantity || 0}`, node.x, node.y + 8)
      } else {
        ctx.fillText(text, node.x, node.y)
      }
    })

    ctx.restore()
  }, [nodes, edges, zoom, offset, selectedNode, selectedWarehouse])

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - offset.x) / zoom
    const y = (event.clientY - rect.top - offset.y) / zoom

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= node.radius
    })

    setSelectedNode(clickedNode || null)

    if (clickedNode && clickedNode.type === "item" && clickedNode.data) {
      onItemSelect(clickedNode.data as InventoryItem)
    }
  }

  // Handle mouse events for dragging
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y })
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3))
  const handleReset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setSelectedNode(null)
  }

  // Initialize canvas and handle resizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      // Get the actual dimensions of the container
      const rect = container.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      // Update state with actual dimensions
      setCanvasSize({ width, height })

      // Set canvas dimensions with device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr

      // Set the CSS dimensions
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Scale the context to account for the device pixel ratio
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      setIsInitialized(true)
    }

    // Update canvas size on mount and window resize
    updateCanvasSize()

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      resizeObserver.disconnect()
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!isInitialized) return

    const animate = () => {
      drawGraph()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [drawGraph, isInitialized])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Network Graph</h2>
          <p className="text-gray-600 mt-1">
            Interactive visualization of warehouse relationships and item distribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleZoomIn} variant="outline" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomOut} variant="outline" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden">
            <CardContent className="p-0 h-full" ref={containerRef}>
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                <span className="text-sm">Warehouses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <span className="text-sm">Items</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500"></div>
                <span className="text-sm">Categories</span>
              </div>
              <div className="text-xs text-gray-600 mt-3">
                • Node size represents quantity/count • Click nodes to interact • Drag to pan, use controls to zoom
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle>Node Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {selectedNode.type}
                  </Badge>
                  <h3 className="font-medium">{selectedNode.label}</h3>
                </div>

                {selectedNode.type === "warehouse" && selectedNode.data && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Items: {(selectedNode.data as Warehouse).itemCount}</p>
                    <p className="text-sm text-gray-600">Connections: {selectedNode.connections.length}</p>
                  </div>
                )}

                {selectedNode.type === "item" && selectedNode.data && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">SKU: {(selectedNode.data as InventoryItem).sku}</p>
                    <p className="text-sm text-gray-600">Quantity: {(selectedNode.data as InventoryItem).quantity}</p>
                    <p className="text-sm text-gray-600">
                      Category: {(selectedNode.data as InventoryItem).category || "Uncategorized"}
                    </p>
                    <Button
                      onClick={() => onTransferItem(selectedNode.data as InventoryItem)}
                      size="sm"
                      className="w-full mt-3"
                    >
                      Transfer Item
                    </Button>
                  </div>
                )}

                {selectedNode.type === "category" && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Connected Items: {selectedNode.connections.length}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
