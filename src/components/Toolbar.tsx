'use client'

import { CanvasTool } from '@/lib/types'

interface ToolbarProps {
  tool: CanvasTool
  onToolChange: (t: CanvasTool['type']) => void
  onClear: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

const tools: { type: CanvasTool['type']; label: string; emoji: string }[] = [
  { type: 'draw', label: '画笔', emoji: '✏️' },
  { type: 'erase', label: '橡皮', emoji: '🧹' },
  { type: 'fill', label: '填充', emoji: '🪣' },
  { type: 'eyedropper', label: '取色', emoji: '💉' },
]

export default function Toolbar({
  tool,
  onToolChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg" style={{ backgroundColor: '#2d2d2d' }}>
      {tools.map((t) => (
        <button
          key={t.type}
          title={t.label}
          onClick={() => onToolChange(t.type)}
          className={`
            w-10 h-10 rounded flex items-center justify-center text-lg transition-colors
            ${tool.type === t.type ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}
          `}
        >
          {t.emoji}
        </button>
      ))}

      <div className="w-8 h-px bg-gray-600 my-1" />

      <button
        title="撤销"
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          w-10 h-10 rounded flex items-center justify-center text-sm font-bold transition-colors
          ${canUndo ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}
        `}
      >
        ↩
      </button>

      <button
        title="重做"
        onClick={onRedo}
        disabled={!canRedo}
        className={`
          w-10 h-10 rounded flex items-center justify-center text-sm font-bold transition-colors
          ${canRedo ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}
        `}
      >
        ↪
      </button>

      <div className="w-8 h-px bg-gray-600 my-1" />

      <button
        title="清空画布"
        onClick={onClear}
        className="w-10 h-10 rounded flex items-center justify-center text-sm font-bold text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
      >
        🗑
      </button>
    </div>
  )
}
