import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Icon } from '../components/icons.jsx'
import { Badge, RingProgress, SectionLabel, StatTile } from '../components/ui.jsx'
import { PrivacyShield } from '../components/PrivacyShield.jsx'
import { useApp } from '../lib/store.jsx'
import { HISTORY_ITEMS, fmtVram } from '../lib/data.js'

const QUICK = [
  { to: '/text', icon: 'quill', title: '文本创作', desc: '多轮对话 · 写作模板 · 长文档', tone: 'brass' },
  { to: '/image', icon: 'image', title: '图像工坊', desc: '文生图 · 局部重绘 · 后期', tone: 'brass' },
  { to: '/code', icon: 'code', title: '代码辅助', desc: '生成 · 补全 · 分析优化', tone: 'brass' },
  { to: '/models', icon: 'cube', title: '模型管理', desc: '市场 · 调度 · 自定义导入', tone: 'ink' },
]

const METRICS = [
  { label: '推理速度', value: '42', unit: 'tok/s', icon: 'bolt', note: '7B · Q4 量化' },
  { label: '首次加载', value: '8.4', unit: 's', icon: 'download', note: '冷启动至首 token' },
  { label: '峰值内存', value: '6.1', unit: 'GB', icon: 'cpu', note: '运行 7B 模型' },
  { label: '出站请求', value: '0', unit: '次', icon: 'wifiOff', note: '本次会话累计', phosphor: true },
]

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const ITEM = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] } },
}

