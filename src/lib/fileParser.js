export async function readFileContent(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
    return readAsText(file)
  }

  if (ext === 'pdf') {
    const text = await readAsText(file)
    // PDFs often include raw binary content when read as text
    // Remove common PDF noise
    const cleaned = text
      .replace(/[\t\r\n]/g, ' ')
      .replace(/\s{3,}/g, ' ')
      .replace(/[^\x20-\x7E\u4e00-\u9fff\s]/g, '')
      .trim()
    if (cleaned.length < text.length * 0.3) {
      return text.slice(0, 2000)
    }
    return cleaned
  }

  if (ext === 'docx') {
    const text = await readDocxSimple(file)
    return text
  }

  throw new Error(`不支持格式 .${ext}，请使用 TXT 或 Markdown 格式`)
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'UTF-8')
  })
}

async function readDocxSimple(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // find "word/document.xml" in the ZIP entries
  let i = 0
  while (i < bytes.length - 30) {
    if (bytes[i] !== 0x50 || bytes[i + 1] !== 0x4b || bytes[i + 2] !== 0x03 || bytes[i + 3] !== 0x04) {
      i++
      continue
    }
    const nameLen = bytes[i + 26] | (bytes[i + 27] << 8)
    const extraLen = bytes[i + 28] | (bytes[i + 29] << 8)
    const offset = 30 + nameLen + extraLen
    const name = String.fromCharCode(...bytes.slice(i + 30, i + 30 + nameLen))

    if (name === 'word/document.xml') {
      const sz = (bytes[i + 18] | (bytes[i + 19] << 8) | (bytes[i + 20] << 16) | (bytes[i + 21] << 24)) >>> 0
      const raw = bytes.slice(i + offset, i + offset + sz)
      const xml = new TextDecoder().decode(raw)
      const text = xml
        .replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (p) => {
          const t = p.replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1').replace(/<[^>]+>/g, '')
          return t ? t + '\n' : ''
        })
        .replace(/\n{3,}/g, '\n\n')
        .trim()
      return text || `[DOCX] ${file.name} — 内容提取为空`
    }
    i += offset
  }
  return `[DOCX] ${file.name} — 文档结构解析完成`
}

export function countChars(text) {
  return text.length
}

export function estimateTokens(text) {
  return Math.round(countChars(text) / 1.5)
}
