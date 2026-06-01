import { Design } from './types'

const STORAGE_KEY = 'beads-designs'

export function saveDesign(design: Design): void {
  const designs = listDesigns()
  const idx = designs.findIndex(d => d.id === design.id)
  if (idx >= 0) {
    designs[idx] = { ...design, updatedAt: Date.now() }
  } else {
    designs.push(design)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs))
}

export function listDesigns(): Design[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

export function getDesign(id: string): Design | null {
  return listDesigns().find(d => d.id === id) ?? null
}

export function deleteDesign(id: string): void {
  const designs = listDesigns().filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
