import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { Icon } from '../components/icons.jsx'
import { Badge, Segmented } from '../components/ui.jsx'
import { useApp } from '../lib/store.jsx'
import { generateText, stopGeneration } from '../engine/TextEngine.js'

const LANGS = [
  { value: 'js', label: 'JS' },
  { value: 'ts', label: 'TS' },
  { value: 'py', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
]

const MODES = [
  { value: 'gen', label: '生成', icon: 'sparkles' },
  { value: 'analyze', label: '分析', icon: 'search' },
  { value: 'convert', label: '转换', icon: 'refresh' },
]

const SAMPLE_CODE = `// useDebounce — 防抖 hook
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}`

const ANALYSIS = [
  { tag: '正确性', tone: 'phosphor', text: '逻辑正确，清理函数已正确清除定时器，无内存泄漏。' },
  { tag: '性能', tone: 'brass', text: '建议用 useRef 缓存最新值，避免每次渲染重建闭包。' },
  { tag: '可读性', tone: 'brass', text: '可补充类型注解与默认值注释，便于团队协作。' },
]

export default function CodeStudio() {
  const { activeModel, engineStatus } = useApp()
  const [lang, setLang] = useState('ts')
  const [mode, setMode] = useState('gen')
  const [prompt, setPrompt] = useState('实现一个防抖 hook，支持泛型与可配置延迟')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(SAMPLE_CODE)
  const [analysis, setAnalysis] = useState([])
  const engineReady = engineStatus === 'ready'
  const abortRef = useRef(false)

  async function run() {
    if (running) return
    setRunning(true)
    abortRef.current = false

    if (engineReady) {
      const sysPrompt = mode === 'gen'
        ? `You are a ${lang} code generator. Output ONLY code without explanation.`
        : mode === 'analyze'
        ? 'You are a code reviewer. Analyze the code for correctness, performance, readability. Output a markdown list, each item starting with "- [Category]: description" where Category is one of 正确性, 性能, 可读性, 安全性, 兼容性, 代码风格, 测试, 架构, 其他.'
        : 'You are a code converter. Convert the code to the target language. Output ONLY the converted code.'

      try {
        let full = ''
        if (mode === 'analyze') {
          full = await generateText({
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: `Analyze this code:\n\`\`\`\n${prompt}\n\`\`\`` },
            ],
            onStream: (partial) => {
              if (!abortRef.current) {
                setResult(partial)
                const parsed = parseAnalysisResults(partial)
                if (parsed) setAnalysis(parsed)
              }
            },
            temperature: 0.3,
          })
          if (!abortRef.current) {
            setResult(full)
            const parsed = parseAnalysisResults(full)
            if (parsed) setAnalysis(parsed)
          }
        } else {
          full = await generateText({
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: prompt },
            ],
            onStream: (partial) => { if (!abortRef.current) setResult(partial) },
            temperature: 0.4,
          })
        }
        if (!abortRef.current) setResult(full)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setResult(`// Error: ${err.message}`)
        }
      }
      setRunning(false)
      return
    }

    // fallback mock
    setTimeout(() => {
      setResult(SAMPLE_CODE)
      setRunning(false)
    }, 900)
  }

  function stop() {
    abortRef.current = true
    stopGeneration()
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

  function exportCode() {
    const ext = { js: 'js', ts: 'ts', py: 'py', html: 'html', css: 'css' }[lang] || 'txt'
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vault-output.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  function parseAnalysisResults(text) {
    const lines = text.split('\n').filter((l) => l.trim())
    const items = []
    for (const line of lines) {
      const m = line.match(/^[-*]\s*\[?(正确性|性能|可读性|安全性|兼容性|代码风格|测试|架构|其他)[\]：:]?\s*[:：]?\s*(.+)/i)
      if (m) {
        items.push({ tag: m[1], tone: m[1] === '正确性' ? 'phosphor' : 'brass', text: m[2].trim() })
      } else if (line.length > 10) {
        const fallback = /正确|逻辑|bug|error|error/i.test(line) ? '正确性'
          : /性能|效率|优化|缓存|闭包/i.test(line) ? '性能'
          : '可读性'
        items.push({ tag: fallback, tone: fallback === '正确性' ? 'phosphor' : 'brass', text: line.replace(/^[-*]\s*/, '').trim() })
      }
    }
    return items.length > 0 ? items : null
  }

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brass-500/30 bg-brass-400/10 text-brass-300">
            <Icon name="code" size={17} />
          </div>
          <div>
            <h1 className="font-serif text-lg leading-tight text-cream-50">代码辅助</h1>
            <div className="font-mono text-[10px] text-cream-500">
              {activeModel?.name}
              {engineReady ? ' · WebGPU 推理就绪' : ' · 模拟模式'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-ink-700 bg-ink-900/60 p-0.5">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  mode === m.value ? 'bg-ink-750 text-brass-200' : 'text-cream-400 hover:text-cream-100'
                }`}
              >
                <Icon name={m.icon} size={13} /> {m.label}
              </button>
            ))}
          </div>
          <Segmented value={lang} onChange={setLang} options={LANGS} />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
        {/* left: prompt + history */}
        <div className="flex min-h-0 flex-col border-r border-ink-800">
          <div className="border-b border-ink-800 px-6 py-4">
            <div className="label-mono mb-2">{mode === 'gen' ? '需求描述' : mode === 'analyze' ? '粘贴代码' : '源代码'}</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="field resize-none font-mono text-[13px]"
              placeholder={mode === 'gen' ? '用自然语言描述你要实现的功能…' : '粘贴待处理的代码…'}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {['防抖 hook', '快速排序', 'JWT 校验中间件', '正则校验邮箱'].map((s) => (
                  <button key={s} onClick={() => setPrompt(s)} className="chip hover:border-brass-500/40 hover:text-brass-200">{s}</button>
                ))}
              </div>
              <button onClick={running ? stop : run} className={`btn-solid ${running ? 'bg-rust hover:bg-rust' : ''}`}>
                {running ? <><Icon name="stop" size={14} /> 停止</> : <><Icon name="play" size={14} /> 运行</>}
              </button>
            </div>
          </div>

          {/* analysis */}
          {mode === 'analyze' && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="label-mono mb-3">分析报告</div>
              <div className="space-y-2.5">
                {(analysis.length > 0 ? analysis : ANALYSIS).map((a) => (
                  <div key={a.tag} className="rounded-xl border border-ink-700/70 bg-ink-850/50 p-3.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <Badge tone={a.tone}>{a.tag}</Badge>
                      <Icon name="check" size={13} className={a.tone === 'phosphor' ? 'text-phosphor-300' : 'text-brass-300'} />
                    </div>
                    <p className="text-[13px] leading-relaxed text-cream-200">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode !== 'analyze' && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="label-mono mb-3">最近会话</div>
              <p className="text-[13px] text-cream-500">暂无会话记录</p>
            </div>
          )}
        </div>

        {/* right: code output */}
        <div className="flex min-h-0 flex-col bg-ink-950/60">
          <div className="flex items-center justify-between border-b border-ink-800 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rust/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-brass-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-phosphor-500/70" />
              </span>
              <span className="ml-2 font-mono text-[11px] text-cream-500">output.{lang}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => copyToClipboard(result)} className="btn-ghost p-2" title="复制"><Icon name="copy" size={14} /></button>
              <button onClick={exportCode} className="btn-ghost p-2" title="导出"><Icon name="export" size={14} /></button>
            </div>
          </div>
          <div className="relative min-h-0 flex-1 overflow-auto">
            <motion.pre
              key="code-output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full p-5 font-mono text-[13px] leading-relaxed"
            >
              <CodeBlock code={result} />
              {running && <span className="cursor-bar" />}
            </motion.pre>
          </div>
          <div className="flex items-center justify-between border-t border-ink-800 px-5 py-2.5 text-[10.5px] text-cream-600">
            <span className="flex items-center gap-1.5">
              <Icon name="vault" size={11} className="text-phosphor-400" />
              {engineReady ? 'WebGPU 本地推理 · 代码不出本机' : '模拟模式 · 加载引擎后可真实推理'}
            </span>
            <span className="font-mono">{result.split('\n').length} 行</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Lightweight tokenizer-based highlight (no external dep).
function CodeBlock({ code }) {
  const lines = code.split('\n')
  return (
    <code className="block">
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="mr-4 inline-block w-6 select-none text-right text-cream-700">{i + 1}</span>
          <span className="flex-1" dangerouslySetInnerHTML={{ __html: highlight(line) }} />
        </div>
      ))}
    </code>
  )
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function highlight(line) {
  let s = esc(line)
  // comments
  s = s.replace(/(\/\/.*$)/g, '<span style="color:#827c6c">$1</span>')
  // strings
  s = s.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#e2b65a">$1</span>')
  // keywords
  s = s.replace(/\b(export|function|const|let|var|return|if|else|for|import|from|default|new|await|async|class|extends|def|self|elif|in|None|True|False)\b/g, '<span style="color:#e8b454">$1</span>')
  // function names
  s = s.replace(/\b([a-zA-Z_$][\w$]*)(?=\s*\()/g, '<span style="color:#9ee6a0">$1</span>')
  // numbers
  s = s.replace(/\b(\d+)\b/g, '<span style="color:#cf6a4f">$1</span>')
  return s || '&nbsp;'
}
