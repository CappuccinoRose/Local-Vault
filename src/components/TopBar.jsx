import { Icon } from './icons.jsx'
import { PrivacyShield, MachineStatus } from './PrivacyShield.jsx'
import { useApp } from '../lib/store.jsx'

export function TopBar({ onMenu }) {
  const { t } = useApp()
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-800 bg-ink-900/70 px-4 backdrop-blur-md sm:px-6">
      <button onClick={onMenu} className="btn-ghost -ml-2 p-2 lg:hidden">
        <Icon name="more" size={18} />
      </button>

      {/* search trigger — opens command palette via ⌘K */}
      <div className="hidden flex-1 items-center sm:flex">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('opensearch'))}
          className="group relative w-full max-w-sm cursor-text"
        >
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream-500">
            <Icon name="search" size={15} />
          </span>
          <span className="field flex h-9 items-center pl-9 pr-16 text-sm text-cream-400 text-left group-hover:text-cream-200 transition-colors">
            {t('topbar.search')}
          </span>
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-ink-700 bg-ink-850 px-1.5 py-0.5 font-mono text-[10px] text-cream-500">⌘K</kbd>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <MachineStatus />
        <PrivacyShield />
        <button className="btn-ghost hidden h-9 w-9 p-0 sm:inline-flex">
          <Icon name="sparkles" size={17} />
        </button>
      </div>
    </header>
  )
}
