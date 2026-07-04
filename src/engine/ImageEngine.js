import { pipeline, env } from '@huggingface/transformers'

env.allowLocalModels = false
env.useBrowserCache = true

const MODEL_MAP = {
  'stable-diffusion-xl-turbo': {
    id: 'Xenova/sdxl-turbo',
    label: 'SDXL Turbo',
  },
  'sdxl-base-1.0': {
    id: 'Xenova/stable-diffusion-xl-base-1.0',
    label: 'SDXL Base 1.0',
  },
}

let pipe = null
let currentModelId = null
let abortGenerate = false

export function isImageEngineLoaded() {
  return pipe !== null
}

export function getImageModelId() {
  return currentModelId
}

export async function loadImageModel(modelId, onProgress) {
  if (pipe && currentModelId === modelId) {
    return pipe
  }

  pipe = null
  currentModelId = null

  const hfId = MODEL_MAP[modelId]?.id || modelId

  pipe = await pipeline('text-to-image', hfId, {
    quantized: true,
    progress_callback: (p) => {
      onProgress?.({
        progress: p.progress ?? 0,
        text: p.status || `加载中…`,
        loaded: p.status === 'done',
      })
    },
    device: 'webgpu',
  })

  currentModelId = modelId
  return pipe
}

export async function unloadImageModel() {
  pipe = null
  currentModelId = null
}

export function stopImageGeneration() {
  abortGenerate = true
}

export async function generateImage({
  prompt,
  negativePrompt = '',
  numInferenceSteps = 20,
  guidanceScale = 7,
  seed = null,
  width = 512,
  height = 512,
  onProgress,
}) {
  if (!pipe) {
    throw new Error('Image engine not loaded')
  }

  abortGenerate = false

  const result = await pipe(prompt, {
    negative_prompt: negativePrompt,
    num_inference_steps: numInferenceSteps,
    guidance_scale: guidanceScale,
    width,
    height,
    seed: seed ?? undefined,
    callback: (step, _timestep, _tensor) => {
      if (abortGenerate) return false
      onProgress?.({ step, total: numInferenceSteps })
    },
  })

  if (abortGenerate) return null

  return result
}

export async function generateImagePlaceholder({ prompt: _prompt, seed }) {
  const colorSeed = (seed ?? Math.floor(Math.random() * 99999)) % 360
  const c1 = `hsl(${colorSeed}, 45%, 22%)`
  const c2 = `hsl(${(colorSeed + 40) % 360}, 50%, 14%)`
  const c3 = `hsl(${(colorSeed + 200) % 360}, 55%, 30%)`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <defs>
      <radialGradient id="g1" cx="30%" cy="25%" r="55%"><stop offset="0%" stop-color="${c3}"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      <radialGradient id="g2" cx="75%" cy="70%" r="60%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c2}"/><stop offset="100%" stop-color="#0e0d0b"/></linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg)"/>
    <rect width="512" height="512" fill="url(#g1)"/>
    <rect width="512" height="512" fill="url(#g2)"/>
  </svg>`

  return svgToBlob(svg)
}

function svgToBlob(svg) {
  return new Promise((resolve) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((b) => resolve(URL.createObjectURL(b)), 'image/png')
      URL.revokeObjectURL(url)
    }
    img.onerror = () => resolve(url)
    img.src = url
  })
}
