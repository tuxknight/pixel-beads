export interface BeadColor {
  name: string
  hex: string
  /** 品牌颜色编号 */
  code: string
}

export interface Palette {
  name: string
  brand: 'perler' | 'artkal' | 'hama'
  colors: BeadColor[]
}

export interface Design {
  id: string
  name: string
  grid: (string | null)[][]  // hex color or null (empty)
  width: number
  height: number
  palette: string  // palette key
  createdAt: number
  updatedAt: number
}

export type ExportFormat = 'pdf' | 'png' | 'color-list'

export interface CanvasTool {
  type: 'draw' | 'erase' | 'fill' | 'eyedropper'
}
