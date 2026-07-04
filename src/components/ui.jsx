import { Icon } from './icons.jsx'

export function Badge({ tone = 'ink', children, className = '' }) {
  const tones = {
    ink: 'border-ink-650 bg-ink-800/60 text-cream-200',
    brass: 'border-brass-500/30 bg-brass-400/10 text-brass-200',
    phosphor: 'border-phosphor-500/30 bg-phosphor-500/10 text-phosphor-300',
    rust: 'border-rust/30 bg-rust/10 text-rust',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function SectionLabel({ children, className = '' }) {
  return <div className={`label-mono mb-3 ${className}`}>{children}</div>
}

export function RingProgress({ value, size = 44, stroke = 4, tone = 'brass', label }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c
  const colors = {
    brass: '#e8b454',
    phosphor: '#7dd87d',
    rust: '#cf6a4f',
  }
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#2c2820" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors[tone]}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.2,0.7,0.2,1)' }}
        />
      </svg>
      <span className="absolute font-mono text-[10px] text-cream-100">{label ?? `${Math.round(value)}%`}</span>
    </div>
  )
}

export function StatTile({ icon, label, value, sub, tone = 'ink' }) {
  const accent = tone === 'brass' ? 'text-brass-300' : tone === 'phosphor' ? 'text-phosphor-300' : 'text-cream-100'
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <Icon name={icon} size={15} className="text-cream-500" />
      </div>
      <div className={`mt-2 font-display text-2xl tracking-tightest ${accent}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-cream-500">{sub}</div>}
    </div>
  )
}

export function EmptyState({ icon = 'sparkles', title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 text-brass-300">
        <Icon name={icon} size={22} />
      </div>
      <div className="font-serif text-lg text-cream-50">{title}</div>
      {desc && <div className="mt-1.5 max-w-sm text-sm text-cream-400">{desc}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Toggle({ checked, onChange, tone = 'brass' }) {
  const on = tone === 'brass' ? 'bg-brass-400' : 'bg-phosphor-500'
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full border transition-colors ${
        checked ? `${on} border-transparent` : 'border-ink-650 bg-ink-800'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink-950 shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-ink-700 bg-ink-900/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === o.value ? 'bg-ink-750 text-brass-200' : 'text-cream-400 hover:text-cream-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function PageShell({ title, kicker, actions, children }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          {kicker && <div className="label-mono mb-2 text-brass-300/80">{kicker}</div>}
          <h1 className="font-serif text-3xl tracking-tightest text-cream-50 sm:text-4xl">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
