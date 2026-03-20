// localStorage 读写封装 - 支持 JSON 序列化
// 首次访问自动初始化所有数据表

export const STORAGE_KEYS = {
  USERS: 'deepfmt_users',
  SCIENCE: 'deepfmt_science',
  VIDEOS: 'deepfmt_videos',
  FOLLOWUP_TEMPLATES: 'deepfmt_followup_templates',
  FOLLOWUP_RECORDS: 'deepfmt_followup_records',
  MEDICINE: 'deepfmt_medicine',
  REPORTS: 'deepfmt_reports',
  CHAT_KB: 'deepfmt_chat_kb',
  CURRENT_USER: 'deepfmt_current_user',
  INIT_FLAG: 'deepfmt_initialized',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export function get<T>(key: StorageKey | string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage set error:', e)
  }
}

export function remove(key: string): void {
  localStorage.removeItem(key)
}

export function clear(): void {
  localStorage.clear()
}

export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INIT_FLAG) === 'true'
}

export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true')
}
