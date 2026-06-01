# Beads MVP — Implementation Tasks for Claude Code

You are implementing a fuse beads (拼豆) pattern designer in Next.js + react-konva.
Project is at /home/pi/hermes-workspace/beads/.

## Project Setup (already done)
- tsconfig.json, next.config.js, tailwind.config.js, postcss.config.js  ✅
- package.json with dependencies (next, react, konva, react-konva, tailwindcss) ✅
- src/lib/types.ts ✅ (BeadColor, Palette, Design, CanvasTool types)
- src/lib/palettes.ts ✅ (Perler 60 colors, Artkal 30, Hama 28, closestColor function)
- src/lib/storage.ts ✅ (saveDesign, listDesigns, getDesign, deleteDesign, generateId)
- src/app/globals.css ✅

## Tasks — Do ALL of these

### Task 1: src/app/layout.tsx
Basic HTML layout with metadata. Title: "Beads - 拼豆图纸设计"

### Task 2: src/components/Canvas.tsx
React component wrapping react-konva Stage.

Props/State:
- grid: (string | null)[][] — 2D array of colors or null (empty)
- selectedColor: string (current paint color)
- tool: 'draw' | 'erase' | 'fill' | 'eyedropper'
- onCellClick(x, y): void
- cellSize: number (default 20px)
- gridWidth, gridHeight: number

Features:
- Stage fills available space (responsive)
- Mouse wheel zooms (scale)
- Drag to pan (when not drawing)
- Grid lines shown as thin gray lines
- Each cell is a Konva Rect with proper color
- Empty cells show white/light gray background

### Task 3: src/hooks/useCanvas.ts
State management hook for the canvas.

- grid state (2D array)
- selectedColor state
- current tool state
- undo/redo stack (bonus)
- fill tool: flood fill algorithm (BFS)
- eyedropper: pick color from grid[x][y]
- draw: set grid[x][y] = selectedColor
- erase: set grid[x][y] = null
- resizeGrid(w, h): resize preserving existing content

### Task 4: src/components/PalettePanel.tsx
Color palette selector.

- Three tabs: "Perler Beads" / "Artkal" / "Hama"
- Shows colors as circular swatches (20px circles)
- Scrolling container for many colors
- Click to select, show selection state
- Recently used colors section at top (stored in localStorage)

### Task 5: src/components/Toolbar.tsx
Tool selection bar (vertical or horizontal).

- Draw tool (pencil icon)
- Erase tool (eraser icon)
- Fill tool (bucket icon)
- Eyedropper tool (eyedropper icon)
- Clear all button
- Undo/Redo buttons (bonus)

### Task 6: src/components/ImageImport.tsx
Dialog for importing an image and converting to bead pattern.

- File upload button (accept: image/*)
- Preview of uploaded image
- Target width/height inputs (default proportional)
- Color limit slider (max colors in result)
- "Generate" button → runs imageToBeads algorithm
- Preview result on canvas
- "Apply" button to commit to main canvas

Algorithm:
1. Draw image to hidden canvas at target resolution
2. Get pixel data (ImageData)
3. For each pixel, find closest color in current palette
4. Return grid of hex colors

### Task 7: src/components/ExportDialog.tsx
Export dialog for saving the pattern.

- "Export as PNG" button
  - Renders grid with color swatches + color codes
  - Uses html2canvas or offscreen canvas
- "Export Color List" button
  - Shows table: color swatch | color name | color code | count
- "Copy to clipboard" for color list text

### Task 8: src/app/page.tsx
Main page assembling everything together.

Layout:
- Top bar: app name "Beads", palette brand selector, save/export buttons
- Left panel: Toolbar
- Center: Canvas (fills remaining space)
- Bottom left: PalettePanel
- Bottom right / floating: status bar (grid size, total beads count)

State flow:
- useCanvas hook provides canvas state
- ImageImport opens as modal
- ExportDialog opens as modal
- Save to localStorage on changes (debounced)

### Important Notes
- ALL components are "use client" (they use browser APIs)
- Use Tailwind for layout/styling
- react-konva for canvas rendering
- Canvas must be responsive (use ResizeObserver)
- Konva Stage container needs explicit width/height
- The palette tabs use Chinese names: "Perler Beads", "Artkal", "Hama"
- Default grid: 32x32
- Handle window resize gracefully
