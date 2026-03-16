// 共享数据存储工具 - 用于管理后台和患者端数据同步
// 使用localStorage模拟数据同步

const STORAGE_KEYS = {
  PATIENTS: 'deepfmt_patients',
  CONTENTS: 'deepfmt_contents',
  CURRENT_PATIENT: 'deepfmt_current_patient'
}

// 患者数据类型
export interface Patient {
  key: string
  id: string
  name: string
  age: number
  gender: string
  phone: string
  status: string
  admissionDate: string
  disease?: string
  treatmentCount?: number
  improvement?: number
}

// 科普内容数据类型
export interface ContentItem {
  key: string
  id: string
  title: string
  category: string
  author: string
  content: string
  publishDate: string
  status: string
  views: number
}

// 默认患者数据
const defaultPatients: Patient[] = [
  { key: '1', id: 'P001', name: '张三', age: 45, gender: '男', phone: '13800138001', status: '治疗中', admissionDate: '2024-01-10', disease: '便秘型肠易激', treatmentCount: 3, improvement: 85 },
  { key: '2', id: 'P002', name: '李四', age: 38, gender: '女', phone: '13800138002', status: '已完成', admissionDate: '2024-01-08', disease: '溃疡性结肠炎', treatmentCount: 2, improvement: 70 },
  { key: '3', id: 'P003', name: '王五', age: 52, gender: '男', phone: '13800138003', status: '随访中', admissionDate: '2024-01-05', disease: '复发性CDI', treatmentCount: 4, improvement: 90 },
  { key: '4', id: 'P004', name: '赵六', age: 41, gender: '女', phone: '13800138004', status: '治疗中', admissionDate: '2024-01-03', disease: '肠易激综合征', treatmentCount: 1, improvement: 50 },
  { key: '5', id: 'P005', name: '钱七', age: 35, gender: '男', phone: '13800138005', status: '已完成', admissionDate: '2024-01-01', disease: '功能性便秘', treatmentCount: 3, improvement: 80 },
]

// 默认科普内容数据
const defaultContents: ContentItem[] = [
  { key: '1', id: 'C001', title: '肠道菌群与健康', category: '科普知识', author: '张医生', content: '肠道菌群是人体最重要的微生物群落之一，对人体健康有着深远的影响...', publishDate: '2024-01-15', status: '已发布', views: 1250 },
  { key: '2', id: 'C002', title: 'FMT治疗原理', category: '治疗科普', author: '李医生', content: '粪菌移植(Fecal Microbiota Transplantation, FMT)是将健康人粪便中的功能菌群移植到患者肠道内...', publishDate: '2024-01-14', status: '已发布', views: 980 },
  { key: '3', id: 'C003', title: '术后饮食指南', category: '护理知识', author: '王护士', content: 'FMT术后饮食调理对于恢复非常重要，建议循序渐进...', publishDate: '2024-01-13', status: '草稿', views: 0 },
  { key: '4', id: 'C004', title: '肠道健康自测', category: '科普知识', author: '张医生', content: '通过以下方法可以初步评估肠道健康状况...', publishDate: '2024-01-12', status: '已发布', views: 756 },
  { key: '5', id: 'C005', title: '常见问题解答', category: 'FAQ', author: '李医生', content: '解答关于FMT治疗的常见问题...', publishDate: '2024-01-11', status: '已发布', views: 2100 },
]

// 初始化存储数据
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(defaultPatients))
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTENTS)) {
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(defaultContents))
  }
}

// 获取患者列表
export function getPatients(): Patient[] {
  initStorage()
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS)
  return data ? JSON.parse(data) : defaultPatients
}

// 保存患者列表
export function savePatients(patients: Patient[]) {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
}

// 添加患者
export function addPatient(patient: Omit<Patient, 'key' | 'id'>): Patient {
  const patients = getPatients()
  const newId = `P${String(patients.length + 1).padStart(3, '0')}`
  const newPatient: Patient = {
    ...patient,
    key: String(patients.length + 1),
    id: newId
  }
  patients.push(newPatient)
  savePatients(patients)
  return newPatient
}

// 更新患者
export function updatePatient(key: string, updates: Partial<Patient>) {
  const patients = getPatients()
  const index = patients.findIndex(p => p.key === key)
  if (index !== -1) {
    patients[index] = { ...patients[index], ...updates }
    savePatients(patients)
  }
  return patients[index]
}

// 删除患者
export function deletePatient(key: string) {
  const patients = getPatients()
  const filtered = patients.filter(p => p.key !== key)
  savePatients(filtered)
}

// 获取科普内容列表
export function getContents(): ContentItem[] {
  initStorage()
  const data = localStorage.getItem(STORAGE_KEYS.CONTENTS)
  return data ? JSON.parse(data) : defaultContents
}

// 保存科普内容列表
export function saveContents(contents: ContentItem[]) {
  localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(contents))
}

// 添加科普内容
export function addContent(content: Omit<ContentItem, 'key' | 'id' | 'publishDate' | 'views'>): ContentItem {
  const contents = getContents()
  const newId = `C${String(contents.length + 1).padStart(3, '0')}`
  const today = new Date().toISOString().split('T')[0]
  const newContent: ContentItem = {
    ...content,
    key: String(contents.length + 1),
    id: newId,
    publishDate: today,
    views: 0
  }
  contents.push(newContent)
  saveContents(contents)
  return newContent
}

// 更新科普内容
export function updateContent(key: string, updates: Partial<ContentItem>) {
  const contents = getContents()
  const index = contents.findIndex(c => c.key === key)
  if (index !== -1) {
    contents[index] = { ...contents[index], ...updates }
    saveContents(contents)
  }
  return contents[index]
}

// 删除科普内容
export function deleteContent(key: string) {
  const contents = getContents()
  const filtered = contents.filter(c => c.key !== key)
  saveContents(filtered)
}

// 获取当前登录患者（患者端用）
export function getCurrentPatient(): Patient | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT)
  return data ? JSON.parse(data) : null
}

// 设置当前登录患者
export function setCurrentPatient(patient: Patient) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, JSON.stringify(patient))
}

// 获取发布的科普内容（患者端显示已发布的）
export function getPublishedContents(): ContentItem[] {
  const contents = getContents()
  return contents.filter(c => c.status === '已发布')
}
