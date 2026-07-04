import { CreateMLCEngine } from '@mlc-ai/web-llm'

const MODEL_MAP = {
  'qwen2.5-7b-instruct-q4': {
    id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    label: 'Qwen2.5-7B Instruct',
  },
  'qwen2.5-14b-instruct-q4': {
    id: 'Qwen2.5-14B-Instruct-q4f16_1-MLC',
    label: 'Qwen2.5-14B Instruct',
  },
  'phi-3.5-mini-q4': {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    label: 'Phi-3.5 Mini',
  },
  'deepseek-coder-7b-q4': {
    id: 'DeepSeek-Coder-V2-Lite-Instruct-q4f16_1-MLC',
    label: 'DeepSeek-Coder-V2-Lite',
  },
}

export function getMLCId(modelId) {
  return MODEL_MAP[modelId]?.id || modelId
}

export function getLabel(modelId) {
  return MODEL_MAP[modelId]?.label || modelId
}

let engine = null
let currentModelId = null
let abortController = null

export function isEngineLoaded() {
  return engine !== null
}

export function getLoadedModelId() {
  return currentModelId
}

export async function loadModel(modelId, onProgress) {
  const mlcId = getMLCId(modelId)

  if (engine && currentModelId === modelId) {
    return engine
  }

  if (engine) {
    engine.unload()
    engine = null
    currentModelId = null
  }

  engine = await CreateMLCEngine(mlcId, {
    initProgressCallback: (progress) => {
      const pct = Math.round(progress.progress * 100)
      onProgress?.({
        progress: progress.progress,
        text: progress.text || `加载中 ${pct}%`,
        loaded: pct >= 100,
      })
    },
  })

  currentModelId = modelId
  return engine
}

export async function unloadModel() {
  if (engine) {
    engine.unload()
    engine = null
    currentModelId = null
  }
}

export async function generateText({
  messages,
  onStream,
  maxTokens = 2048,
  temperature = 0.7,
  topP = 0.9,
}) {
  if (!engine) {
    throw new Error('Engine not loaded')
  }

  abortController = new AbortController()

  const formatted = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  let fullContent = ''
  const chunks = await engine.chat.completions.create({
    messages: formatted,
    temperature,
    top_p: topP,
    max_tokens: maxTokens,
    stream: true,
    ...(abortController.signal ? { signal: abortController.signal } : {}),
  })

  try {
    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) {
        fullContent += delta
        onStream?.(fullContent)
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return fullContent
    }
    throw err
  }

  return fullContent
}

export function stopGeneration() {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}
