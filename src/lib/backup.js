import { exportAllData, importAllData, clearAllData, getHistory } from './db.js'

export function exportBackup(state) {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    workspace: state.workspace,
    data: {
      localModels: state.localModels,
      settings: {
        theme: state.theme,
        locale: state.locale,
        device: state.device,
        vramCap: state.vramCap,
        privacyLock: state.privacyLock,
        encryptEnabled: state.encryptEnabled,
        autoRelease: state.autoRelease,
      },
    },
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportFullBackup() {
  const allData = await exportAllData()
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: allData,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vault-full-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function validateBackup(json) {
  if (!json || (json.version !== 1 && json.version !== 2)) return '无效的备份文件：版本不兼容'
  if (!json.data) return '无效的备份文件：缺少数据内容'
  return null
}

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result)
        const err = validateBackup(json)
        if (err) return reject(new Error(err))
        resolve(json)
      } catch {
        reject(new Error('备份文件解析失败，请检查文件格式'))
      }
    }
    reader.onerror = () => reject(new Error('备份文件读取失败'))
    reader.readAsText(file)
  })
}

export async function restoreFullBackup(json) {
  if (json.data && !Array.isArray(json.data)) {
    await importAllData(json.data)
  }
}

export function restoreSettings(json) {
  return json.data.settings || {}
}
