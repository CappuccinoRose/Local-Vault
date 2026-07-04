import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HARDWARE_FALLBACK, LOCAL_MODELS, MARKET_MODELS } from './data.js'
import { t as translate } from './locales.js'
import { loadModel as engineLoad, unloadModel as engineUnload } from '../engine/TextEngine.js'
import { loadImageModel as imageEngineLoad, unloadImageModel as imageEngineUnload } from '../engine/ImageEngine.js'
import { detectHardware } from './hardware.js'
import { getHistory, addHistory, togglePinHistory as dbTogglePin, removeHistory as dbRemoveHistory, getAllSettings, saveSetting, getSetting } from './db.js'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [workspace, setWorkspace] = useState(() => localStorage.getItem('vault-workspace') || 'ws-personal')
  const [activeModelId, setActiveModelId] = useState(() => localStorage.getItem('vault-model') || 'qwen2.5-7b-instruct-q4')
  const [device, setDevice] = useState(() => localStorage.getItem('vault-device') || 'webgpu')
  const [vramCap, setVramCap] = useState(() => Number(localStorage.getItem('vault-vramCap')) || 85)
  const [localModels, setLocalModels] = useState(LOCAL_MODELS)
  const [outboundCount, setOutboundCount] = useState(0)
  const [privacyLock, setPrivacyLock] = useState(() => localStorage.getItem('vault-privacyLock') === 'true')
  const [installed, setInstalled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const installPromptRef = useRef(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('vault-theme') || 'dark')
  const [locale, setLocale] = useState(() => localStorage.getItem('vault-locale') || 'zh-CN')
  const [engineStatus, setEngineStatus] = useState('idle')
  const [engineProgress, setEngineProgress] = useState({ progress: 0, text: '' })
  const [imgEngineStatus, setImgEngineStatus] = useState('idle')
  const [imgEngineProgress, setImgEngineProgress] = useState({ progress: 0, text: '' })
  const [activeImageModelId, setActiveImageModelId] = useState(() => localStorage.getItem('vault-img-model') || 'stable-diffusion-xl-turbo')
  const [hardware, setHardware] = useState(HARDWARE_FALLBACK)
  const [historyItems, setHistoryItems] = useState([])
  const [encryptEnabled, setEncryptEnabled] = useState(() => localStorage.getItem('vault-encrypt') !== 'false')
  const [autoRelease, setAutoRelease] = useState(() => localStorage.getItem('vault-autoRelease') !== 'false')
  const [networkAudit, setNetworkAudit] = useState([])
  const outboundLogRef = useRef([])

  // Detect hardware on mount
  useEffect(() => {
    detectHardware().then((hw) => {
      setHardware(hw)
    })
  }, [])

  // Real outbound request monitoring via PerformanceObserver
  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return
    let count = 0
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const url = entry.name || ''
        // Skip localhost and OPFS (local) requests
        if (url.includes('localhost') || url.includes('blob:') || url.includes('opfs')) continue
        // Only count actual network requests (not chrome-extension, etc.)
        if (url.startsWith('http')) {
          count++
          setOutboundCount(count)
          outboundLogRef.current.push({
            time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            host: new URL(url).hostname,
            method: 'GET',
            status: 'ok',
            note: `${url.slice(0, 60)}…`,
          })
          setNetworkAudit(outboundLogRef.current.slice(-20)) // keep last 20
        }
      }
    })
    try {
      observer.observe({ type: 'resource', buffered: true })
    } catch {
      // Some browsers don't support 'resource' type
    }
    return () => observer.disconnect()
  }, [])

  // PWA install detection
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
    }
  }, [])

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      installPromptRef.current = e
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    function handler() {
      setInstalled(true)
      setInstallPrompt(null)
      installPromptRef.current = null
    }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  // Persist settings to localStorage
  useEffect(() => { localStorage.setItem('vault-workspace', workspace) }, [workspace])
  useEffect(() => { localStorage.setItem('vault-model', activeModelId) }, [activeModelId])
  useEffect(() => { localStorage.setItem('vault-device', device) }, [device])
  useEffect(() => { localStorage.setItem('vault-vramCap', String(vramCap)) }, [vramCap])
  useEffect(() => { localStorage.setItem('vault-privacyLock', String(privacyLock)) }, [privacyLock])
  useEffect(() => {
    localStorage.setItem('vault-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])
  useEffect(() => { localStorage.setItem('vault-locale', locale) }, [locale])
  useEffect(() => { localStorage.setItem('vault-img-model', activeImageModelId) }, [activeImageModelId])
  useEffect(() => { localStorage.setItem('vault-encrypt', String(encryptEnabled)) }, [encryptEnabled])
  useEffect(() => { localStorage.setItem('vault-autoRelease', String(autoRelease)) }, [autoRelease])

  // Load history from IndexedDB on mount
  useEffect(() => {
    getHistory(workspace).then((items) => {
      setHistoryItems(items)
    })
  }, [workspace])

  async function triggerInstall() {
    const prompt = installPromptRef.current
    if (!prompt) return
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') {
      setInstalled(true)
      setInstallPrompt(null)
      installPromptRef.current = null
    }
  }

  const loadEngineModel = useCallback(async (modelId) => {
    setEngineStatus('loading')
    setEngineProgress({ progress: 0, text: '初始化引擎…' })
    try {
      await engineLoad(modelId, (p) => { setEngineProgress(p) })
      setEngineStatus('ready')
      setActiveModelId(modelId)
    } catch (err) {
      setEngineStatus('error')
      setEngineProgress({ progress: 0, text: err.message })
    }
  }, [])

  const unloadEngineModel = useCallback(async () => {
    await engineUnload()
    setEngineStatus('idle')
    setEngineProgress({ progress: 0, text: '' })
  }, [])

  const loadImageEngineModel = useCallback(async (modelId) => {
    setImgEngineStatus('loading')
    setImgEngineProgress({ progress: 0, text: '初始化图像引擎…' })
    try {
      await imageEngineLoad(modelId, (p) => { setImgEngineProgress(p) })
      setImgEngineStatus('ready')
      setActiveImageModelId(modelId)
    } catch (err) {
      setImgEngineStatus('error')
      setImgEngineProgress({ progress: 0, text: err.message })
    }
  }, [])

  const unloadImageEngineModel = useCallback(async () => {
    await imageEngineUnload()
    setImgEngineStatus('idle')
    setImgEngineProgress({ progress: 0, text: '' })
  }, [])

  const activeModel = useMemo(
    () => MARKET_MODELS.find((m) => m.id === activeModelId),
    [activeModelId],
  )
  const activeImageModel = useMemo(
    () => MARKET_MODELS.find((m) => m.id === activeImageModelId),
    [activeImageModelId],
  )
  const vramUsed = (activeModel ? activeModel.vram : 0) + (activeImageModel && imgEngineStatus === 'ready' ? activeImageModel.vram : 0)
  const vramTotal = hardware.vramTotal

  // History operations
  const addHistoryItem = useCallback(async (item) => {
    const record = await addHistory({ ...item, workspaceId: workspace })
    setHistoryItems((prev) => [record, ...prev])
    return record
  }, [workspace])

  const togglePin = useCallback(async (id) => {
    const updated = await dbTogglePin(id)
    setHistoryItems((prev) => prev.map((h) => h.id === id ? { ...h, pinned: !h.pinned } : h))
  }, [])

  const removeHistoryItem = useCallback(async (id) => {
    await dbRemoveHistory(id)
    setHistoryItems((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const value = {
    workspace, setWorkspace,
    activeModelId, setActiveModelId,
    activeModel,
    device, setDevice,
    vramCap, setVramCap,
    localModels, setLocalModels,
    outboundCount,
    privacyLock, setPrivacyLock,
    installed, setInstalled,
    installPrompt, triggerInstall,
    theme, setTheme,
    locale, setLocale,
    t: (key, fallback) => translate(locale, key, fallback),
    hardware,
    vramUsed, vramTotal,
    engineStatus, engineProgress,
    loadEngineModel, unloadEngineModel,
    imgEngineStatus, imgEngineProgress,
    loadImageEngineModel, unloadImageEngineModel,
    activeImageModel, activeImageModelId,
    historyItems, setHistoryItems,
    addHistoryItem, togglePin, removeHistoryItem,
    encryptEnabled, setEncryptEnabled,
    autoRelease, setAutoRelease,
    networkAudit,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
