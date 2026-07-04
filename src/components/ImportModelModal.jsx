import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from './icons.jsx'
import { Badge } from './ui.jsx'
import { fmtSize } from '../lib/data.js'

const IMPORT_TYPES = [
  { ext: '.gguf', label: 'GGUF', desc: 'llama.cpp 量化格式，支持绝大部分文本/代码模型' },
  { ext: '.onnx', label: 'ONNX', desc: '开放神经网络交换格式，适合图像/多模态模型' },
]

const QUANTS = ['Q2_K', 'Q3_K_M', 'Q4_K_M', 'Q5_K_M', 'Q6_K', 'Q8_0', 'FP16', 'FP32']

export function ImportModelModal({ open, onClose, onImport }) {
  const [step, setStep] = useState('select')
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [quant, setQuant] = useState('Q4_K_M')
  const [params, setParams] = useState('7B')
  const [ctx, setCtx] = useState(32768)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setStep('select')
      setFile(null)
      setName('')
      setQuant('Q4_K_M')
      setParams('7B')
      setCtx(32768)
      setImporting(false)
      setProgress(0)
    }
  }, [open])

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const base = f.name.replace(/\.(gguf|onnx)$/i, '')
    setName(base)
    setStep('meta')
  }

  async function doImport() {
    if (!file || !name.trim()) return
    setImporting(true)
    setProgress(0)

    const total = file.size
    let loaded = 0

    try {
      const root = await navigator.storage?.getDirectory()
      const modelsDir = await root.getDirectoryHandle('models', { create: true })
      const fh = await modelsDir.getFileHandle(file.name, { create: true })
      const writable = await fh.createWritable()

      const reader = file.stream().getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        await writable.write(value)
        loaded += value.length
        setProgress(Math.min(95, Math.round((loaded / total) * 100)))
      }
      await writable.close()

      setProgress(100)
      const meta = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        category: file.name.endsWith('.gguf') ? 'text' : 'image',
        params,
        quant,
        size: total / (1024 * 1024 * 1024),
        vram: Math.round(total / (1024 * 1024)),
        ctx: file.name.endsWith('.gguf') ? ctx : 0,
        speed: 0,
        scenes: ['自定义'],
        desc: `自定义导入模型 · ${file.name}`,
        badge: '自定义',
      }
      setTimeout(() => {
        onImport(meta, file.name)
        onClose()
      }, 400)
    } catch (err) {
      console.error('import failed:', err)
      setImporting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brass-500/30 bg-brass-400/10 text-brass-300">
                  <Icon name="upload" size={16} />
                </div>
                <h2 className="font-serif text-lg text-cream-50">导入自定义模型</h2>
              </div>
              <button onClick={onClose} className="btn-ghost p-2">
                <Icon name="close" size={16} />
              </button>
            </div>

            {step === 'select' && (
              <div className="p-5">
                <p className="mb-4 text-sm text-cream-400">支持以下格式，模型文件存储于浏览器 OPFS，持久保存。</p>
                <div className="space-y-2.5">
                  {IMPORT_TYPES.map((t) => (
                    <div key={t.ext} className="flex items-center gap-3 rounded-xl border border-ink-700/70 bg-ink-850/50 p-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 font-mono text-[10px] text-brass-300">
                        {t.ext}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-cream-50">{t.label}</div>
                        <div className="text-[11px] text-cream-500">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <label className="btn-solid mt-5 flex w-full cursor-pointer items-center justify-center gap-2">
                  <Icon name="file" size={15} /> 选择模型文件
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".gguf,.onnx"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              </div>
            )}

            {step === 'meta' && (
              <div className="p-5">
                <div className="flex items-center gap-3 rounded-xl border border-ink-700/70 bg-ink-850/50 p-3.5">
                  <Icon name="file" size={16} className="text-brass-300" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-cream-50">{file?.name}</div>
                    <div className="font-mono text-[10px] text-cream-500">{fmtSize((file?.size || 0) / (1024 * 1024 * 1024))}</div>
                  </div>
                  <Badge tone="phosphor">已选择</Badge>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div>
                    <label className="label-mono mb-1.5 block">模型名称</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="例如：My Custom Model" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-mono mb-1.5 block">参数量</label>
                      <select value={params} onChange={(e) => setParams(e.target.value)} className="field cursor-pointer">
                        {['1B', '3B', '7B', '8B', '13B', '14B', '20B', '34B', '70B'].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-mono mb-1.5 block">量化格式</label>
                      <select value={quant} onChange={(e) => setQuant(e.target.value)} className="field cursor-pointer">
                        {QUANTS.map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {file?.name.endsWith('.gguf') && (
                    <div>
                      <label className="label-mono mb-1.5 block">上下文长度</label>
                      <select value={ctx} onChange={(e) => setCtx(Number(e.target.value))} className="field cursor-pointer">
                        {[4096, 8192, 16384, 32768, 65536, 131072].map((c) => (
                          <option key={c} value={c}>{(c / 1024).toFixed(0)}K</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep('select')} className="btn-outline flex-1">返回</button>
                  <button onClick={doImport} disabled={!name.trim() || importing} className="btn-solid flex-1 disabled:opacity-50">
                    {importing ? (
                      <><Icon name="refresh" size={15} className="animate-spin" /> 导入中 {progress}%</>
                    ) : (
                      <><Icon name="upload" size={15} /> 导入 OPFS</>
                    )}
                  </button>
                </div>
                {importing && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div className="h-full rounded-full bg-brass-400 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
