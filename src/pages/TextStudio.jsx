import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '../components/icons.jsx'
import { Badge, Segmented } from '../components/ui.jsx'
import { useApp } from '../lib/store.jsx'
import { TEMPLATES, CHAT_SEED, STREAM_DEMO } from '../lib/data.js'
import { readFileContent, countChars, estimateTokens } from '../lib/fileParser.js'
import { generateText, stopGeneration } from '../engine/TextEngine.js'

const SUGGEST = [
  '帮我把这段话润色得更专业',
  '用公文格式写一份会议纪要',
  '总结这篇长文的核心观点',
  '把需求文档翻译成英文',
]

export default function TextStudio() {
  const { activeModel, engineStatus } = useApp()
  const [messages, setMessages] = useState(CHAT_SEED)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [view, setView] = useState('chat')
  const [ctx, setCtx] = useState('32K')
  const scrollRef = useRef(null)
  const abortRef = useRef(false)
  const fileInputRef = useRef(null)
  const engineReady = engineStatus === 'ready'

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamText])

  async function handleImport(e) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const text = await readFileContent(f)
      send(`【导入文档：${f.name}】\n\n${text}`)
    } catch (err) {
      send(`导入文档失败：${err.message}`)
    }
    e.target.value = ''
  }

  async function send(text) {
    const content = (text ?? input).trim()
    if (!content || streaming) return
    const userMsg = { role: 'user', content, time: now() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setStreaming(true)
    abortRef.current = false
    setStreamText('')

    if (engineReady) {
      try {
        const chatMessages = updated.map((m) => ({
          role: m.role,
          content: m.content,
        }))
        const full = await generateText({
          messages: chatMessages,
          onStream: (partial) => {
            if (!abortRef.current) setStreamText(partial)
          },
        })
        if (!abortRef.current) {
          setMessages((m) => [...m, { role: 'assistant', content: full, time: now() }])
          setStreamText('')
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setMessages((m) => [...m, { role: 'assistant', content: `推理出错：${err.message}`, time: now() }])
        }
      }
      setStreaming(false)
      return
    }

    // fallback: mock streaming
    const full = STREAM_DEMO
    let i = 0
    const t = setInterval(() => {
      if (abortRef.current) {
        clearInterval(t)
        setMessages((m) => [...m, { role: 'assistant', content: full.slice(0, i), time: now(), partial: true }])
        setStreamText('')
        setStreaming(false)
        return
      }
      i += Math.max(1, Math.round(Math.random() * 2))
      setStreamText(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(t)
        setMessages((m) => [...m, { role: 'assistant', content: full, time: now() }])
        setStreamText('')
        setStreaming(false)
      }
    }, 18)
  }

  function stop() {
    abortRef.current = true
    stopGeneration()
  }
  function regenerate() {
    setMessages((m) => m.slice(0, -1))
    setTimeout(() => send('请重新生成'), 50)
  }

  return (
    <div className="flex h-full">
      {/* main chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brass-500/30 bg-brass-400/10 text-brass-300">
              <Icon name="quill" size={17} />
            </div>
            <div>
              <h1 className="font-serif text-lg leading-tight text-cream-50">文本创作</h1>
              <div className="font-mono text-[10px] text-cream-500">
                {activeModel?.name}
                {engineReady ? ' · WebGPU 推理就绪' : engineStatus === 'loading' ? ' · 引擎加载中…' : ' · 模拟模式'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'chat', label: '对话' },
                { value: 'templates', label: '模板' },
                { value: 'doc', label: '长文档' },
              ]}
            />
            <div className="hidden items-center gap-2 sm:flex">
              <span className="label-mono">上下文</span>
              <Segmented value={ctx} onChange={setCtx} options={[{ value: '8K', label: '8K' }, { value: '16K', label: '16K' }, { value: '32K', label: '32K' }]} />
            </div>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} onRegenerate={i === messages.length - 1 && msg.role === 'assistant' ? regenerate : null} />
            ))}
            {streaming && (
              <Message msg={{ role: 'assistant', content: streamText, time: now(), streaming: true }} />
            )}
          </div>
        </div>

        {/* composer */}
        <div className="border-t border-ink-800 px-6 py-4">
          <div className="mx-auto max-w-3xl">
            {messages.length <= 2 && !streaming && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGEST.map((s) => (
                  <button key={s} onClick={() => send(s)} className="chip hover:border-brass-500/40 hover:text-brass-200">
                    <Icon name="sparkles" size={12} /> {s}
                  </button>
                ))}
              </div>
            )}
            <div className="panel-raised flex items-end gap-2 p-2">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleImport} accept=".txt,.md,.pdf,.docx" />
              <button className="btn-ghost p-2" title="导入文档作为上下文" onClick={() => fileInputRef.current?.click()}>
                <Icon name="file" size={17} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="输入内容，Enter 发送，Shift+Enter 换行…"
                className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-cream-50 placeholder:text-cream-600 outline-none"
              />
              {streaming ? (
                <button onClick={stop} className="btn-ghost text-rust hover:text-rust">
                  <Icon name="stop" size={15} /> 停止
                </button>
              ) : (
                <button onClick={() => send()} disabled={!input.trim()} className="btn-solid disabled:cursor-not-allowed disabled:opacity-40">
                  <Icon name="send" size={15} /> 发送
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10.5px] text-cream-600">
              <span className="flex items-center gap-1.5">
                <Icon name="vault" size={11} className="text-phosphor-400" />
                {engineReady ? 'WebGPU 本地推理 · 内容不离开设备' : engineStatus === 'loading' ? '引擎加载中…' : '模拟模式 · 加载引擎后可真实推理'}
              </span>
              <span className="font-mono">{input.length} 字</span>
            </div>
          </div>
        </div>
      </div>

      {/* side panel */}
      <AnimatePresence mode="wait">
        {view !== 'chat' && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="hidden shrink-0 overflow-hidden border-l border-ink-800 lg:block"
          >
            <div className="h-full w-[340px] overflow-y-auto p-5">
              {view === 'templates' && <TemplatesPanel onPick={(t) => {
                const fieldsText = t.fields.map((f) => `- ${f}`).join('\n')
                setInput(`请按「${t.name}」场景生成内容。\n\n请提供以下信息：\n${fieldsText}\n\n（也可以直接粘贴你的原始素材，我会帮你生成）`)
                setView('chat')
              }} />}
              {view === 'doc' && <DocPanel onAction={(text) => { setInput(text); setView('chat') }} />}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

function Message({ msg, onRegenerate }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
        isUser ? 'border-ink-700 bg-ink-800 text-cream-300' : 'border-brass-500/30 bg-brass-400/10 text-brass-300'
      }`}>
        <Icon name={isUser ? 'cursor' : 'vault'} size={15} />
      </div>
      <div className={`group min-w-0 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
          isUser ? 'bg-ink-750 text-cream-50' : 'border border-ink-700/70 bg-ink-850/70 text-cream-100'
        }`}>
          <div className="whitespace-pre-wrap text-left">
            {msg.content}
            {msg.streaming && <span className="cursor-bar" />}
          </div>
        </div>
        {!msg.streaming && (
          <div className={`mt-1.5 flex items-center gap-2 text-[10.5px] text-cream-600 ${isUser ? 'justify-end' : ''}`}>
            <span className="font-mono">{msg.time}</span>
            {!isUser && (
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <IconBtn name="copy" content={msg.content} />
                <IconBtn name="refresh" onClick={onRegenerate} disabled={!onRegenerate} />
                <IconBtn name="export" content={msg.content} />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function IconBtn({ name, onClick, disabled, content }) {
  function handleClick() {
    if (name === 'copy' && content) {
      navigator.clipboard.writeText(content)
    } else if (name === 'export' && content) {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-${Date.now()}.md`
      a.click()
      URL.revokeObjectURL(url)
    } else if (onClick) {
      onClick()
    }
  }
  return (
    <button onClick={handleClick} disabled={disabled} className="rounded p-1 text-cream-500 transition-colors hover:bg-ink-750 hover:text-brass-200 disabled:opacity-30">
      <Icon name={name} size={13} />
    </button>
  )
}

