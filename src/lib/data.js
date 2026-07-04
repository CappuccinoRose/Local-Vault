// Mock data for the Local Vault AI workshop.
// All values are illustrative; no real inference happens.

// NOTE: Hardware detection is now handled by src/lib/hardware.js
// This is kept as a synchronous fallback for initial render before async detection completes.
export const HARDWARE_FALLBACK = {
  gpu: '检测中…',
  vramTotal: 4096,
  vramRecommended: 4096,
  ram: 16,
  cpu: '检测中…',
  webgpu: false,
  adapter: '检测中…',
  computeTier: 'minimum',
}

export const MARKET_MODELS = [
  {
    id: 'qwen2.5-7b-instruct-q4',
    name: 'Qwen2.5-7B Instruct',
    category: 'text',
    params: '7B',
    quant: 'Q4_K_M',
    size: 4.4, // GB
    vram: 5800,
    ctx: 32768,
    speed: 42,
    scenes: ['对话', '写作', '摘要', '翻译'],
    desc: '通用中文对话与写作主力模型，平衡质量与速度。',
    badge: '推荐',
  },
  {
    id: 'qwen2.5-14b-instruct-q4',
    name: 'Qwen2.5-14B Instruct',
    category: 'text',
    params: '14B',
    quant: 'Q4_K_M',
    size: 8.6,
    vram: 9200,
    ctx: 32768,
    speed: 26,
    scenes: ['长文', '推理', '复杂写作'],
    desc: '更高推理质量的进阶模型，适合长文档与复杂任务。',
    badge: '进阶',
  },
  {
    id: 'phi-3.5-mini-q4',
    name: 'Phi-3.5 Mini',
    category: 'text',
    params: '3.8B',
    quant: 'Q4_K_M',
    size: 2.3,
    vram: 3100,
    ctx: 16384,
    speed: 68,
    scenes: ['轻量', '低配', '快速'],
    desc: '轻量级模型，集成显卡与 8G 内存亦可流畅运行。',
    badge: '轻量',
  },
  {
    id: 'deepseek-coder-7b-q4',
    name: 'DeepSeek-Coder-7B',
    category: 'code',
    params: '7B',
    quant: 'Q4_K_M',
    size: 4.2,
    vram: 5400,
    ctx: 16384,
    speed: 38,
    scenes: ['代码生成', '补全', '调试'],
    desc: '专注代码生成与补全，支持主流编程语言。',
    badge: '推荐',
  },
  {
    id: 'stable-diffusion-xl-turbo',
    name: 'SDXL Turbo',
    category: 'image',
    params: '3.5B',
    quant: 'FP16',
    size: 6.9,
    vram: 6400,
    ctx: 0,
    speed: 0,
    scenes: ['文生图', '图生图', '1-4步'],
    desc: '少步数极速出图，适合实时交互式文生图。',
    badge: '推荐',
  },
  {
    id: 'sdxl-base-1.0',
    name: 'SDXL Base 1.0',
    category: 'image',
    params: '3.5B',
    quant: 'FP16',
    size: 6.9,
    vram: 7600,
    ctx: 0,
    speed: 0,
    scenes: ['高质量', '局部重绘', '扩图'],
    desc: '高质量出图基础模型，配合后期工具使用。',
    badge: '高质量',
  },
]

export const LOCAL_MODELS = [
  {
    id: 'qwen2.5-7b-instruct-q4',
    status: 'loaded',
    isDefault: true,
    version: 'v2.5.1',
    addedAt: '2026-06-18',
  },
  {
    id: 'deepseek-coder-7b-q4',
    status: 'ready',
    isDefault: false,
    version: 'v1.0.2',
    addedAt: '2026-06-20',
  },
]

export const TEMPLATES = [
  { id: 'gongwen', name: '公文撰写', icon: 'scroll', hint: '规范、严谨的机关公文格式', fields: ['文种', '主题', '要点'] },
  { id: 'marketing', name: '营销文案', icon: 'megaphone', hint: '高转化率的商品/活动文案', fields: ['产品', '卖点', '受众'] },
  { id: 'paper', name: '论文润色', icon: 'graduation', hint: '学术语言润色与逻辑梳理', fields: ['学科', '摘要', '要求'] },
  { id: 'email', name: '商务邮件', icon: 'mail', hint: '专业得体的邮件草稿', fields: ['收件对象', '目的', '语气'] },
  { id: 'plan', name: '策划方案', icon: 'clipboard', hint: '结构化的活动/项目策划', fields: ['项目', '预算', '周期'] },
  { id: 'summary', name: '长文摘要', icon: 'compress', hint: '提炼核心观点与大纲', fields: ['文档', '篇幅', '侧重点'] },
  { id: 'translate', name: '多语互译', icon: 'globe', hint: '保留语境的高质量翻译', fields: ['源语言', '目标语言', '文体'] },
  { id: 'social', name: '自媒体', icon: 'hash', hint: '适配平台的网感内容', fields: ['平台', '选题', '风格'] },
  { id: 'script', name: '视频脚本', icon: 'film', hint: '分镜与口播脚本', fields: ['主题', '时长', '节奏'] },
  { id: 'report', name: '工作汇报', icon: 'chart', hint: '周报/月报/述职', fields: ['周期', '成果', '计划'] },
]

