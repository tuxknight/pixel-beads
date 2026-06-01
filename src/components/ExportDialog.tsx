'use client'

import { useState, useCallback } from 'react'
import { palettes } from '@/lib/palettes'

interface ExportDialogProps {
  grid: (string | null)[][]
  gridWidth: number
  gridHeight: number
  paletteKey: string
  onClose: () => void
}

export default function ExportDialog({ grid, gridWidth, gridHeight, paletteKey, onClose }: ExportDialogProps) {
  const [mode, setMode] = useState<'png' | 'list'>('png')
  const [copied, setCopied] = useState(false)

  const exportPNG = useCallback(() => {
    const palette = palettes[paletteKey]
    const cellSize = 15
    const legendItemHeight = 20
    const counts = new Map<string, number>()

    for (const row of grid) {
      for (const cell of row) {
        if (cell) counts.set(cell, (counts.get(cell) || 0) + 1)
      }
    }

    const legendItems = palette.colors
      .filter(c => counts.has(c.hex))
      .map(c => ({ ...c, count: counts.get(c.hex)! }))

    const legendCols = 3
    const legendRows = Math.ceil(legendItems.length / legendCols)
    const legendPad = 10
    const totalLegendH = legendRows * legendItemHeight + legendPad

    const canvasW = gridWidth * cellSize
    const canvasH = gridHeight * cellSize + totalLegendH

    const canvas = document.createElement('canvas')
    canvas.width = canvasW
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasW, canvasH)

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const color = grid[y][x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          const info = palette.colors.find(c => c.hex === color)
          if (info) {
            ctx.fillStyle = '#000000'
            ctx.font = '7px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(info.code, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2)
          }
        }
      }
    }

    const legendY = gridHeight * cellSize + 5
    const colW = canvasW / legendCols

    legendItems.forEach((item, i) => {
      const col = i % legendCols
      const row = Math.floor(i / legendCols)
      const x = col * colW + 4
      const y = legendY + row * legendItemHeight

      ctx.fillStyle = item.hex
      ctx.fillRect(x, y, 12, 12)
      ctx.strokeStyle = '#cccccc'
      ctx.strokeRect(x, y, 12, 12)

      ctx.fillStyle = '#000000'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(`${item.code} ${item.name} x${item.count}`, x + 16, y + 1)
    })

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'beads-pattern.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [grid, gridWidth, gridHeight, paletteKey])

  const exportList = useCallback(async () => {
    const palette = palettes[paletteKey]
    const counts = new Map<string, number>()

    for (const row of grid) {
      for (const cell of row) {
        if (cell) counts.set(cell, (counts.get(cell) || 0) + 1)
      }
    }

    const items = palette.colors
      .filter(c => counts.has(c.hex))
      .map(c => ({
        code: c.code,
        name: c.name,
        hex: c.hex,
        count: counts.get(c.hex)!,
      }))

    let total = 0
    for (const item of items) total += item.count

    const padCode = (s: string) => s.padEnd(6)
    const padName = (s: string) => s.padEnd(10)
    const padCount = (n: number) => String(n).padStart(4)

    const lines = [
      '=== 颜色清单 ===',
      `Brand: ${palette.name}`,
      `Size: ${gridWidth} x ${gridHeight}`,
      '',
      `${padCode('Color')}${padName('')}Qty`,
      '──────────────────────',
      ...items.map(i => `${padCode(i.code)}${padName(i.name)}${padCount(i.count)}`),
      '──────────────────────',
      `Total: ${total} beads`,
    ]

    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [grid, gridWidth, gridHeight, paletteKey])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">导出</h2>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('png')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
              mode === 'png' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Export PNG
          </button>
          <button
            onClick={() => setMode('list')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
              mode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Export Color List
          </button>
        </div>

        {mode === 'png' ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              导出 PNG 图片，包含颜色标注和色号图例。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={exportPNG}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                下载 PNG
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              复制颜色清单到剪贴板。
            </p>
            {copied && (
              <div className="mb-4 p-2 bg-green-100 text-green-800 text-sm rounded">
                已复制到剪贴板
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={exportList}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                复制到剪贴板
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
