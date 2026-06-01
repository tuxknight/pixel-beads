'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CanvasTool } from '@/lib/types'
import { palettes } from '@/lib/palettes'
import { saveDesign, generateId } from '@/lib/storage'

function createGrid(w: number, h: number): (string | null)[][] {
  return Array.from({ length: h }, () => Array(w).fill(null))
}

export function useCanvas() {
  const [grid, setGrid] = useState<(string | null)[][]>(() => createGrid(32, 32))
  const [gridWidth, setGridWidth] = useState(32)
  const [gridHeight, setGridHeight] = useState(32)
  const [selectedColor, setSelectedColor] = useState('#212121')
  const [tool, setTool] = useState<CanvasTool>({ type: 'draw' })
  const [cellSize, setCellSize] = useState(20)
  const [paletteKey, setPaletteKey] = useState<'perler' | 'artkal' | 'hama'>('perler')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const historyRef = useRef<(string | null)[][][]>([])
  const futureRef = useRef<(string | null)[][][]>([])
  const designIdRef = useRef(generateId())
  const createdAtRef = useRef(Date.now())
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const pushHistory = useCallback(() => {
    historyRef.current.push(grid.map(row => [...row]))
    if (historyRef.current.length > 50) historyRef.current.shift()
    futureRef.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [grid])

  const setCell = useCallback((row: number, col: number, color: string | null) => {
    pushHistory()
    setGrid(prev => {
      const next = prev.map(r => [...r])
      next[row][col] = color
      return next
    })
  }, [pushHistory])

  const floodFill = useCallback((row: number, col: number, newColor: string | null) => {
    if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) return
    const targetColor = grid[row][col]
    if (targetColor === newColor) return

    pushHistory()

    const next = grid.map(r => [...r])
    const queue: [number, number][] = [[row, col]]
    const visited = new Set<string>()
    visited.add(`${row},${col}`)

    while (queue.length > 0) {
      const [r, c] = queue.shift()!
      next[r][c] = newColor

      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr
        const nc = c + dc
        const key = `${nr},${nc}`
        if (
          nr >= 0 && nr < gridHeight &&
          nc >= 0 && nc < gridWidth &&
          !visited.has(key) &&
          next[nr][nc] === targetColor
        ) {
          visited.add(key)
          queue.push([nr, nc])
        }
      }
    }

    setGrid(next)
  }, [grid, gridWidth, gridHeight, pushHistory])

  const eyedropper = useCallback((row: number, col: number) => {
    const color = grid[row]?.[col]
    if (color) setSelectedColor(color)
  }, [grid])

  const toggleTool = useCallback((t: CanvasTool['type']) => {
    setTool({ type: t })
  }, [])

  const resizeGrid = useCallback((newW: number, newH: number) => {
    pushHistory()
    setGrid(prev => {
      const next: (string | null)[][] = []
      for (let r = 0; r < newH; r++) {
        next.push([])
        for (let c = 0; c < newW; c++) {
          next[r][c] = (r < prev.length && c < prev[r].length) ? prev[r][c] : null
        }
      }
      return next
    })
    setGridWidth(newW)
    setGridHeight(newH)
  }, [pushHistory])

  const clearGrid = useCallback(() => {
    pushHistory()
    setGrid(createGrid(gridWidth, gridHeight))
    futureRef.current = []
    setCanRedo(false)
  }, [gridWidth, gridHeight, pushHistory])

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    futureRef.current.push(grid.map(row => [...row]))
    const prev = historyRef.current.pop()!
    setGrid(prev)
    setCanUndo(historyRef.current.length > 0)
    setCanRedo(true)
  }, [grid])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return
    historyRef.current.push(grid.map(row => [...row]))
    const next = futureRef.current.pop()!
    setGrid(next)
    setCanUndo(true)
    setCanRedo(futureRef.current.length > 0)
  }, [grid])

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveDesign({
        id: designIdRef.current,
        name: '未命名设计',
        grid,
        width: gridWidth,
        height: gridHeight,
        palette: paletteKey,
        createdAt: createdAtRef.current,
        updatedAt: Date.now(),
      })
    }, 2000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [grid, gridWidth, gridHeight, paletteKey])

  const palette = palettes[paletteKey]

  return {
    grid,
    gridWidth,
    gridHeight,
    selectedColor,
    tool,
    cellSize,
    paletteKey,
    palette,
    canUndo,
    canRedo,
    initGrid: createGrid,
    setPaletteKey,
    setGrid,
    setCell,
    floodFill,
    eyedropper,
    toggleTool,
    setSelectedColor,
    resizeGrid,
    clearGrid,
    undo,
    redo,
  }
}
