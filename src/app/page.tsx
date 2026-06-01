'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useCanvas } from '@/hooks/useCanvas'
import Toolbar from '@/components/Toolbar'
import PalettePanel from '@/components/PalettePanel'
import ImageImport from '@/components/ImageImport'
import ExportDialog from '@/components/ExportDialog'
import { saveDesign, generateId } from '@/lib/storage'

const Canvas = dynamic(() => import('@/components/Canvas'), { ssr: false })

const RECENT_KEY = 'beads-recent-colors'

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveRecent(colors: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(colors))
}

const tabDefs: { key: 'perler' | 'artkal' | 'hama'; label: string }[] = [
  { key: 'perler', label: 'Perler' },
  { key: 'artkal', label: 'Artkal' },
  { key: 'hama', label: 'Hama' },
]

export default function Home() {
  const {
    grid, gridWidth, gridHeight, selectedColor, tool, cellSize,
    paletteKey, canUndo, canRedo,
    setCell, floodFill, eyedropper, toggleTool, setSelectedColor,
    resizeGrid, clearGrid, undo, redo,
    setPaletteKey, setGrid,
  } = useCanvas()

  const [recentColors, setRecentColors] = useState<string[]>(loadRecent)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showGridLines, setShowGridLines] = useState(true)

  const addRecent = (color: string) => {
    setRecentColors(prev => {
      const next = [color, ...prev.filter(c => c !== color)].slice(0, 5)
      saveRecent(next)
      return next
    })
  }

  const handleCellClick = (row: number, col: number) => {
    switch (tool.type) {
      case 'draw':
        if (selectedColor) setCell(row, col, selectedColor)
        break
      case 'erase':
        setCell(row, col, null)
        break
      case 'fill':
        if (selectedColor) floodFill(row, col, selectedColor)
        break
      case 'eyedropper': {
        const color = grid[row]?.[col]
        if (color) {
          eyedropper(row, col)
          addRecent(color)
        }
        break
      }
    }
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    addRecent(color)
  }

  const handleImageApply = (newGrid: (string | null)[][]) => {
    setGrid(newGrid)
  }

  const handleSave = () => {
    saveDesign({
      id: generateId(),
      name: '未命名设计',
      grid,
      width: gridWidth,
      height: gridHeight,
      palette: paletteKey,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  let totalCells = 0
  const colorSet = new Set<string>()
  for (const row of grid) {
    for (const cell of row) {
      if (cell) {
        totalCells++
        colorSet.add(cell)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 shrink-0" style={{ backgroundColor: '#1a1a1a' }}>
        <h1 className="text-xl font-bold">拼豆图纸</h1>

        <div className="flex gap-1">
          {tabDefs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setPaletteKey(tab.key)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                paletteKey === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            title="导入图片"
            onClick={() => setShowImport(true)}
            className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-gray-700"
          >
            🖼
          </button>
          <button
            title="保存"
            onClick={handleSave}
            className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-gray-700"
          >
            💾
          </button>
          <button
            title="导出"
            onClick={() => setShowExport(true)}
            className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-gray-700"
          >
            📄
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          tool={tool}
          onToolChange={toggleTool}
          onClear={clearGrid}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Canvas
              grid={grid}
              gridWidth={gridWidth}
              gridHeight={gridHeight}
              selectedColor={selectedColor}
              tool={tool}
              cellSize={cellSize}
              showGridLines={showGridLines}
              onCellClick={handleCellClick}
            />
          </div>

          <div className="flex items-center justify-between px-3 py-1 shrink-0" style={{ backgroundColor: '#111' }}>
            <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showGridLines}
                onChange={e => setShowGridLines(e.target.checked)}
              />
              网格线
            </label>
            <span className="text-xs text-gray-500">
              {gridWidth} × {gridHeight} | {colorSet.size}色 | 共{totalCells}颗
            </span>
          </div>

          <PalettePanel
            paletteKey={paletteKey}
            selectedColor={selectedColor}
            recentColors={recentColors}
            onPaletteChange={setPaletteKey}
            onColorSelect={handleColorSelect}
          />
        </div>
      </div>

      {showImport && (
        <ImageImport
          onClose={() => setShowImport(false)}
          onApply={handleImageApply}
          paletteKey={paletteKey}
        />
      )}
      {showExport && (
        <ExportDialog
          grid={grid}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          paletteKey={paletteKey}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
