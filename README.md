# Local Vault — 端侧本地 AI 创作工作站

> **Local Vault** 是一个**完全运行于浏览器端**的一站式 AI 创作工具。基于 WebGPU 进行端侧推理，所有数据本地存储，零上传、全离线可用。支持文本创作、图像生成、代码辅助三大核心能力，无需后端服务器、无需 API 密钥。

[中文](#local-vault--端侧本地-ai-创作工作站) | [Features](#features) | [Quick Start](#quick-start) | [Browser Support](#browser-support)

---

## 功能特性

### 文本创作工坊
- 多轮对话与流式输出，支持实时中止
- 8K / 16K / 32K 上下文长度切换
- 内置创作模板（小红书笔记、产品文案、周报、邮件等）
- 长文档导入（TXT / MD / PDF / DOCX），支持摘要提取、大纲生成、翻译、改写
- 对话历史自动保存至 IndexedDB，刷新不丢失

### 图像生成工坊
- 文生图（Stable Diffusion XL Turbo / SDXL Base 1.0）
- 正负提示词、画面比例、采样步数、CFG 值、种子等全参数控制
- 本地画廊管理，支持元数据批量导出
- 图像生成历史持久化

### 代码辅助工作台
- 代码生成、代码分析、代码转换三种模式
- 支持 Python / JavaScript / TypeScript / Go / Rust 等 20+ 语言
- 内置轻量级语法高亮
- AI 结构化分析报告（代码质量、潜在问题、优化建议）

### 模型管理
- 内置 6 款模型（Qwen 7B / DeepSeek 蒸馏版 / Mistral 等）
- 自定义模型导入（GGUF / ONNX 格式，OPFS 存储）
- 模型自动下载（断点续传）与 VRAM 智能调度
- 设备切换（WebGPU / WebAssembly）

### 数据金库
- 存储大小实时统计（navigator.storage.estimate）
- 创作历史搜索与筛选（按标题、模型、类型）
- 多格式导出（Markdown / TXT / JSON）
- 完整备份导出/导入（含历史记录、设置、模型列表）

### 隐私安全
- **零数据上传**：所有推理在浏览器端本地完成
- **本地加密存储**：IndexedDB 数据可开启加密
- **网络审计面板**：实时监测出站请求，确保无外部数据泄露
- **应用密码锁**：支持设置启动密码
- **硬件探测**：WebGPU 适配器信息、VRAM 容量自动识别

### 其他
- 暗黑/明亮主题切换
- 中英文国际化（i18n）
- PWA 离线安装（支持 Service Worker 离线缓存）
- 响应式布局（桌面 + 移动端）
- 快捷键支持（Cmd/Ctrl+K 搜索、Esc 停止生成等）

---

## 快速开始

### 环境要求
- **Chrome 113+** / **Edge 113+** / **Firefox 128+**（需开启 WebGPU）
- **8GB+ 显存**（推荐 16GB+）或同等共享内存

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/CappuccinoRose/Local-Vault.git
cd Local-Vault

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署至任意静态托管（GitHub Pages、Vercel、Netlify、阿里云 OSS 等）。

---

## 项目结构

```
Local-Vault/
├── public/                    # 静态资源（PWA 图标、manifest）
├── src/
│   ├── components/            # UI 组件（侧边栏、顶栏、命令面板、模态框等）
│   ├── engine/                # AI 推理引擎（TextEngine / ImageEngine）
│   ├── lib/                   # 工具库与数据层
│   │   ├── db.js              # IndexedDB 持久化层（6 个对象存储）
│   │   ├── hardware.js        # 真实硬件探测（WebGPU + navigator APIs）
│   │   ├── store.jsx          # 全局状态管理（React Context）
│   │   ├── data.js            # 静态数据（模型列表、模板、种子数据）
│   │   ├── locales.js         # 中英文国际化（~150 个翻译键）
│   │   ├── fileParser.js      # 文件解析器（TXT / MD / PDF / DOCX）
│   │   └── backup.js          # 备份导出/导入/恢复
│   ├── pages/                 # 页面层（7 个路由页面）
│   ├── App.jsx                # 主布局（路由 + 侧边栏 + 顶栏）
│   ├── main.jsx               # 应用入口
│   └── index.css              # 全局样式 + 双主题变量
├── index.html
├── vite.config.js             # Vite 构建 + PWA 插件配置
├── tailwind.config.js         # Tailwind 设计系统（自定义色板、字体）
├── postcss.config.js
├── eslint.config.js
├── AGENTS.md                  # 前端开发规范（无障碍、性能、动画等）
├── CLAUDE.md                  # 项目技术栈与架构说明
└── 端侧本地AI创作工作站 产品需求说明书.docx
```

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | React 18.3 + React Router 6 |
| 构建 | Vite 5.4 + @vitejs/plugin-react |
| 样式 | Tailwind CSS 3.4 + PostCSS + 自定义 CSS 变量 |
| 动画 | Motion (Framer Motion v11) |
| 文本推理 | [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) 0.2.84（WebGPU/WebAssembly） |
| 图像推理 | [@huggingface/transformers](https://github.com/huggingface/transformers.js) 4.2.0（浏览器端扩散模型） |
| PWA | vite-plugin-pwa + Workbox |
| 数据持久化 | IndexedDB + OPFS（模型文件）+ localStorage（设置） |
| 硬件探测 | WebGPU API + `navigator.deviceMemory` + 启发式 VRAM 估算 |
| 代码质量 | ESLint 9 + React/Hooks/Refresh 插件 |

---

## 浏览器支持

| 浏览器 | 最低版本 | WebGPU |
|--------|---------|--------|
| Chrome | 113+ | 默认开启 |
| Edge | 113+ | 默认开启 |
| Firefox | 128+ | 需开启 `dom.webgpu.enabled` |
| Safari | 不支持 | — |

> **提示**：首次运行时，浏览器会下载 AI 模型（约 2-7GB，取决于模型大小），建议使用 Wi-Fi 连接。模型文件缓存在浏览器本地，后续无需重复下载。

---

## 隐私声明

Local Vault 遵循**数据主权优先**原则：

- 所有 AI 推理在您的设备本地完成，**不会将任何数据发送到外部服务器**
- 创作历史、对话记录、图像数据均存储在浏览器的 **IndexedDB** 中
- 支持开启**本地加密存储**，即使他人访问设备也无法读取数据
- 内置**网络审计面板**，实时展示所有出站请求，透明可控
- 支持**完整备份导出**，数据可随时本地迁移

---

## 提交历史

```
4ca4e27  init: 项目配置骨架
3067a75  feat: 核心数据层与工具库
fee7b71  feat: 全局状态管理（Context + Hooks）
446e1e1  feat: UI 组件系统
74e2ffb  feat: AI 推理引擎（文本 + 图像）
2eda43f  feat: 应用壳与页面层
112b6da  feat: 本地持久化层与硬件探测
8cc8e79  docs: 项目文档与规范
```

---

## 许可证

MIT License
