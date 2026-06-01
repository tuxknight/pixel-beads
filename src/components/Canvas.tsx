'use client'

import { useRef, useEffect, useState } from 'react'
import { CanvasTool } from '@/lib/types'

interface CanvasProps {
  grid: (string | null)[][]
  gridWidth: number
  gridHeight: number
  selectedColor: string | null
  tool: CanvasTool
  cellSize: number
  onCellClick: (row: number, col: number) => void
  showGridLines?: boolean
}

export default function Canvas({
  grid,
  gridWidth,
  gridHeight,
  selectedColor: _selectedColor,
  tool,
  cellSize,
  onCellClick,
  showGridLines = true,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const scaleRef = useRef(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const isDrawingRef = useRef(false)
  const toolRef = useRef(tool)
  toolRef.current = tool

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = containerSize.width
    const h = containerSize.height

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.translate(offsetRef.current.x, offsetRef.current.y)
    ctx.scale(scale, scale)

    const totalW = gridWidth * cellSize
    const totalH = gridHeight * cellSize

    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(0, 0, totalW, totalH)

    for (let r = 0; r < gridHeight; r++) {
      for (let c = 0; c < gridWidth; c++) {
        const color = grid[r]?.[c]
        if (!color) continue
        ctx.fillStyle = color
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
      }
    }

    if (showGridLines) {
      ctx.strokeStyle = '#d0d0d0'
      ctx.lineWidth = 0.5 / scale

      for (let c = 0; c <= gridWidth; c++) {
        ctx.beginPath()
        ctx.moveTo(c * cellSize, 0)
        ctx.lineTo(c * cellSize, totalH)
        ctx.stroke()
      }
      for (let r = 0; r <= gridHeight; r++) {
        ctx.beginPath()
        ctx.moveTo(0, r * cellSize)
        ctx.lineTo(totalW, r * cellSize)
        ctx.stroke()
      }
    }

    ctx.restore()
  }, [grid, gridWidth, gridHeight, cellSize, showGridLines, scale, containerSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getCellCoords = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const s = scaleRef.current
      const worldX = (px - offsetRef.current.x) / s
      const worldY = (py - offsetRef.current.y) / s
      const col = Math.floor(worldX / cellSize)
      const row = Math.floor(worldY / cellSize)
      if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) return null
      return { row, col }
    }

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId)
      const coords = getCellCoords(e)
      if (!coords) return
      const t = toolRef.current
      if (t.type === 'eyedropper' || t.type === 'fill') {
        onCellClick(coords.row, coords.col)
        return
      }
      isDrawingRef.current = true
      onCellClick(coords.row, coords.col)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      const t = toolRef.current
      if (t.type !== 'draw' && t.type !== 'erase') return
      const coords = getCellCoords(e)
      if (coords) onCellClick(coords.row, coords.col)
    }

    const onPointerUp = () => {
      isDrawingRef.current = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const s = scaleRef.current
      const worldX = (px - offsetRef.current.x) / s
      const worldY = (py - offsetRef.current.y) / s
      const direction = e.deltaY > 0 ? -1 : 1
      const newScale = Math.max(0.5, Math.min(5, s * (direction > 0 ? 1.1 : 0.9)))
      offsetRef.current.x = px - worldX * newScale
      offsetRef.current.y = py - worldY * newScale
      scaleRef.current = newScale
      setScale(newScale)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [cellSize, gridWidth, gridHeight, onCellClick])

  useEffect(() => {
    offsetRef.current = { x: 0, y: 0 }
    scaleRef.current = 1
    setScale(1)
  }, [gridWidth, gridHeight])

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden rounded-lg"
      style={{ backgroundColor: '#1a1a1a', minHeight: 400, touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: 'crosshair' }}
      />
    </div>
  )
}
