import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from './icons.jsx'

const PAGES = [
  { to: '/', label: '总览', icon: 'home', keywords: 'dashboard home 首页' },
  { to: '/models', label: '模型管理', icon: 'cube', keywords: 'model 模型市场 下载 调度' },
  { to: '/text', label: '文本创作', icon: 'quill', keywords: 'text chat 对话 写作 模板' },
  { to: '/image', label: '图像工坊', icon: 'image', keywords: 'image 图片 生成 重绘' },
  { to: '/code', label: '代码辅助', icon: 'code', keywords: 'code 编程 生成 补全' },
  { to: '/data', label: '数据金库', icon: 'harddrive', keywords: 'data 历史 备份 导出' },
  { to: '/settings', label: '设置', icon: 'sliders', keywords: 'settings 隐私 配置 主题' },
]

const COMMANDS = [
  { id: 'goto-text', label: '转到文本创作', icon: 'quill', action: 'navigate', to: '/text' },
  { id: 'goto-image', label: '转到图像工坊', icon: 'image', action: 'navigate', to: '/image' },
  { id: 'goto-code', label: '转到代码辅助', icon: 'code', action: 'navigate', to: '/code' },
  { id: 'goto-models', label: '打开模型管理', icon: 'cube', action: 'navigate', to: '/models' },
  { id: 'goto-settings', label: '打开设置', icon: 'sliders', action: 'navigate', to: '/settings' },
  { id: 'goto-data', label: '打开数据金库', icon: 'harddrive', action: 'navigate', to: '/data' },
]

export function useKeyboard() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    function handler(e) {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(false)
        setSearchOpen((o) => !o)
      }
      if (meta && e.key === '/') {
        e.preventDefault()
        setSearchOpen(false)
        setCmdOpen((o) => !o)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setCmdOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { searchOpen, setSearchOpen, cmdOpen, setCmdOpen }
}

export function SearchModal({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)

  const results = useMemo(() => {
    const query = q.toLowerCase().trim()
    if (!query) return PAGES
    return PAGES.filter(
      (p) =>
        p.label.includes(query) ||
        p.keywords.includes(query) ||
        p.to.includes(query),
    )
  }, [q])

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setSel(0) }, [q])

  function go(i) {
    const item = results[i]
    if (!item) return
    navigate(item.to)
    onClose()
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); go(sel) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/70 pt-[15vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl"
          >
            <div className="relative">
              <Icon name="search" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream-500" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="搜索页面、模型、模板…"
                className="h-13 w-full bg-transparent pl-11 pr-4 text-sm text-cream-50 placeholder:text-cream-600 outline-none"
              />
            </div>
            <div className="max-h-72 overflow-y-auto border-t border-ink-800 p-2">
              {results.map((item, i) => (
                <button
                  key={item.to}
                  onClick={() => go(i)}
                  onMouseEnter={() => setSel(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    i === sel ? 'bg-ink-750 text-cream-50' : 'text-cream-300 hover:bg-ink-800/60'
                  }`}
                >
                  <Icon name={item.icon} size={16} className={i === sel ? 'text-brass-300' : 'text-cream-500'} />
                  <span className="flex-1">{item.label}</span>
                  <span className="font-mono text-[10px] text-cream-600">{item.to}</span>
                </button>
              ))}
              {results.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-cream-500">无匹配结果</div>
              )}
            </div>
            <div className="flex items-center gap-4 border-t border-ink-800 px-4 py-2.5 text-[10px] text-cream-600">
              <span><kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-cream-400">↑↓</kbd> 导航</span>
              <span><kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-cream-400">↵</kbd> 打开</span>
              <span><kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-cream-400">Esc</kbd> 关闭</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CommandModal({ open, onClose }) {
  const navigate = useNavigate()
  const [sel, setSel] = useState(0)

  useEffect(() => {
    if (open) setSel(0)
  }, [open])

  function go(i) {
    const cmd = COMMANDS[i]
    if (!cmd) return
    if (cmd.action === 'navigate') navigate(cmd.to)
    onClose()
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, COMMANDS.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); go(sel) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/70 pt-[15vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl"
            tabIndex={-1}
            onKeyDown={onKey}
          >
            <div className="flex items-center gap-3 border-b border-ink-800 px-4 py-3">
              <Icon name="bolt" size={15} className="text-brass-300" />
              <span className="text-sm font-medium text-cream-50">命令面板</span>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {COMMANDS.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => go(i)}
                  onMouseEnter={() => setSel(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    i === sel ? 'bg-ink-750 text-cream-50' : 'text-cream-300 hover:bg-ink-800/60'
                  }`}
                >
                  <Icon name={cmd.icon} size={16} className={i === sel ? 'text-brass-300' : 'text-cream-500'} />
                  <span className="flex-1">{cmd.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-ink-800 px-4 py-2.5 text-[10px] text-cream-600">
              <span><kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-cream-400">↑↓</kbd> 导航</span>
              <span><kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-cream-400">↵</kbd> 执行</span>
              <span><kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-cream-400">Esc</kbd> 关闭</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
