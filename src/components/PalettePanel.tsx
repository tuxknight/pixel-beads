'use client'

import { palettes } from '@/lib/palettes'

interface PalettePanelProps {
  paletteKey: 'perler' | 'artkal' | 'hama'
  selectedColor: string | null
  recentColors: string[]
  onPaletteChange: (key: 'perler' | 'artkal' | 'hama') => void
  onColorSelect: (color: string) => void
}

const tabDefs: { key: 'perler' | 'artkal' | 'hama'; label: string }[] = [
  { key: 'perler', label: 'Perler Beads' },
  { key: 'artkal', label: 'Artkal' },
  { key: 'hama', label: 'Hama' },
]

export default function PalettePanel({
  paletteKey,
  selectedColor,
  recentColors,
  onPaletteChange,
  onColorSelect,
}: PalettePanelProps) {
  const palette = palettes[paletteKey]

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#2d2d2d' }}>
      <div className="flex border-b border-gray-600">
        {tabDefs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onPaletteChange(tab.key)}
            className={`
              flex-1 px-3 py-2 text-sm transition-colors
              ${
                paletteKey === tab.key
                  ? 'text-white font-semibold border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {palette.colors.map((c) => {
            const isSelected = selectedColor === c.hex
            return (
              <button
                key={c.code}
                title={`${c.name} (${c.code})`}
                onClick={() => onColorSelect(c.hex)}
                className={`
                  w-7 h-7 rounded-full flex-shrink-0 transition-transform hover:scale-110
                  ${isSelected ? 'ring-2 ring-black ring-offset-1 ring-offset-white' : ''}
                `}
                style={{ backgroundColor: c.hex }}
              />
            )
          })}
        </div>
      </div>

      {recentColors.length > 0 && (
        <div className="px-2 pb-2">
          <span className="text-xs text-gray-500 mb-1 block">最近使用</span>
          <div className="flex gap-1">
            {recentColors.map((color) => (
              <button
                key={color}
                title={color}
                onClick={() => onColorSelect(color)}
                className="w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
