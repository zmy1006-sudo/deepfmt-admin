import { useState, useEffect } from 'react'
import { Table, Tag, Typography, Select, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { api, FollowupRecord } from '../lib/api'

const { Title } = Typography
const { Option } = Select

const FollowUp = () => {
  const [records, setRecords] = useState<FollowupRecord[]>([])
  const [users, setUsers] = useState<{id: string; name: string}[]>([])
  const [templates, setTemplates] = useState<{id: string; name: string}[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const r = api.getFollowupRecords()
    const u = api.getUsers()
    const t = api.getFollowupTemplates()
    setRecords(r)
    setUsers(u.map(uu => ({ id: uu.id, name: uu.name })))
    setTemplates(t.map(tt => ({ id: tt.id, name: tt.name })))
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 20) return 'green'
    if (score >= 15) return 'blue'
    return 'orange'
  }

  const statusColor: Record<string, string> = { '已查看': 'green', '已提交': 'cyan', '待填写': 'orange' }

  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter)

  const columns: ColumnsType<FollowupRecord> = [
    { title: '患者', dataIndex: 'user_id', key: 'user_id', render: (uid: string) => users.find(u => u.id === uid)?.name || uid },
    { title: '问卷模板', dataIndex: 'template_id', key: 'template_id', render: (tid: string) => templates.find(t => t.id === tid)?.name || tid },
    { title: '治疗次数', dataIndex: 'treatment_count', key: 'treatment_count' },
    { title: '改善评分', dataIndex: 'total_score', key: 'total_score', sorter: (a, b) => a.total_score - b.total_score, render: (s: number) => <Tag color={getScoreColor(s)}>{s}分</Tag> },
    { title: '提交时间', dataIndex: 'submitted_at', key: 'submitted_at', render: (d: string) => d ? new Date(d).toLocaleDateString('zh-CN') : '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag> },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>随访管理</Title>
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
          <Option value="all">全部状态</Option>
          <Option value="已提交">已提交</Option>
          <Option value="已查看">已查看</Option>
          <Option value="待填写">待填写</Option>
        </Select>
      </Space>
      <Table columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} rowKey="id" />
    </div>
  )
}

export default FollowUp
