import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '../components/icons.jsx'
import { Badge, PageShell, SectionLabel, Segmented } from '../components/ui.jsx'
import { useApp } from '../lib/store.jsx'
import { IMAGE_HISTORY } from '../lib/data.js'
import { generateImage, generateImagePlaceholder, stopImageGeneration } from '../engine/ImageEngine.js'

const RATIOS = [
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
]

export default function ImageStudio() {
  const { activeImageModel, imgEngineStatus, imgEngineProgress, loadImageEngineModel } = useApp()
  const [positive, setPositive] = useState('雾中静谧的中式庭院，青瓦白墙，水墨风格，柔和光线')
  const [negative, setNegative] = useState('模糊，低质，变形，多余手指')
  const [ratio, setRatio] = useState('1:1')
  const [steps, setSteps] = useState(20)
  const [cfg, setCfg] = useState(7)
  const [seed, setSeed] = useState(8821)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [gallery, setGallery] = useState(IMAGE_HISTORY)
  const [currentImageUrl, setCurrentImageUrl] = useState(null)
  const abortRef = useRef(false)
  const prevUrlRef = useRef(null)

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
    }
  }, [])

  const engineReady = imgEngineStatus === 'ready'

  function randomize() {
    setSeed(Math.floor(Math.random() * 99999))
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  function exportGalleryJSON() {
    const data = gallery.map((g) => ({
      prompt: g.prompt,
      seed: g.seed,
      ratio: g.ratio,
      steps: g.step,
      createdAt: g.at,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vault-gallery-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generate = useCallback(async () => {
    if (generating) return
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = null
    }
    setCurrentImageUrl(null)
    setGenerating(true)
    setProgress(0)
    abortRef.current = false

    const dims = { '1:1': [512, 512], '3:4': [384, 512], '16:9': [512, 288], '9:16': [288, 512] }[ratio]

    if (engineReady) {
      try {
        const result = await generateImage({
          prompt: positive,
          negativePrompt: negative,
          numInferenceSteps: steps,
          guidanceScale: cfg,
          seed,
          width: dims[0],
          height: dims[1],
          onProgress: (p) => setProgress(Math.round((p.step / p.total) * 100)),
        })
        if (result && !abortRef.current) {
          const blob = await result.toBlob()
          const url = URL.createObjectURL(blob)
          prevUrlRef.current = url
          setCurrentImageUrl(url)
          setGallery((g) => [
            { id: `img-${Date.now()}`, prompt: positive, seed, ratio, step: steps, at: '刚刚' },
            ...g,
          ])
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('image gen error:', err)
      }
      setGenerating(false)
      return
    }

    // fallback: mock with placeholder
    const url = await generateImagePlaceholder({ prompt: positive, seed })
    if (!abortRef.current) {
      prevUrlRef.current = url
      setCurrentImageUrl(url)
    }
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 9 + 3
        if (next >= 100) {
          clearInterval(t)
          setGenerating(false)
          if (!abortRef.current) {
            setGallery((g) => [
              { id: `img-${Date.now()}`, prompt: positive, seed, ratio, step: steps, at: '刚刚' },
              ...g,
            ])
          }
          return 100
        }
        return next
      })
    }, 220)
  }, [positive, negative, ratio, steps, cfg, seed, generating, engineReady])

  function stop() {
    abortRef.current = true
    stopImageGeneration()
    setGenerating(false)
  }

  function handleGenerate() {
    generate()
  }

  const ratioClass = { '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '16:9': 'aspect-video', '9:16': 'aspect-[9/16]' }[ratio]

  return (
    <PageShell
      kicker="P1 · 图像处理"
      title="图像工坊"
      actions={
        <div className="flex items-center gap-2">
          <Badge tone="brass"><Icon name="cube" size={12} /> {activeImageModel?.name || 'SDXL Turbo'}</Badge>
          <span className="text-[10px] text-cream-500">
            {engineReady ? '· WebGPU 就绪' : imgEngineStatus === 'loading' ? `· 加载中 ${Math.round(imgEngineProgress.progress * 100)}%` : '· 模拟模式'}
          </span>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* config */}
        <div className="panel-raised space-y-5 p-5">
          <div>
            <SectionLabel>正向提示词</SectionLabel>
            <textarea
              value={positive}
              onChange={(e) => setPositive(e.target.value)}
              rows={3}
              className="field resize-none"
              placeholder="描述你想要的画面…"
            />
          </div>
          <div>
            <SectionLabel>负向提示词</SectionLabel>
            <textarea
              value={negative}
              onChange={(e) => setNegative(e.target.value)}
              rows={2}
              className="field resize-none"
              placeholder="不希望出现的元素…"
            />
          </div>

          <div>
            <SectionLabel>画面比例</SectionLabel>
            <Segmented value={ratio} onChange={setRatio} options={RATIOS} />
          </div>

          <Slider label="采样步数" value={steps} min={1} max={50} onChange={setSteps} suffix="步" />
          <Slider label="CFG 系数" value={cfg} min={1} max={20} step={0.5} onChange={setCfg} suffix="" />

          <div>
            <SectionLabel>随机种子</SectionLabel>
            <div className="flex items-center gap-2">
              <input value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)} className="field font-mono" />
              <button onClick={randomize} className="btn-ghost p-2.5" title="随机">
                <Icon name="refresh" size={15} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {generating ? (
              <button onClick={stop} className="btn-solid flex-1 bg-rust hover:bg-rust">
                <Icon name="stop" size={15} /> 停止
              </button>
            ) : (
              <button onClick={handleGenerate} className="btn-solid flex-1">
                <Icon name="sparkles" size={15} /> 开始生成
              </button>
            )}
            {!engineReady && imgEngineStatus !== 'loading' && (
              <button onClick={() => loadImageEngineModel('stable-diffusion-xl-turbo')} className="btn-outline px-3" title="加载图像模型">
                <Icon name="bolt" size={15} />
              </button>
            )}
          </div>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-cream-500">
            <Icon name="vault" size={11} className="text-phosphor-400" />
            {engineReady ? 'WebGPU 扩散模型 · 端侧推理' : '端侧扩散模型 · 加载引擎后真实推理'}
          </p>
        </div>

        {/* preview + gallery */}
        <div className="min-w-0 space-y-6">
          {/* canvas */}
          <div className="panel-raised p-5">
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel className="mb-0">生成预览</SectionLabel>
              {generating && <span className="font-mono text-[11px] text-brass-200">{Math.round(progress)}% · {steps} 步</span>}
            </div>
            <div className={`relative mx-auto ${ratioClass} max-h-[420px] w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-950`}>
              <div className="absolute inset-0 bg-blueprint opacity-30 [background-size:28px_28px]" />

              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(232,180,84,0.12),transparent)] bg-[length:200%_100%]" />
                    <div className="relative flex flex-col items-center">
                      <div className="relative h-14 w-14">
                        <span className="absolute inset-0 rounded-full border-2 border-brass-500/20" />
                        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-brass-400 motion-safe:animate-spin" />
                        <Icon name="image" size={22} className="absolute inset-0 m-auto text-brass-300" />
                      </div>
                      <div className="mt-4 font-mono text-xs text-brass-200">去噪中 · step {Math.round(progress / (100 / steps))}/{steps}</div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brass-400/40 motion-safe:animate-scan" />
                  </motion.div>
                ) : currentImageUrl ? (
                  <motion.img
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={currentImageUrl}
                    alt={positive}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                    <PlaceholderArt seed={seed} ratio={ratio} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {currentImageUrl && !generating && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center justify-center gap-2">
                <a href={currentImageUrl} download={`vault-${seed}.png`} className="btn-outline"><Icon name="download" size={14} /> 下载</a>
                <button onClick={() => { setCurrentImageUrl(null) }} className="btn-outline"><Icon name="refresh" size={14} /> 再生成</button>
              </motion.div>
            )}
          </div>

          {/* gallery */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel className="mb-0">本地画廊</SectionLabel>
              <button onClick={exportGalleryJSON} className="flex items-center gap-1 text-xs text-cream-400 hover:text-brass-300">
                <Icon name="export" size={13} /> 批量导出 JSON
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((g, i) => {
                const isFresh = g.at === '刚刚' && currentImageUrl && i === 0
                return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  data-blob={isFresh ? 'true' : undefined}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-ink-700/70 bg-ink-950"
                >
                  {isFresh ? (
                    <img src={currentImageUrl} alt={g.prompt} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <PlaceholderArt seed={g.seed} ratio="1:1" small />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="line-clamp-2 text-[11px] leading-tight text-cream-100">{g.prompt}</p>
                    <div className="mt-1 font-mono text-[9px] text-cream-500">{g.ratio} · {g.step}步 · {g.at}</div>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => copyToClipboard(g.prompt)} className="rounded-md border border-ink-700 bg-ink-900/80 p-1 text-cream-200 hover:text-brass-200" title="复制提示词"><Icon name="copy" size={12} /></button>
                    <button onClick={() => copyToClipboard(g.prompt)} className="rounded-md border border-ink-700 bg-ink-900/80 p-1 text-cream-200 hover:text-brass-200" title="复制提示词（暂无 blob 可下载）"><Icon name="download" size={12} /></button>
                  </div>
                </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

function Slider({ label, value, min, max, step = 1, onChange, suffix }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <span className="font-mono text-xs text-brass-200">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-700 accent-brass-400"
      />
    </div>
  )
}

function PlaceholderArt({ seed, small }) {
  const s = seed % 360
  const c1 = `hsl(${s}, 45%, 22%)`
  const c2 = `hsl(${(s + 40) % 360}, 50%, 14%)`
  const c3 = `hsl(${(s + 200) % 360}, 55%, 30%)`
  return (
    <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 25%, ${c3}, transparent 55%), radial-gradient(circle at 75% 70%, ${c1}, transparent 60%), linear-gradient(135deg, ${c2}, #0e0d0b)` }}>
      <svg className="absolute inset-0 h-full w-full opacity-50" preserveAspectRatio="none">
        <defs>
          <pattern id={`p${seed}`} width="26" height="26" patternTransform={`rotate(${s % 90})`}>
            <path d="M0 13 H26 M13 0 V26" stroke="rgba(232,180,84,0.10)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p${seed})`} />
      </svg>
      {!small && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <Icon name="image" size={14} className="text-cream-200/70" />
          <span className="font-mono text-[10px] text-cream-200/70">预览图 · seed {seed}</span>
        </div>
      )}
    </div>
  )
}
