import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { Icon } from './icons.jsx'
import { useApp } from '../lib/store.jsx'
import { WORKSPACES } from '../lib/data.js'

const MODULE_HINTS = ['P0', 'P0', 'P0', 'P1', 'P1', 'P0', 'P0']

export function Sidebar({ onNavigate }) {
  const { workspace, setWorkspace, installed, installPrompt, triggerInstall, t } = useApp()

  const NAV = [
    { to: '/', label: t('nav.dashboard'), icon: 'home', end: true },
    { to: '/models', label: t('nav.models'), icon: 'cube' },
    { to: '/text', label: t('nav.text'), icon: 'quill' },
    { to: '/image', label: t('nav.image'), icon: 'image' },
    { to: '/code', label: t('nav.code'), icon: 'code' },
    { to: '/data', label: t('nav.data'), icon: 'harddrive' },
    { to: '/settings', label: t('nav.settings'), icon: 'sliders' },
  ]

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-ink-800 bg-ink-900/80">
      {/* brand */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brass-500/40 bg-gradient-to-br from-brass-400/20 to-transparent shadow-glow">
          <Icon name="vault" size={22} className="text-brass-300" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-phosphor-400 motion-safe:animate-pulse" />
        </div>
        <div className="leading-tight">
          <div className="font-serif text-[17px] font-bold tracking-tightest text-cream-50">{t('brand.name')}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cream-500">{t('brand.tagline')}</div>
        </div>
      </div>

      {/* workspace switcher */}
      <div className="px-3">
        <div className="label-mono px-2">{t('sidebar.workspace')}</div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {WORKSPACES.map((w) => {
            const active = w.id === workspace
            const tone =
              w.color === 'brass' ? 'text-brass-300 border-brass-500/40 bg-brass-400/10'
              : w.color === 'phosphor' ? 'text-phosphor-300 border-phosphor-500/40 bg-phosphor-500/10'
              : 'text-rust border-rust/40 bg-rust/10'
            return (
              <button
                key={w.id}
                onClick={() => setWorkspace(w.id)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-all ${
                  active ? tone : 'border-ink-700 bg-ink-850/50 text-cream-400 hover:border-ink-650'
                }`}
              >
                <span className="font-serif text-base leading-none">{w.glyph}</span>
                <span className="text-[10px] leading-none">{w.name.slice(0, 2)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* nav */}
      <nav className="mt-5 flex-1 space-y-0.5 px-3">
        <div className="label-mono px-2">{t('sidebar.modules')}</div>
        {NAV.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `nav-item group ${isActive ? 'nav-item-active' : ''}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-rail"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brass-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon name={item.icon} size={17} className={isActive ? 'text-brass-300' : 'text-cream-500 group-hover:text-cream-200'} />
                <span className="flex-1">{item.label}</span>
                <span className="font-mono text-[9px] text-cream-600">{MODULE_HINTS[i]}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* footer status */}
      <div className="border-t border-ink-800 p-3">
        <div className="rounded-lg border border-ink-700/70 bg-ink-850/60 p-3">
          <div className="flex items-center justify-between">
            <span className="label-mono">{t('sidebar.pwa.title')}</span>
            {installed ? (
              <span className="flex items-center gap-1 text-[10px] font-medium text-phosphor-300">
                <span className="h-1.5 w-1.5 rounded-full bg-phosphor-400 motion-safe:animate-pulse" /> {t('sidebar.pwa.installed')}
              </span>
            ) : installPrompt ? (
              <button onClick={triggerInstall} className="text-[10px] font-medium text-brass-300 hover:text-brass-200">
                {t('sidebar.pwa.install')}
              </button>
            ) : (
              <span className="text-[10px] text-cream-600">{t('sidebar.pwa.unsupported')}</span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-cream-500">
            {t('sidebar.pwa.desc')}
          </p>
        </div>
      </div>
    </aside>
  )
}
