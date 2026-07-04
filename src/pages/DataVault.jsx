import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Icon } from '../components/icons.jsx'
import { Badge, PageShell, SectionLabel, StatTile } from '../components/ui.jsx'
import { useApp } from '../lib/store.jsx'
import { exportBackup, importBackup, restoreFullBackup, restoreSettings } from '../lib/backup.js'
import { HISTORY_ITEMS } from '../lib/data.js'

const FILTERS = [
  { value: 'all', label: '全部', icon: 'layers' },
  { value: 'chat', label: '对话', icon: 'quill' },
  { value: 'image', label: '图像', icon: 'image' },
  { value: 'code', label: '代码', icon: 'code' },
  { value: 'doc', label: '文档', icon: 'doc' },
]

export default function DataVault() {
  const { workspace, theme, locale, device, vramCap, privacyLock, localModels, setLocalModels } = useApp()
  const importRef = useRef(null)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [items, setItems] = useState(HISTORY_ITEMS)
  const [restoreMsg, setRestoreMsg] = useState('')
  const [formatMsg, setFormatMsg] = useState('')
  const [storageSize, setStorageSize] = useState('计算中…')

  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        const bytes = est.usage ?? 0
        if (bytes > 0) {
          setStorageSize((bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB')
        } else {
          setStorageSize('0 GB')
        }
      }).catch(() => setStorageSize('不可用'))
    } else {
      setStorageSize('不可用')
    }
  }, [])

  const visible = items
    .filter((h) => filter === 'all' || h.type === filter)
    .filter((h) => h.title.includes(q) || (h.model && h.model.includes(q)))

  function togglePin(id) {
    setItems((arr) => arr.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h)))
  }
  function remove(id) {
    setItems((arr) => arr.filter((h) => h.id !== id))
  }

  function exportSingleRecord(h) {
    const blob = new Blob([JSON.stringify(h, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${h.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyTitle(h) {
    try {
      await navigator.clipboard.writeText(h.title)
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = h.title
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  function handleExport() {
    exportBackup({ workspace, theme, locale, device, vramCap, privacyLock, localModels })
  }

  function handleFormatExport(format) {
    if (format === 'PDF' || format === 'ZIP') {
      setFormatMsg(`${format} 格式导出功能开发中…`)
      setTimeout(() => setFormatMsg(''), 3000)
      return
    }
    const lines = visible.map((h) => {
      if (format === 'Markdown') {
        return `## ${h.title}\n- **模型**: ${h.model || '未知'}\n- **类型**: ${typeLabel(h.type)}\n- **时间**: ${h.at || ''}\n${h.content ? h.content + '\n' : ''}`
      }
      // TXT
      return `[${typeLabel(h.type)}] ${h.title} | ${h.model || '未知'} | ${h.at || ''}${h.content ? '\n' + h.content : ''}`
    })
    const ext = format === 'Markdown' ? '.md' : '.txt'
    const mime = format === 'Markdown' ? 'text/markdown' : 'text/plain'
    const header = format === 'Markdown' ? `# 数据金库导出\n> 导出时间: ${new Date().toLocaleString('zh-CN')}\n> 记录数: ${visible.length}\n\n---\n\n` : `数据金库导出 | ${new Date().toLocaleString('zh-CN')} | 记录数: ${visible.length}\n${'='.repeat(50)}\n\n`
    const blob = new Blob([header + lines.join('\n\n')], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vault-export-${Date.now()}${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setFormatMsg(`已导出 ${visible.length} 条记录为 ${format} 格式`)
    setTimeout(() => setFormatMsg(''), 3000)
  }

  async function handleImport(e) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const json = await importBackup(f)
      await restoreFullBackup(json)
      setRestoreMsg(`已恢复备份 · ${json.workspace || '全部工作空间'}`)
    } catch (err) {
      setRestoreMsg(`恢复失败：${err.message}`)
    }
    e.target.value = ''
    setTimeout(() => setRestoreMsg(''), 5000)
  }

  const stats = {
    total: items.length,
    pinned: items.filter((h) => h.pinned).length,
    size: storageSize,
  }

  return (
    <PageShell
      kicker="P0 · 本地数据"
      title="数据金库"
      actions={
        <>
          <button onClick={() => importRef.current?.click()} className="btn-outline"><Icon name="upload" size={15} /> 导入备份</button>
          <button onClick={handleExport} className="btn-solid"><Icon name="download" size={15} /> 导出全部</button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </>
      }
    >
      {/* storage stats */}
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon="harddrive" label="本地存储" value={stats.size} sub="IndexedDB + OPFS" tone="brass" />
        <StatTile icon="layers" label="记录总数" value={stats.total} sub="当前工作空间" />
        <StatTile icon="pin" label="置顶" value={stats.pinned} sub="快速访问" />
        <StatTile icon="database" label="工作空间" value="3" sub="数据完全隔离" tone="phosphor" />
      </section>

      {/* backup card */}
      <section className="panel-raised mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brass-500/30 bg-brass-400/10 text-brass-300">
              <Icon name="database" size={20} />
            </div>
            <div>
              <div className="font-serif text-base text-cream-50">备份与恢复</div>
              <div className="text-xs text-cream-500">导出为单备份文件，跨设备迁移无需云端</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-850/50 px-3 py-1.5 text-xs text-cream-400">
              <Icon name="file" size={13} /> 含历史记录 <Badge tone="phosphor">包含</Badge>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-850/50 px-3 py-1.5 text-xs text-cream-400">
              <Icon name="sliders" size={13} /> 含配置 <Badge tone="phosphor">包含</Badge>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-850/50 px-3 py-1.5 text-xs text-cream-400">
              <Icon name="layers" size={13} /> 含自定义模板 <Badge tone="phosphor">包含</Badge>
            </span>
          </div>
        </div>
        <div className="border-t border-ink-700/60 bg-ink-900/40 px-5 py-3">
          <div className="flex items-center gap-2 text-[11px] text-cream-500">
            <Icon name="shieldLock" size={12} className="text-phosphor-400" />
            备份文件可选本地存储加密；当前工作空间：<span className="text-brass-200">{workspace === 'ws-personal' ? '个人空间' : workspace === 'ws-work' ? '工作空间' : '项目·北辰'}</span>
          </div>
        </div>
      </section>

      {restoreMsg && (
        <div className="mb-4 rounded-xl border border-phosphor-500/30 bg-phosphor-500/10 px-4 py-3 text-sm text-phosphor-300">
          {restoreMsg}
        </div>
      )}
      {formatMsg && (
        <div className="mb-4 rounded-xl border border-brass-500/30 bg-brass-500/10 px-4 py-3 text-sm text-brass-300">
          {formatMsg}
        </div>
      )}

      {/* history */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionLabel className="mb-0">创作历史</SectionLabel>
          <label className="relative">
            <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索关键词…"
              className="field h-9 w-56 pl-9 text-sm"
            />
          </label>
        </div>

        {/* filter tabs */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.value ? 'border-brass-500/40 bg-brass-400/10 text-brass-200' : 'border-ink-700 bg-ink-850/50 text-cream-400 hover:text-cream-100'
              }`}
            >
              <Icon name={f.icon} size={13} /> {f.label}
            </button>
          ))}
        </div>

        {/* list */}
        <div className="panel divide-y divide-ink-700/60">
          {visible.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-cream-500">无匹配记录</div>
          )}
          {visible.map((h, i) => (
            <motion.div
              key={h.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group flex items-center gap-4 px-4 py-3"
            >
              <button
                onClick={() => togglePin(h.id)}
                className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${h.pinned ? 'text-brass-300' : 'text-cream-700 hover:text-cream-400'}`}
              >
                <Icon name="pin" size={14} />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-cream-400">
                <Icon name={typeIcon(h.type)} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-cream-100">{h.title}</div>
                <div className="font-mono text-[10.5px] text-cream-500">{h.model} · {h.at}</div>
              </div>
              <Badge>{typeLabel(h.type)}</Badge>
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => exportSingleRecord(h)} className="btn-ghost p-1.5"><Icon name="export" size={14} /></button>
                <button onClick={() => copyTitle(h)} className="btn-ghost p-1.5"><Icon name="copy" size={14} /></button>
                <button onClick={() => remove(h.id)} className="btn-ghost p-1.5 text-rust hover:text-rust"><Icon name="trash" size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* export options */}
      <section className="mt-6">
        <SectionLabel>内容导出格式</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: 'doc', t: 'Markdown', d: '对话/文本' },
            { icon: 'file', t: 'TXT', d: '纯文本' },
            { icon: 'doc', t: 'PDF', d: '排版文档' },
            { icon: 'layers', t: 'ZIP', d: '图片批量打包' },
          ].map((e) => (
              <button key={e.t} onClick={() => handleFormatExport(e.t)} className="panel flex items-center gap-3 p-4 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-brass-300">
                <Icon name={e.icon} size={16} />
              </div>
              <div>
                <div className="text-sm text-cream-50">{e.t}</div>
                <div className="text-[11px] text-cream-500">{e.d}</div>
              </div>
            </button>
            ))}
          </div>
        </section>
      </PageShell>
  )
}

function typeIcon(t) {
  return { chat: 'quill', image: 'image', code: 'code', doc: 'doc' }[t] ?? 'file'
}
function typeLabel(t) {
  return { chat: '对话', image: '图像', code: '代码', doc: '文档' }[t] ?? '文件'
}
