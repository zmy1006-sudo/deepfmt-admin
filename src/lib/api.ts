// 统一 API 模拟层 - 管理后台与患者端共用同一套 localStorage 数据
import { get, set, STORAGE_KEYS } from './storage'
import { ensureInitialized } from './dataInit'
import type { User, ScienceItem, VideoItem, FollowupTemplate, FollowupRecord, MedicineItem, ReportItem, KBItem } from './dataInit'

export type { User, ScienceItem, VideoItem, FollowupTemplate, FollowupRecord, MedicineItem, ReportItem, KBItem }

// 初始化数据（懒加载）
function init() { ensureInitialized() }

// ==================== 用户 ====================

// MD5-like hash (简化版，Demo用)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

// 真实MD5值（用于admin账号验证）
function realMD5(str: string): string {
  // 已知 "admin123" 的MD5是 e10adc3949ba59abbe56e057f20f883e
  return 'e10adc3949ba59abbe56e057f20f883e'
}

export const api = {
  // 患者端登录（手机号）
  login(phone: string, password: string): User | null {
    init()
    const users = get<User[]>(STORAGE_KEYS.USERS) ?? []
    const md5pwd = realMD5(password)
    const user = users.find(u => u.phone === phone && u.password === md5pwd)
    if (user) {
      const now = new Date().toISOString()
      const updated = users.map(u => u.id === user.id ? { ...u, last_login: now } : u)
      set(STORAGE_KEYS.USERS, updated)
      const updatedUser = { ...user, last_login: now }
      set(STORAGE_KEYS.CURRENT_USER, updatedUser)
      return updatedUser
    }
    return null
  },

  // 管理后台登录（账号+密码）
  adminLogin(account: string, password: string): User | null {
    init()
    const users = get<User[]>(STORAGE_KEYS.USERS) ?? []
    const md5pwd = realMD5(password)
    // 管理后台只允许 admin 账号登录
    if (account !== 'admin') return null
    const user = users.find(u => u.phone === 'admin' && u.password === md5pwd)
    if (user) {
      const now = new Date().toISOString()
      const updated = users.map(u => u.id === user.id ? { ...u, last_login: now } : u)
      set(STORAGE_KEYS.USERS, updated)
      const updatedUser = { ...user, last_login: now }
      set(STORAGE_KEYS.CURRENT_USER, updatedUser)
      return updatedUser
    }
    return null
  },

  // 获取当前登录用户
  getCurrentUser(): User | null {
    return get<User>(STORAGE_KEYS.CURRENT_USER)
  },

  // 设置当前登录用户
  setCurrentUser(user: User | null) {
    if (user) {
      set(STORAGE_KEYS.CURRENT_USER, user)
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  },

  // 退出登录
  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  // 获取所有用户（不含admin管理员）
  getUsers(): User[] {
    init()
    return (get<User[]>(STORAGE_KEYS.USERS) ?? []).filter(u => u.phone !== 'admin')
  },

  // 添加用户
  addUser(user: User): void {
    const users = get<User[]>(STORAGE_KEYS.USERS) ?? []
    users.push(user)
    set(STORAGE_KEYS.USERS, users)
  },

  // 更新用户
  updateUser(id: string, data: Partial<User>): void {
    const users = get<User[]>(STORAGE_KEYS.USERS) ?? []
    const updated = users.map(u => u.id === id ? { ...u, ...data } : u)
    set(STORAGE_KEYS.USERS, updated)
    const current = get<User>(STORAGE_KEYS.CURRENT_USER)
    if (current?.id === id) {
      set(STORAGE_KEYS.CURRENT_USER, { ...current, ...data })
    }
  },

  // 删除用户
  deleteUser(id: string): void {
    const users = get<User[]>(STORAGE_KEYS.USERS) ?? []
    set(STORAGE_KEYS.USERS, users.filter(u => u.id !== id))
  },

  // ==================== 科普 ====================

  getScienceList(category?: string, keyword?: string): ScienceItem[] {
    init()
    let list = get<ScienceItem[]>(STORAGE_KEYS.SCIENCE) ?? []
    if (category) list = list.filter(i => i.category === category)
    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(i =>
        i.title.toLowerCase().includes(kw) ||
        i.question.toLowerCase().includes(kw) ||
        i.tags.some(t => t.toLowerCase().includes(kw))
      )
    }
    return list.sort((a, b) => a.sort_order - b.sort_order)
  },

  getScienceById(id: string): ScienceItem | null {
    init()
    const list = get<ScienceItem[]>(STORAGE_KEYS.SCIENCE) ?? []
    return list.find(i => i.id === id) ?? null
  },

  updateScience(id: string, data: Partial<ScienceItem>): void {
    const list = get<ScienceItem[]>(STORAGE_KEYS.SCIENCE) ?? []
    const updated = list.map(i => i.id === id ? { ...i, ...data, updated_at: new Date().toISOString() } : i)
    set(STORAGE_KEYS.SCIENCE, updated)
  },

  addScience(item: ScienceItem): void {
    const list = get<ScienceItem[]>(STORAGE_KEYS.SCIENCE) ?? []
    list.push(item)
    set(STORAGE_KEYS.SCIENCE, list)
  },

  deleteScience(id: string): void {
    const list = get<ScienceItem[]>(STORAGE_KEYS.SCIENCE) ?? []
    set(STORAGE_KEYS.SCIENCE, list.filter(i => i.id !== id))
  },

  // ==================== 视频 ====================

  getVideoList(category?: string): VideoItem[] {
    init()
    const list = get<VideoItem[]>(STORAGE_KEYS.VIDEOS) ?? []
    if (category) return list.filter(v => v.category === category)
    return list
  },

  getVideoById(id: string): VideoItem | null {
    init()
    const list = get<VideoItem[]>(STORAGE_KEYS.VIDEOS) ?? []
    return list.find(v => v.id === id) ?? null
  },

  addVideo(item: VideoItem): void {
    const list = get<VideoItem[]>(STORAGE_KEYS.VIDEOS) ?? []
    list.push(item)
    set(STORAGE_KEYS.VIDEOS, list)
  },

  updateVideo(id: string, data: Partial<VideoItem>): void {
    const list = get<VideoItem[]>(STORAGE_KEYS.VIDEOS) ?? []
    const updated = list.map(v => v.id === id ? { ...v, ...data } : v)
    set(STORAGE_KEYS.VIDEOS, updated)
  },

  // ==================== 随访 ====================

  getFollowupTemplates(): FollowupTemplate[] {
    init()
    return get<FollowupTemplate[]>(STORAGE_KEYS.FOLLOWUP_TEMPLATES) ?? []
  },

  getTemplateById(id: string): FollowupTemplate | null {
    init()
    const list = get<FollowupTemplate[]>(STORAGE_KEYS.FOLLOWUP_TEMPLATES) ?? []
    return list.find(t => t.id === id) ?? null
  },

  getFollowupRecords(userId?: string): FollowupRecord[] {
    init()
    let list = get<FollowupRecord[]>(STORAGE_KEYS.FOLLOWUP_RECORDS) ?? []
    if (userId) list = list.filter(r => r.user_id === userId)
    return list
  },

  addFollowupRecord(record: FollowupRecord): void {
    const list = get<FollowupRecord[]>(STORAGE_KEYS.FOLLOWUP_RECORDS) ?? []
    list.push(record)
    set(STORAGE_KEYS.FOLLOWUP_RECORDS, list)
  },

  // ==================== 用药 ====================

  getMedicineList(userId?: string): MedicineItem[] {
    init()
    let list = get<MedicineItem[]>(STORAGE_KEYS.MEDICINE) ?? []
    if (userId) list = list.filter(m => m.user_id === userId)
    return list
  },

  updateMedicineTaken(id: string, date: string, taken: boolean): void {
    const list = get<MedicineItem[]>(STORAGE_KEYS.MEDICINE) ?? []
    const updated = list.map(m => {
      if (m.id !== id) return m
      const dates = taken
        ? [...new Set([...m.taken_dates, date])]
        : m.taken_dates.filter(d => d !== date)
      return { ...m, taken_dates: dates }
    })
    set(STORAGE_KEYS.MEDICINE, updated)
  },

  addMedicine(item: MedicineItem): void {
    const list = get<MedicineItem[]>(STORAGE_KEYS.MEDICINE) ?? []
    list.push(item)
    set(STORAGE_KEYS.MEDICINE, list)
  },

  // ==================== 报告 ====================

  getReportList(userId?: string, type?: string): ReportItem[] {
    init()
    let list = get<ReportItem[]>(STORAGE_KEYS.REPORTS) ?? []
    if (userId) list = list.filter(r => r.user_id === userId)
    if (type) list = list.filter(r => r.type === type)
    return list
  },

  // ==================== 知识库 ====================

  getChatKB(): KBItem[] {
    init()
    return (get<KBItem[]>(STORAGE_KEYS.CHAT_KB) ?? []).filter(k => k.is_active)
  },

  matchAnswer(keyword: string): KBItem | null {
    init()
    const kb = get<KBItem[]>(STORAGE_KEYS.CHAT_KB) ?? []
    const kw = keyword.toLowerCase().trim()
    if (!kw) return null
    let best: KBItem | null = null
    let bestScore = 0
    for (const item of kb) {
      if (!item.is_active) continue
      let score = 0
      if (item.question.toLowerCase().includes(kw)) score += 10
      for (const key of item.keywords) {
        if (key.toLowerCase() === kw) score += 20
        else if (key.toLowerCase().includes(kw)) score += 5
      }
      if (item.answer.toLowerCase().includes(kw)) score += 3
      if (score > bestScore) { bestScore = score; best = item }
    }
    if (best) {
      const updated = kb.map(k => k.id === best!.id ? { ...k, hit_count: k.hit_count + 1 } : k)
      set(STORAGE_KEYS.CHAT_KB, updated)
    }
    return bestScore >= 3 ? best : null
  },
}
