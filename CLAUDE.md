# Beads — 拼豆图纸设计工具

## 项目概览
Next.js + TypeScript 拼豆图纸设计工具。画布用 Konva.js。

## 目录结构
```
beads/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 根布局
│   │   ├── page.tsx          # 主页面（画布编辑器）
│   │   └── globals.css
│   ├── components/
│   │   ├── Canvas.tsx        # Konva 画布
│   │   ├── Toolbar.tsx       # 工具栏
│   │   ├── PalettePanel.tsx  # 色板面板
│   │   ├── ImageImport.tsx   # 图片导入对话框
│   │   └── ExportDialog.tsx  # 导出对话框
│   ├── hooks/
│   │   └── useCanvas.ts      # 画布状态管理
│   └── lib/
│       ├── types.ts          # 类型定义
│       ├── palettes.ts       # 色板数据 + 颜色映射
│       └── storage.ts        # localStorage 存储
```

## 关键约定
- 所有组件加 "use client"
- Tailwind CSS 布局
- Konva/React-Konva 画布
- 中文界面
- 默认画布 32x32
- 颜色用 hex string（如 "#ffd700"），空格用 null
