import { useApp } from '../lib/store.jsx'
import { Icon } from './icons.jsx'

// The signature element: a live "vault" status proving zero outbound data.
export function PrivacyShield({ compact = false }) {
  const { outboundCount } = useApp()

  return (
    <div className="relative flex items-center gap-2.5 rounded-xl border border-phosphor-500/25 bg-phosphor-500/[0.06] px-3 py-1.5">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute inline-flex h-5 w-5 rounded-full bg-phosphor-500/30 motion-safe:animate-pulseRing" />
        <Icon name="vault" size={15} className="relative text-phosphor-300" />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-phosphor-300">
          本地运行中
          <span className="text-phosphor-500/60">·</span>
          <span className="text-cream-200">数据零上传</span>
        </div>
        {!compact && (
          <div className="font-mono text-[9.5px] tracking-wide text-cream-500">
            出站请求 <span className="text-phosphor-300">{outboundCount}</span> · 全程离线可用
          </div>
        )}
      </div>
    </div>
  )
}

// Hardware / VRAM readout — instrument-panel feel.
export function MachineStatus() {
  const { hardware, activeModel, vramUsed, vramTotal, device } = useApp()
  const pct = Math.min(100, Math.round((vramUsed / vramTotal) * 100))

  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850/70 px-3 py-1.5">
      <Icon name={device === 'webgpu' ? 'gpu' : 'cpu'} size={15} className="text-brass-300" />
      <div className="leading-tight">
        <div className="flex items-center gap-2 text-[11px] text-cream-100">
          <span className="font-medium">{activeModel?.name ?? '未加载模型'}</span>
        </div>
        <div className="font-mono text-[9.5px] text-cream-500">
          {device === 'webgpu' ? 'WebGPU' : 'CPU'} · VRAM {pct}% · {hardware.gpu.replace('NVIDIA GeForce ', '')}
        </div>
      </div>
      <div className="ml-1 h-7 w-px bg-ink-700" />
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${pct > 90 ? 'bg-rust' : pct > 70 ? 'bg-brass-400' : 'bg-phosphor-500'} motion-safe:animate-pulse`} />
      </div>
    </div>
  )
}