export default function Dashboard() {
  const { hardware, activeModel, vramUsed, vramTotal, device } = useApp()
  const vramPct = Math.round((vramUsed / vramTotal) * 100)
  const ramPct = 38

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      {/* hero */}
      <motion.section
        variants={STAGGER}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-3xl border border-ink-700/80 bg-gradient-to-br from-ink-850/90 via-ink-900 to-ink-950 p-7 sm:p-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brass-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-[0.5] [background-size:38px_38px]" />
        <div className="relative">
          <motion.div variants={ITEM} className="flex flex-wrap items-center gap-3">
            <Badge tone="phosphor">
              <span className="h-1.5 w-1.5 rounded-full bg-phosphor-400 motion-safe:animate-pulse" /> 端侧就绪
            </Badge>
            <Badge tone="brass">WebGPU 1.0</Badge>
            <Badge>2026 主流硬件适配</Badge>
          </motion.div>

          <motion.h1 variants={ITEM} className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-[1.12] tracking-tightest text-cream-50 sm:text-6xl">
            你的创作，
            <span className="shimmer-text">不出本地</span>
            一步。
          </motion.h1>

          <motion.p variants={ITEM} className="mt-5 max-w-2xl text-[15px] leading-relaxed text-cream-400">
            完全运行于浏览器端的一站式 AI 创作工具。WebGPU 端侧推理，数据零上传、零 API 成本、全场景离线可用。
            覆盖文本、图像、代码三大核心场景。
          </motion.p>

          <motion.div variants={ITEM} className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/text" className="btn-solid">
              <Icon name="quill" size={16} /> 开始创作
            </Link>
            <Link to="/models" className="btn-outline">
              <Icon name="cube" size={16} /> 配置模型
            </Link>
            <PrivacyShield />
          </motion.div>
        </div>
      </motion.section>

      {/* metrics */}
      <motion.section
        variants={STAGGER}
        initial="hidden"
        animate="show"
        className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {METRICS.map((m) => (
          <motion.div variants={ITEM} key={m.label}>
            <StatTile
              icon={m.icon}
              label={m.label}
              value={
                <span>
                  {m.value}
                  <span className="ml-1 font-mono text-sm text-cream-500">{m.unit}</span>
                </span>
              }
              sub={m.note}
              tone={m.phosphor ? 'phosphor' : 'brass'}
            />
          </motion.div>
        ))}
      </motion.section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* machine profile */}
        <motion.section
          variants={ITEM}
          initial="hidden"
          animate="show"
          className="panel-raised p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>设备画像 · 硬件探测</SectionLabel>
              <h2 className="font-serif text-xl text-cream-50">{hardware.gpu}</h2>
            </div>
            <Badge tone="phosphor">
              <Icon name="check" size={12} /> 适配推荐
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ResourceMeter label="显存占用" value={vramPct} sub={`${fmtVram(vramUsed)} / ${fmtVram(vramTotal)}`} tone={vramPct > 85 ? 'rust' : 'brass'} />
            <ResourceMeter label="内存占用" value={ramPct} sub={`${(hardware.ram * ramPct / 100).toFixed(1)} / ${hardware.ram} GB`} tone="phosphor" />
            <ResourceMeter label="推理设备" value={device === 'webgpu' ? 100 : 0} sub={device === 'webgpu' ? 'WebGPU 加速' : 'CPU 计算'} tone="brass" />
            <ResourceMeter label="活跃模型" value={vramPct ? 100 : 0} sub={activeModel?.name ?? '—'} tone="brass" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-700/60 pt-4 text-sm sm:grid-cols-4">
            <Spec k="处理器" v={hardware.cpu} />
            <Spec k="显存" v={fmtVram(hardware.vramTotal)} />
            <Spec k="内存" v={`${hardware.ram} GB`} />
            <Spec k="适配层" v={hardware.adapter} />
          </div>
        </motion.section>

        {/* active model */}
        <motion.section variants={ITEM} initial="hidden" animate="show" className="panel-raised flex flex-col p-6">
          <SectionLabel>当前推理模型</SectionLabel>
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-brass-500/40 bg-brass-400/10">
              <Icon name="cube" size={26} className="text-brass-300" />
            </div>
            <div>
              <div className="font-serif text-lg text-cream-50">{activeModel?.name}</div>
              <div className="mt-0.5 font-mono text-[11px] text-cream-500">{activeModel?.params} · {activeModel?.quant}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeModel?.scenes.slice(0, 3).map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2.5 text-sm">
            <Row k="上下文长度" v={`${(activeModel?.ctx / 1024).toFixed(0)}K`} />
            <Row k="推理速度" v={`${activeModel?.speed} tok/s`} />
            <Row k="文件大小" v={`${activeModel?.size} GB`} />
          </div>
          <Link to="/models" className="btn-outline mt-5 w-full">
            切换 / 管理模型 <Icon name="chevronR" size={15} />
          </Link>
        </motion.section>
      </div>

      {/* quick actions */}
      <section className="mt-6">
        <SectionLabel>快捷入口</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((q, i) => (
            <motion.div
              key={q.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.45 }}
            >
              <Link
                to={q.to}
                className="group relative block h-full overflow-hidden rounded-2xl border border-ink-700/80 bg-ink-850/60 p-5 transition-all hover:border-brass-500/40 hover:bg-ink-800/60"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brass-400/0 blur-2xl transition-all group-hover:bg-brass-400/10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-700 bg-ink-900 text-brass-300 transition-colors group-hover:border-brass-500/40">
                    <Icon name={q.icon} size={20} />
                  </div>
                  <Icon name="chevronR" size={16} className="text-cream-600 transition-all group-hover:translate-x-0.5 group-hover:text-brass-300" />
                </div>
                <div className="relative mt-4 font-serif text-lg text-cream-50">{q.title}</div>
                <div className="relative mt-0.5 text-[13px] text-cream-400">{q.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* recent */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel className="mb-0">最近创作</SectionLabel>
          <Link to="/data" className="flex items-center gap-1 text-xs text-cream-400 hover:text-brass-300">
            全部历史 <Icon name="chevronR" size={13} />
          </Link>
        </div>
        <div className="panel divide-y divide-ink-700/60">
          {HISTORY_ITEMS.slice(0, 5).map((h) => (
            <div key={h.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-cream-400">
                <Icon name={typeIcon(h.type)} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm text-cream-100">{h.title}</span>
                  {h.pinned && <Icon name="pin" size={12} className="shrink-0 text-brass-300" />}
                </div>
                <div className="font-mono text-[10.5px] text-cream-500">{h.model} · {h.at}</div>
              </div>
              <span className="hidden text-xs text-cream-500 sm:block">{typeLabel(h.type)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function typeIcon(t) {
  return { chat: 'quill', image: 'image', code: 'code', doc: 'doc' }[t] ?? 'file'
}
function typeLabel(t) {
  return { chat: '对话', image: '图像', code: '代码', doc: '文档' }[t] ?? '文件'
}

function ResourceMeter({ label, value, sub, tone }) {
  return (
    <div className="rounded-xl border border-ink-700/60 bg-ink-900/50 p-3.5">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <RingProgress value={value} size={36} stroke={3} tone={tone} />
      </div>
      <div className="mt-2 text-[11px] text-cream-400">{sub}</div>
    </div>
  )
}

function Spec({ k, v }) {
  return (
    <div>
      <div className="label-mono">{k}</div>
      <div className="mt-0.5 text-sm text-cream-100">{v}</div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-700/40 pb-2 last:border-0 last:pb-0">
      <span className="text-cream-400">{k}</span>
      <span className="font-mono text-[12px] text-cream-100">{v}</span>
    </div>
  )
}