function TemplatesPanel({ onPick }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Icon name="layers" size={15} className="text-brass-300" />
        <h3 className="font-serif text-base text-cream-50">场景化模板</h3>
      </div>
      <p className="mb-4 text-xs text-cream-500">填写关键信息，一键生成对应格式内容。</p>
      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="group flex w-full items-center gap-3 rounded-xl border border-ink-700/70 bg-ink-850/50 p-3 text-left transition-all hover:border-brass-500/40 hover:bg-ink-800/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-brass-300">
              <Icon name={t.icon} size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-cream-50">{t.name}</div>
              <div className="truncate text-[11px] text-cream-500">{t.hint}</div>
            </div>
            <Icon name="chevronR" size={14} className="text-cream-600 transition-transform group-hover:translate-x-0.5 group-hover:text-brass-300" />
          </button>
        ))}
      </div>
    </div>
  )
}

function DocPanel({ onAction }) {
  const [file, setFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setParsing(true)
    setError('')
    try {
      const text = await readFileContent(f)
      setContent(text)
    } catch (err) {
      setError(err.message)
      setContent('')
    }
    setParsing(false)
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Icon name="doc" size={15} className="text-brass-300" />
        <h3 className="font-serif text-base text-cream-50">长文档处理</h3>
      </div>
      <p className="mb-4 text-xs text-cream-500">前端纯解析，文件不上传服务器。</p>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-ink-700 bg-ink-900/40 px-4 py-8 text-center transition-colors hover:border-brass-500/40">
        <Icon name="upload" size={22} className="text-brass-300" />
        <div className="mt-2 text-sm text-cream-100">导入文档</div>
        <div className="mt-0.5 text-[11px] text-cream-500">TXT · Markdown · PDF · Word</div>
        <input type="file" className="hidden" onChange={handleFile} accept=".txt,.md,.pdf,.docx" />
      </label>

      {parsing && (
        <div className="mt-4 rounded-xl border border-ink-700/70 bg-ink-850/60 p-4 text-center text-sm text-cream-400">
          解析中…
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-rust/30 bg-rust/10 p-3">
          <div className="flex items-center gap-2 text-sm text-rust">
            <Icon name="close" size={14} /> {error}
          </div>
        </div>
      )}

      {content && !parsing && (
        <div className="mt-4 rounded-xl border border-ink-700/70 bg-ink-850/60 p-3">
          <div className="flex items-center gap-2">
            <Icon name="file" size={15} className="text-brass-300" />
            <span className="flex-1 truncate text-sm text-cream-100">{file?.name}</span>
            <Badge tone="phosphor">已解析</Badge>
          </div>
          <div className="mt-2 font-mono text-[10px] text-cream-500">
            {countChars(content).toLocaleString()} 字 · ≈{estimateTokens(content).toLocaleString()} tokens
          </div>
          <div className="mt-3 max-h-32 overflow-y-auto rounded-lg border border-ink-700/60 bg-ink-950/50 p-2.5 text-[12px] leading-relaxed text-cream-300">
            {content.slice(0, 800)}{content.length > 800 ? '…' : ''}
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { label: '摘要提取', prompt: '请对以下文档内容进行摘要提取，提炼核心观点和关键信息：\n\n' },
              { label: '大纲生成', prompt: '请根据以下文档内容生成结构化大纲：\n\n' },
              { label: '全文翻译', prompt: '请将以下文档内容翻译为英文：\n\n' },
              { label: '局部改写', prompt: '请对以下文档内容进行改写，保持原意但优化表达：\n\n' },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => onAction?.(a.prompt + content.slice(0, 4000))}
                className="flex w-full items-center justify-between rounded-lg border border-ink-700/60 bg-ink-900/40 px-3 py-2 text-xs text-cream-200 transition-colors hover:border-brass-500/40 hover:text-brass-200"
              >
                {a.label} <Icon name="chevronR" size={12} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
