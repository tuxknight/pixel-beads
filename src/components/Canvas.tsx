'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Line } from 'react-konva'
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
  selectedColor,
  tool,
  cellSize,
  onCellClick,
  showGridLines = true,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const getCellCoords = useCallback(
    (e: any) => {
      const stage = stageRef.current
      if (!stage) return null
      const pointer = stage.getPointerPosition()
      if (!pointer) return null
      const layerPos = {
        x: (pointer.x - stage.x()) / stage.scaleX(),
        y: (pointer.y - stage.y()) / stage.scaleY(),
      }
      const col = Math.floor(layerPos.x / cellSize)
      const row = Math.floor(layerPos.y / cellSize)
      if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) return null
      return { row, col }
    },
    [cellSize, gridWidth, gridHeight]
  )

  const handleCellAction = useCallback(
    (e: any) => {
      const coords = getCellCoords(e)
      if (coords) onCellClick(coords.row, coords.col)
    },
    [getCellCoords, onCellClick]
  )

  const handleMouseDown = useCallback(
    (e: any) => {
      if (tool.type === 'eyedropper' || tool.type === 'fill') {
        handleCellAction(e)
        return
      }
      setIsDrawing(true)
      handleCellAction(e)
    },
    [tool, handleCellAction]
  )

  const handleMouseMove = useCallback(
    (e: any) => {
      if (!isDrawing || (tool.type !== 'draw' && tool.type !== 'erase')) return
      handleCellAction(e)
    },
    [isDrawing, tool, handleCellAction]
  )

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = Math.max(0.5, Math.min(5, oldScale * (direction > 0 ? 1.1 : 0.9)))
    stage.scale({ x: newScale, y: newScale })
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    stage.position(newPos)
    setScale(newScale)
  }, [])

  const renderGrid = () => {
    const elements: React.ReactElement[] = []

    // Background
    elements.push(
      <Rect
        key="bg"
        x={0}
        y={0}
        width={gridWidth * cellSize}
        height={gridHeight * cellSize}
        fill="#e8e8e8"
      />
    )

    // Cell fills
    for (let r = 0; r < gridHeight; r++) {
      for (let c = 0; c < gridWidth; c++) {
        const color = grid[r]?.[c]
        if (!color) continue
        elements.push(
          <Rect
            key={`cell-${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill={color}
          />
        )
      }
    }

    // Grid lines — vertical
    if (showGridLines) {
      for (let c = 0; c <= gridWidth; c++) {
        elements.push(
          <Line
            key={`v-${c}`}
            points={[c * cellSize, 0, c * cellSize, gridHeight * cellSize]}
            stroke="#d0d0d0"
            strokeWidth={0.5}
          />
        )
      }
      // Grid lines — horizontal
      for (let r = 0; r <= gridHeight; r++) {
        elements.push(
          <Line
            key={`h-${r}`}
            points={[0, r * cellSize, gridWidth * cellSize, r * cellSize]}
            stroke="#d0d0d0"
            strokeWidth={0.5}
          />
        )
      }
    }

    return elements
  }

  // Reset position when grid changes
  useEffect(() => {
    const stage = stageRef.current
    if (stage) {
      stage.position({ x: 0, y: 0 })
      stage.scale({ x: 1, y: 1 })
      setScale(1)
    }
  }, [gridWidth, gridHeight])

  const stageWidth = dimensions.width
  const stageHeight = dimensions.height

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden rounded-lg"
      style={{ backgroundColor: '#1a1a1a', minHeight: 400 }}
    >
    <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        draggable={false}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <Layer>{renderGrid()}</Layer>
      </Stage>
    </div>
  )
}
