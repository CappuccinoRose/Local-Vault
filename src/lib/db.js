/**
 * IndexedDB persistent storage for Local Vault AI.
 * All user creation data is stored locally.
 */

const DB_NAME = 'local-vault-db'
const DB_VERSION = 1
const STORES = {
  history: 'history',      // 创作历史记录
  settings: 'settings',    // 用户设置
  chatSessions: 'chatSessions', // 对话会话
  imageGallery: 'imageGallery', // 图片画廊元数据
  codeSessions: 'codeSessions', // 代码会话
  workspaces: 'workspaces',     // 工作空间数据
}

let dbInstance = null

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      for (const name of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('workspaceId', 'workspaceId', { unique: false })
          store.createIndex('pinned', 'pinned', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    }
    req.onsuccess = () => { dbInstance = req.result; resolve(dbInstance) }
    req.onerror = () => reject(req.error)
  })
}

async function getAll(storeName) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

async function put(storeName, item) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const req = store.put(item)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function remove(storeName, id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function get(storeName, id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function clear(storeName) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// history helpers
export async function getHistory(workspaceId) {
  const all = await getAll(STORES.history)
  if (workspaceId) return all.filter(h => h.workspaceId === workspaceId)
  return all.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.createdAt || 0) - (a.createdAt || 0))
}

export async function addHistory(item) {
  const record = {
    ...item,
    id: item.id || `h-${Date.now()}`,
    createdAt: item.createdAt || Date.now(),
    pinned: item.pinned || false,
  }
  await put(STORES.history, record)
  return record
}

export async function togglePinHistory(id) {
  const item = await get(STORES.history, id)
  if (item) {
    item.pinned = !item.pinned
    await put(STORES.history, item)
  }
  return item
}

export async function removeHistory(id) {
  await remove(STORES.history, id)
}

// chat sessions
export async function saveChatSession(session) {
  const record = {
    ...session,
    id: session.id || `chat-${Date.now()}`,
    updatedAt: Date.now(),
  }
  await put(STORES.chatSessions, record)
  return record
}

export async function getChatSessions(workspaceId) {
  const all = await getAll(STORES.chatSessions)
  if (workspaceId) return all.filter(s => s.workspaceId === workspaceId)
  return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export async function getChatSession(id) {
  return get(STORES.chatSessions, id)
}

export async function deleteChatSession(id) {
  await remove(STORES.chatSessions, id)
  // also remove from history
  await remove(STORES.history, id)
}

// image gallery
export async function saveImageMeta(meta) {
  const record = {
    ...meta,
    id: meta.id || `img-${Date.now()}`,
    createdAt: Date.now(),
  }
  await put(STORES.imageGallery, record)
  return record
}

export async function getImageGallery() {
  const all = await getAll(STORES.imageGallery)
  return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export async function removeImageMeta(id) {
  await remove(STORES.imageGallery, id)
}

// code sessions
export async function saveCodeSession(session) {
  const record = {
    ...session,
    id: session.id || `code-${Date.now()}`,
    updatedAt: Date.now(),
  }
  await put(STORES.codeSessions, record)
  return record
}

export async function getCodeSessions() {
  const all = await getAll(STORES.codeSessions)
  return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

// settings
export async function saveSetting(key, value) {
  await put(STORES.settings, { id: key, value })
}

export async function getSetting(key) {
  const item = await get(STORES.settings, key)
  return item?.value ?? null
}

export async function getAllSettings() {
  const all = await getAll(STORES.settings)
  const obj = {}
  for (const item of all) {
    obj[item.id] = item.value
  }
  return obj
}

// export/import helpers for backup
export async function exportAllData() {
  const data = {}
  for (const name of Object.values(STORES)) {
    data[name] = await getAll(name)
  }
  return data
}

export async function importAllData(data) {
  for (const [name, items] of Object.entries(data)) {
    if (Object.values(STORES).includes(name) && Array.isArray(items)) {
      for (const item of items) {
        await put(name, item)
      }
    }
  }
}

export async function clearAllData() {
  for (const name of Object.values(STORES)) {
    await clear(name)
  }
}

export { STORES }
