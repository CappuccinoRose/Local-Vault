/**
 * Real hardware detection using WebGPU and browser APIs.
 * Falls back to reasonable defaults when APIs are unavailable.
 */

let _detected = null

export async function detectHardware() {
  if (_detected) return _detected

  const gpu = await detectGPU()
  const vram = await detectVRAM(gpu)
  const cpu = detectCPU()
  const ram = await detectRAM()
  const webgpu = !!gpu

  _detected = {
    gpu: gpu?.name || '未知 GPU',
    vramTotal: vram,
    vramRecommended: vram,
    ram,
    cpu,
    webgpu,
    adapter: gpu ? `WebGPU 1.0 · ${gpu.architecture || 'Unknown'}` : 'WebGPU 不可用',
    computeTier: vram >= 4096 ? 'recommended' : vram >= 2048 ? 'minimum' : 'insufficient',
  }

  return _detected
}

async function detectGPU() {
  try {
    if (!navigator.gpu) return null
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) return null
    const info = await adapter.requestAdapterInfo()
    return info
  } catch {
    return null
  }
}

async function detectVRAM(gpu) {
  // WebGPU does not expose VRAM directly. Use heuristic based on adapter name.
  // Also check deviceMemory API if available.
  const deviceMemory = navigator.deviceMemory // Chrome only, returns RAM in GB

  if (gpu?.name) {
    const name = gpu.name.toLowerCase()
    // Common VRAM sizes for known GPUs
    if (name.includes('rtx 4090')) return 24576
    if (name.includes('rtx 4080')) return 16384
    if (name.includes('rtx 4070')) return 12288
    if (name.includes('rtx 4060')) return 8192
    if (name.includes('rtx 4050')) return 6144
    if (name.includes('rtx 3090')) return 24576
    if (name.includes('rtx 3080')) return 10240
    if (name.includes('rtx 3070')) return 8192
    if (name.includes('rtx 3060')) return 12288
    if (name.includes('rtx 3050')) return 8192
    if (name.includes('rx 7900')) return 24576
    if (name.includes('rx 7800')) return 16384
    if (name.includes('rx 7700')) return 12288
    if (name.includes('rx 7600')) return 8192
    if (name.includes('arc a770')) return 16384
    if (name.includes('arc a750')) return 8192
    if (name.includes('m1') || name.includes('m2') || name.includes('m3') || name.includes('m4')) {
      if (name.includes('max') || name.includes('pro')) return 16384
      if (name.includes('ultra')) return 24576
      return 8192
    }
  }

  // Fallback: estimate from deviceMemory (RAM)
  if (deviceMemory) {
    // Assume GPU has roughly 1/4 to 1/2 of system RAM for integrated, or use a reasonable default
    return Math.round((deviceMemory * 1024) * 0.5) // 50% of RAM as estimate
  }

  // Ultimate fallback
  return 4096
}

function detectCPU() {
  // navigator.userAgent doesn't reliably give CPU info
  // Use a reasonable default based on platform
  const ua = navigator.userAgent
  const platform = navigator.platform || ''

  if (platform.startsWith('Win')) {
    // Windows - cannot detect CPU model from browser
    return 'x86_64 处理器'
  }
  if (platform.startsWith('Mac')) {
    if (ua.includes('Apple')) return 'Apple Silicon'
    return 'Intel 处理器'
  }
  if (platform.startsWith('Linux')) {
    return 'x86_64 处理器'
  }
  return '未知处理器'
}

async function detectRAM() {
  // navigator.deviceMemory returns RAM in GB (Chrome only, rounded down)
  if (navigator.deviceMemory) return navigator.deviceMemory
  // Fallback
  return 16
}