export const CHAT_SEED = [
  {
    role: 'user',
    content: '帮我用三句话介绍这个本地 AI 工具的核心价值。',
    time: '09:42',
  },
  {
    role: 'assistant',
    content:
      '「金库」是一款完全运行于浏览器端的一站式 AI 创作工具，依托 WebGPU 端侧推理，所有计算与数据都在你的本地设备闭环完成。它实现数据零上传、零 API 调用成本，涉密与敏感场景可放心使用。一次下载模型后即可全场景离线可用，高频创作相比云端工具成本降低 90% 以上。',
    time: '09:42',
  },
]

export const IMAGE_HISTORY = [
  { id: 'img-01', prompt: '雾中静谧的中式庭院，青瓦白墙，水墨风格', seed: 8821, ratio: '1:1', step: 20, at: '今天 09:12' },
  { id: 'img-02', prompt: '赛博朋克街角便利店，霓虹反射湿地面', seed: 4417, ratio: '16:9', step: 28, at: '今天 08:55' },
  { id: 'img-03', prompt: '极简产品摄影，黄铜台灯，暖光，深色背景', seed: 1502, ratio: '1:1', step: 24, at: '昨天 22:31' },
  { id: 'img-04', prompt: '油画质感，海边悬崖灯塔，暴风雨', seed: 9930, ratio: '3:4', step: 30, at: '昨天 21:08' },
]

// Default seed history items for new installations
export const HISTORY_ITEMS = [
  { id: 'h1', type: 'chat', title: '产品核心价值三句话介绍', model: 'Qwen2.5-7B', at: '今天 09:42', pinned: true },
  { id: 'h2', type: 'chat', title: '季度营销方案润色与改写', model: 'Qwen2.5-7B', at: '今天 08:30' },
  { id: 'h3', type: 'image', title: '雾中中式庭院（4 张）', model: 'SDXL Turbo', at: '今天 09:12', pinned: true },
  { id: 'h4', type: 'code', title: 'React useDebounce hook 实现', model: 'DeepSeek-Coder', at: '昨天 23:11' },
  { id: 'h5', type: 'doc', title: '《产品需求文档》摘要与大纲', model: 'Qwen2.5-7B', at: '昨天 20:45' },
  { id: 'h6', type: 'chat', title: '邮件：合作意向回复草稿', model: 'Qwen2.5-7B', at: '昨天 16:20' },
  { id: 'h7', type: 'image', title: '黄铜台灯产品摄影', model: 'SDXL Base', at: '昨天 22:31' },
  { id: 'h8', type: 'code', title: 'Python 数据清洗脚本重构建议', model: 'DeepSeek-Coder', at: '06-28' },
]

export const NETWORK_AUDIT = [
  { time: '09:42:11', host: '—', method: '—', status: 'blocked', note: '无出站请求' },
  { time: '09:41:03', host: 'localhost', method: 'GET', status: 'ok', note: '模型权重加载（OPFS 本地）' },
  { time: '09:40:55', host: 'localhost', method: 'GET', status: 'ok', note: '首屏资源缓存命中' },
]

export const WORKSPACES = [
  { id: 'ws-personal', name: '个人空间', glyph: '私', color: 'brass' },
  { id: 'ws-work', name: '工作空间', glyph: '工', color: 'phosphor' },
  { id: 'ws-project', name: '项目·北辰', glyph: '北', color: 'rust' },
]

export const STREAM_DEMO =
  '本地推理已就绪。这条回复由你设备上的 Qwen2.5-7B 模型逐字生成，全程没有一字离开你的机器——没有云端、没有 API、没有数据上传。\n\n你可以随时打断生成、编辑任意一条消息、导出为 Markdown 或 PDF。需要我演示长文档摘要或代码生成吗？'

export function fmtSize(gb) {
  return `${gb.toFixed(1)} GB`
}
export function fmtVram(mb) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`
}
