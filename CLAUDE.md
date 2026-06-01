# Beads - 拼豆图纸设计工具

## 项目状态
Next.js 16 + react-konva 项目。基础框架已就绪（types/palettes/storage/layout/toolbar/palette），但 Canvas 组件点击无效，标题和部分 UI 是英文。

## 要修复的问题
1. **Canvas 画布不能点击绘画** — 鼠标点击/拖拽无反应
2. **标题 "Beads" 改为 "拼豆图纸"**
3. **所有 UI 文字用中文**（品牌名 Perler/Artkal/Hama 保留英文）
4. **移动端支持 touch 事件**

## 技术约束
- ALL 组件加 `'use client'`
- Tailwind CSS + react-konva
- 中文界面
- 默认画布 32x32
- 颜色用 hex string，空格用 null
- 静态导出 (`output: 'export'`)
- basePath: '/pixel-beads'

## 相关文件
- `src/components/Canvas.tsx` — 画布组件（核心 bug 在这里）
- `src/hooks/useCanvas.ts` — 画布状态管理
- `src/app/page.tsx` — 主页面
- `src/components/Toolbar.tsx` — 工具栏
- `src/components/PalettePanel.tsx` — 色板

## git
SSH deploy key at /tmp/beads_deploy.
GIT_SSH_COMMAND="ssh -i /tmp/beads_deploy -o StrictHostKeyChecking=no"
