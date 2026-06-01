'use client'

import { useState, useRef, useCallback } from 'react'
import { palettes, closestColor } from '@/lib/palettes'

interface ImageImportProps {
  onClose: () => void
  onApply: (grid: (string | null)[][]) => void
  paletteKey: string
}

export default function ImageImport({ onClose, onApply, paletteKey }: ImageImportProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [naturalWidth, setNaturalWidth] = useState(0)
  const [naturalHeight, setNaturalHeight] = useState(0)
  const [targetWidth, setTargetWidth] = useState(32)
  const [targetHeight, setTargetHeight] = useState(32)
  const [lockAspect, setLockAspect] = useState(true)
  const [colorLimit, setColorLimit] = useState<number>(0)
  const [previewGrid, setPreviewGrid] = useState<(string | null)[][] | null>(null)
  const [generating, setGenerating] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const aspectRatio = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 1

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setPreviewGrid(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setNaturalWidth(img.naturalWidth)
    setNaturalHeight(img.naturalHeight)
  }, [])

  const handleWidthChange = useCallback((w: number) => {
    setTargetWidth(w)
    if (lockAspect && aspectRatio) {
      setTargetHeight(Math.max(1, Math.round(w / aspectRatio)))
    }
  }, [lockAspect, aspectRatio])

  const handleHeightChange = useCallback((h: number) => {
    setTargetHeight(h)
    if (lockAspect && aspectRatio) {
      setTargetWidth(Math.max(1, Math.round(h * aspectRatio)))
    }
  }, [lockAspect, aspectRatio])

  const generate = useCallback(() => {
    if (!imageSrc) return
    setGenerating(true)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
      const pixels = imageData.data
      const palette = palettes[paletteKey]
      const grid: (string | null)[][] = []

      for (let y = 0; y < targetHeight; y++) {
        const row: (string | null)[] = []
        for (let x = 0; x < targetWidth; x++) {
          const i = (y * targetWidth + x) * 4
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const a = pixels[i + 3]
          if (a < 128) {
            row.push(null)
          } else {
            const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
            row.push(closestColor(hex, palette))
          }
        }
        grid.push(row)
      }

      if (colorLimit > 0) {
        const counts = new Map<string, number>()
        for (const row of grid) {
          for (const cell of row) {
            if (cell) counts.set(cell, (counts.get(cell) || 0) + 1)
          }
        }
        const topColors = new Set(
          [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, colorLimit)
            .map(([hex]) => hex)
        )
        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const cell = grid[y][x]
            if (cell && !topColors.has(cell)) {
              let best = ''
              let bestDist = Infinity
              const cr = parseInt(cell.slice(1, 3), 16)
              const cg = parseInt(cell.slice(3, 5), 16)
              const cb = parseInt(cell.slice(5, 7), 16)
              for (const tc of topColors) {
                const tr = parseInt(tc.slice(1, 3), 16)
                const tg = parseInt(tc.slice(3, 5), 16)
                const tb = parseInt(tc.slice(5, 7), 16)
                const d = (cr - tr) ** 2 + (cg - tg) ** 2 + (cb - tb) ** 2
                if (d < bestDist) { bestDist = d; best = tc }
              }
              grid[y][x] = best
            }
          }
        }
      }

      setPreviewGrid(grid)
      setGenerating(false)
    }
    img.src = imageSrc
  }, [imageSrc, targetWidth, targetHeight, colorLimit, paletteKey])

  const apply = useCallback(() => {
    if (previewGrid) {
      onApply(previewGrid)
      onClose()
    }
  }, [previewGrid, onApply, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">图片导入</h2>

        <div className="mb-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFile}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {imageSrc && (
          <>
            <div className="mb-4">
              <img
                src={imageSrc}
                alt="预览"
                onLoad={handleImageLoad}
                className="max-w-full max-h-48 object-contain border rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">宽度</label>
                <input
                  type="number"
                  min={1}
                  max={128}
                  value={targetWidth}
                  onChange={e => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">高度</label>
                <input
                  type="number"
                  min={1}
                  max={128}
                  value={targetHeight}
                  onChange={e => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="lockAspect"
                checked={lockAspect}
                onChange={e => setLockAspect(e.target.checked)}
              />
              <label htmlFor="lockAspect" className="text-sm text-gray-700">锁定比例</label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">颜色数量限制</label>
              <select
                value={colorLimit}
                onChange={e => setColorLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>不限制</option>
                <option value={8}>8 色</option>
                <option value={16}>16 色</option>
                <option value={24}>24 色</option>
                <option value={32}>32 色</option>
              </select>
            </div>

            <button
              onClick={generate}
              disabled={generating}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {generating ? '生成中...' : '生成'}
            </button>

            {previewGrid && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  预览 ({previewGrid[0].length} × {previewGrid.length})
                </h3>
                <div className="overflow-auto max-h-64 border rounded p-2">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${previewGrid[0].length}, minmax(8px, 1fr))`,
                      width: 'fit-content',
                      gap: 0,
                    }}
                  >
                    {previewGrid.map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`${y}-${x}`}
                          style={{
                            backgroundColor: cell || 'transparent',
                            aspectRatio: '1',
                            minWidth: 8,
                            border: cell ? '0.5px solid rgba(0,0,0,0.2)' : '0.5px solid rgba(0,0,0,0.05)',
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
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
                onClick={apply}
                disabled={!previewGrid}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                应用
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
