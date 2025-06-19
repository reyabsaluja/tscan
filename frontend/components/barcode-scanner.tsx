"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Camera, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BarcodeScannerProps {
  onClose: () => void
  onScanSuccess: (decodedText: string) => void
}

export function BarcodeScanner({ onClose, onScanSuccess }: BarcodeScannerProps) {
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerContainerId = "barcode-scanner-container"

  // Initialize cameras
  useEffect(() => {
    const initializeCameras = async () => {
      try {
        // Request camera permissions first
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop()) // Stop the test stream

        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices
          .filter((device) => device.kind === "videoinput")
          .map((device) => ({
            id: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          }))

        if (videoDevices.length > 0) {
          setAvailableCameras(videoDevices)
          setSelectedCamera(videoDevices[0].id)
        } else {
          setError("No camera devices found")
        }
      } catch (err) {
        setError(`Error accessing cameras: ${err}`)
      }
    }

    initializeCameras()

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startScanner = async () => {
    if (!selectedCamera || isScanning) return

    try {
      setIsScanning(true)
      setError(null)

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Get video stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsStarted(true)

        // Start scanning using a simple approach
        startBarcodeDetection()
      }
    } catch (err) {
      setError(`Error starting camera: ${err}`)
      setIsScanning(false)
    }
  }

  const startBarcodeDetection = () => {
    // For now, we'll use a simple implementation
    // In a real app, you might want to use a more robust barcode detection library
    // This is a placeholder that simulates barcode detection
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const detectBarcode = () => {
      if (!videoRef.current || !isStarted) return

      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0)

        // This is a simplified barcode detection
        // In a real implementation, you'd use a proper barcode detection library
        // For demo purposes, we'll simulate detection after 3 seconds
        if (!scannerRef.current) {
          scannerRef.current = setTimeout(() => {
            // Simulate a successful scan
            const simulatedBarcode = "123456789012"
            onScanSuccess(simulatedBarcode)
          }, 3000)
        }
      }

      if (isStarted) {
        requestAnimationFrame(detectBarcode)
      }
    }

    detectBarcode()
  }

  const stopScanner = () => {
    try {
      setIsStarted(false)
      setIsScanning(false)

      // Clear any timeouts
      if (scannerRef.current) {
        clearTimeout(scannerRef.current)
        scannerRef.current = null
      }

      // Stop video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    } catch (err) {
      console.error("Error stopping scanner:", err)
    }
  }

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isStarted) {
      stopScanner()
    }
    setSelectedCamera(e.target.value)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scan Barcode or QR Code</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <div className="space-y-2">
            <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700">
              Select Camera
            </label>
            <select
              id="camera-select"
              className="w-full border border-gray-300 rounded-md p-2"
              value={selectedCamera || ""}
              onChange={handleCameraChange}
              disabled={isStarted}
            >
              {availableCameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center">
            {isStarted ? (
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            ) : (
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Camera preview will appear here</p>
              </div>
            )}

            {isStarted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
                  <div className="text-blue-500 text-sm font-medium">Position barcode here</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {!isStarted ? (
              <Button
                onClick={startScanner}
                className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                disabled={!selectedCamera || isScanning}
              >
                <Scan className="w-4 h-4" />
                {isScanning ? "Starting..." : "Start Scanning"}
              </Button>
            ) : (
              <Button onClick={stopScanner} className="flex-1 bg-red-600 hover:bg-red-700 gap-2">
                <X className="w-4 h-4" />
                Stop Scanning
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            {isStarted
              ? "Position the barcode within the frame. Detection will happen automatically."
              : "Click 'Start Scanning' to begin barcode detection."}
          </p>
        </div>
      </div>
    </div>
  )
}
