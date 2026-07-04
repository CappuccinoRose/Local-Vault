import { useState } from 'react'
import { motion } from 'motion/react'
import { Icon } from '../components/icons.jsx'
import { Badge, PageShell, RingProgress, SectionLabel, Segmented } from '../components/ui.jsx'
import { ImportModelModal } from '../components/ImportModelModal.jsx'
import { useApp } from '../lib/store.jsx'
import { MARKET_MODELS, fmtSize, fmtVram } from '../lib/data.js'

const CATS = [
  { value: 'all', label: '全部' },
  { value: 'text', label: '文本生成' },
  { value: 'image', label: '图像处理' },
  { value: 'code', label: '代码生成' },
]

export default function Models() {
  const { hardware, localModels, setLocalModels, activeModel, activeModelId, activeImageModel: _activeImageModel, activeImageModelId, device, setDevice, vramCap, setVramCap, vramTotal, engineStatus, engineProgress, loadEngineModel, unloadEngineModel, imgEngineStatus, imgEngineProgress, loadImageEngineModel, unloadImageEngineModel } = useApp()
  const [cat, setCat] = useState('all')
  const [downloading, setDownloading] = useState({})
  const [importOpen, setImportOpen] = useState(false)
  const [customModels, setCustomModels] = useState([])

  const allMarket = [...MARKET_MODELS, ...customModels]
  const models = allMarket.filter((m) => cat === 'all' || m.category === cat)
  const isLocal = (id) => localModels.some((l) => l.id === id)

  function startDownload(m) {
    if (isLocal(m.id) || downloading[m.id] != null) return
    setDownloading((d) => ({ ...d, [m.id]: 0 }))
    const t = setInterval(() => {
      setDownloading((d) => {
        const next = (d[m.id] ?? 0) + Math.random() * 16 + 6
        if (next >= 100) {
          clearInterval(t)
          setLocalModels((ls) => [...ls, { id: m.id, status: 'ready', isDefault: false, version: 'v1.0', addedAt: '今天' }])
          const { [m.id]: _omit, ...rest } = d
          return rest
        }
        return { ...d, [m.id]: next }
      })
    }, 320)
  }

  return (
    <PageShell
      kicker="P0 · 模型管理"
      title="模型市场与调度"
      actions={
        <button onClick={() => setImportOpen(true)} className="btn-outline">
          <Icon name="upload" size={15} /> 导入自定义模型
        </button>
      }
    >
      {/* resource scheduling bar */}
      <section className="panel-raised mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brass-500/30 bg-brass-400/10 text-brass-300">
              <Icon name="gauge" size={20} />
            </div>
            <div>
              <div className="font-serif text-base text-cream-50">智能调度与资源管理</div>
              <div className="text-xs text-cream-500">{hardware.gpu} · 显存 {fmtVram(hardware.vramTotal)}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="label-mono">推理设备</span>
              <Segmented
                value={device}
                onChange={setDevice}
                options={[
                  { value: 'webgpu', label: 'WebGPU' },
                  { value: 'cpu', label: 'CPU' },
                ]}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="label-mono">显存上限</span>
              <input
                type="range"
                min={40}
                max={100}
                value={vramCap}
                onChange={(e) => setVramCap(Number(e.target.value))}
                className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-ink-700 accent-brass-400"
              />
              <span className="w-10 font-mono text-xs text-brass-200">{vramCap}%</span>
            </div>
          </div>
        </div>

        {/* live allocation */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-cream-500">
            <span className="font-mono uppercase tracking-wider">显存分配</span>
            <span className="font-mono">{fmtVram(activeModel?.vram ?? 0)} / {fmtVram(Math.round(vramTotal * vramCap / 100))} 上限</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brass-500 to-brass-300"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((activeModel?.vram ?? 0) / vramTotal) * 100 * (100 / vramCap))}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </section>

      {/* market */}
      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionLabel className="mb-0">官方模型库</SectionLabel>
          <Segmented value={cat} onChange={setCat} options={CATS} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-ink-850/60 p-5 transition-colors ${
                activeModelId === m.id ? 'border-brass-500/50 shadow-brass' : 'border-ink-700/80 hover:border-ink-650'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-700 bg-ink-900 text-brass-300">
                  <Icon name={m.category === 'image' ? 'image' : m.category === 'code' ? 'code' : 'cube'} size={20} />
                </div>
                <Badge tone={m.badge === '推荐' ? 'brass' : 'ink'}>{m.badge}</Badge>
              </div>

              <h3 className="mt-3.5 font-serif text-lg text-cream-50">{m.name}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-cream-400">{m.desc}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.scenes.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-700/60 pt-3 text-center">
                <Spec k="参数量" v={m.params} />
                <Spec k="量化" v={m.quant} />
                <Spec k="大小" v={fmtSize(m.size)} />
                <Spec k="显存" v={fmtVram(m.vram)} />
                <Spec k="上下文" v={m.ctx ? `${m.ctx / 1024}K` : '—'} />
                <Spec k="速度" v={m.speed ? `${m.speed}t/s` : '—'} />
              </div>

              {/* action */}
              <div className="mt-4">
                {m.category === 'image' ? (
                  <>
                    {activeImageModelId === m.id && imgEngineStatus === 'ready' ? (
                      <div className="flex items-center justify-between rounded-lg border border-phosphor-500/30 bg-phosphor-500/10 px-3 py-2">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-phosphor-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-phosphor-400 motion-safe:animate-pulse" /> 图像引擎就绪
                        </span>
                        <button onClick={unloadImageEngineModel} className="text-[10px] text-cream-400 hover:text-rust">卸载</button>
                      </div>
                    ) : activeImageModelId === m.id && imgEngineStatus === 'loading' ? (
                      <div className="rounded-lg border border-brass-500/30 bg-brass-400/10 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px] text-cream-400">
                          <span className="flex items-center gap-1.5"><Icon name="refresh" size={13} /> 图像引擎加载中</span>
                          <span className="font-mono text-brass-200">{Math.round(imgEngineProgress.progress * 100)}%</span>
                        </div>
                      </div>
                    ) : isLocal(m.id) ? (
                      <button onClick={() => loadImageEngineModel(m.id)} className="btn-outline w-full">
                        <Icon name="bolt" size={15} /> 加载到图像引擎
                      </button>
                    ) : downloading[m.id] != null ? (
                      <div className="rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px] text-cream-400">
                          <span className="flex items-center gap-1.5"><Icon name="download" size={13} /> 下载中</span>
                          <span className="font-mono text-brass-200">{Math.round(downloading[m.id])}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                          <div className="h-full rounded-full bg-brass-400 transition-all" style={{ width: `${downloading[m.id]}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => startDownload(m)} className="btn-solid w-full">
                        <Icon name="download" size={15} /> 下载 · {fmtSize(m.size)}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {activeModelId === m.id && engineStatus === 'ready' ? (
                      <div className="flex items-center justify-between rounded-lg border border-phosphor-500/30 bg-phosphor-500/10 px-3 py-2">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-phosphor-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-phosphor-400 motion-safe:animate-pulse" /> 引擎就绪
                        </span>
                        <button onClick={unloadEngineModel} className="text-[10px] text-cream-400 hover:text-rust">卸载</button>
                      </div>
                    ) : activeModelId === m.id && engineStatus === 'loading' ? (
                      <div className="rounded-lg border border-brass-500/30 bg-brass-400/10 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px] text-cream-400">
                          <span className="flex items-center gap-1.5"><Icon name="refresh" size={13} /> 引擎加载中</span>
                          <span className="font-mono text-brass-200">{Math.round(engineProgress.progress * 100)}%</span>
                        </div>
                      </div>
                    ) : isLocal(m.id) ? (
                      <button onClick={() => loadEngineModel(m.id)} className="btn-outline w-full">
                        <Icon name="bolt" size={15} /> 加载到引擎
                      </button>
                    ) : downloading[m.id] != null ? (
                      <div className="rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px] text-cream-400">
                          <span className="flex items-center gap-1.5"><Icon name="download" size={13} /> 下载中</span>
                          <span className="font-mono text-brass-200">{Math.round(downloading[m.id])}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                          <div className="h-full rounded-full bg-brass-400 transition-all" style={{ width: `${downloading[m.id]}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => startDownload(m)} className="btn-solid w-full">
                        <Icon name="download" size={15} /> 下载 · {fmtSize(m.size)}
                      </button>
                    )}
                  </>
                )}
              </div>

              {m.vram > hardware.vramTotal && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rust">
                  <Icon name="bolt" size={12} /> 显存不足，建议关闭其他模型
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </section>

      {/* local models */}
      <section>
        <SectionLabel>本地模型 · OPFS 持久化</SectionLabel>
        <div className="panel divide-y divide-ink-700/60">
          {localModels.map((l) => {
            const m = [...MARKET_MODELS, ...customModels].find((x) => x.id === l.id)
            if (!m) return null
            const isImage = m.category === 'image'
            const active = isImage ? activeImageModelId === l.id : activeModelId === l.id
            const engineReady = isImage ? (imgEngineStatus === 'ready' && active) : (engineStatus === 'ready' && active)
            const engineLoading = isImage ? (imgEngineStatus === 'loading' && active) : (engineStatus === 'loading' && active)
            const loadFn = isImage ? loadImageEngineModel : loadEngineModel
            const unloadFn = isImage ? unloadImageEngineModel : unloadEngineModel
            return (
              <div key={l.id} className="flex flex-wrap items-center gap-4 px-4 py-3.5">
                <RingProgress value={engineReady ? 100 : engineLoading ? 50 : 0} size={40} stroke={3} tone={engineReady ? 'brass' : engineLoading ? 'brass' : 'ink'} label={engineReady ? <Icon name="bolt" size={13} /> : engineLoading ? <span className="font-mono text-[9px] text-brass-200">…</span> : null} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-cream-50">{m.name}</span>
                    {engineReady && <Badge tone="phosphor">引擎就绪</Badge>}
                    {engineLoading && <Badge tone="brass">加载中</Badge>}
                  </div>
                  <div className="font-mono text-[10.5px] text-cream-500">{m.params} · {m.quant} · {fmtSize(m.size)} · {l.version} · 添加于 {l.addedAt}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!engineReady && !engineLoading && (
                    <button onClick={() => loadFn(l.id)} className="btn-ghost">
                      <Icon name="play" size={14} /> 加载到{isImage ? '图像' : ''}引擎
                    </button>
                  )}
                  {engineReady && (
                    <button onClick={unloadFn} className="btn-ghost text-rust hover:text-rust">
                      <Icon name="stop" size={14} /> 卸载
                    </button>
                  )}
                  <button className="btn-ghost p-2">
                    <Icon name="more" size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-cream-500">
          <Icon name="shieldLock" size={13} className="text-phosphor-400" />
          模型文件存储于浏览器原点私有文件系统（OPFS），持久保存，不随缓存清除。
        </p>
      </section>

      <ImportModelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(meta, _fileName) => {
          setCustomModels((prev) => [...prev, meta])
          setLocalModels((ls) => [...ls, {
            id: meta.id,
            status: 'ready',
            isDefault: false,
            version: 'v1.0',
            addedAt: '今天',
          }])
        }}
      />
    </PageShell>
  )
}

function Spec({ k, v }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-cream-600">{k}</div>
      <div className="mt-0.5 text-[13px] text-cream-100">{v}</div>
    </div>
  )
}
