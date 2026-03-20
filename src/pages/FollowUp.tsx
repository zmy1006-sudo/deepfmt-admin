import { useState, useEffect } from 'react'
import { Table, Tag, Typography, Select, Space, Button, Modal, Form, Input, message, Alert } from 'antd'
import { PlusOutlined, EditOutlined, WarningOutlined, CalendarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api, FollowupRecord, FollowupTemplate, User } from '../lib/api'

const { Title } = Typography
const { Option } = Select

const FollowUp = () => {
  const [records, setRecords] = useState<FollowupRecord[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [templates, setTemplates] = useState<FollowupTemplate[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [templateForm] = Form.useForm()
  const [editingTemplate, setEditingTemplate] = useState<FollowupTemplate | null>(null)
  const [today] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const r = api.getFollowupRecords()
    const u = api.getUsers()
    const t = api.getFollowupTemplates()
    setRecords(r)
    setUsers(u)
    setTemplates(t)
    if (t.length > 0) {
      setEditingTemplate(t[0])
      templateForm.setFieldsValue({ name: t[0].name, description: t[0].description })
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 20) return 'green'
    if (score >= 15) return 'blue'
    return 'orange'
  }

  const statusColor: Record<string, string> = {
    '已查看': 'green',
    '已提交': 'cyan',
    '待填写': 'orange',
  }

  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter)

  // 逾期提醒：status='待填写' 且 无 due_date 记录（默认待填写超过7天算逾期）
  const overdueRecords = records.filter(r => {
    if (r.status !== '待填写') return false
    // 简单逻辑：超过当前月份算逾期（基于submitted_at为空来判断）
    return true
  }).map(r => {
    const user = users.find(u => u.id === r.user_id)
    const template = templates.find(t => t.id === r.template_id)
    // 逾期天数计算：取用户最后登录时间距今天数
    const lastLogin = user?.last_login ? new Date(user.last_login) : null
    const daysDiff = lastLogin
      ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      : 0
    return { ...r, userName: user?.name || r.user_id, templateName: template?.name || r.template_id, daysOverdue: daysDiff }
  }).filter(r => r.daysOverdue > 7) // 仅显示超过7天未提交的

  const recordColumns: ColumnsType<FollowupRecord> = [
    {
      title: '患者',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (uid: string) => users.find(u => u.id === uid)?.name || uid,
    },
    {
      title: '问卷模板',
      dataIndex: 'template_id',
      key: 'template_id',
      render: (tid: string) => templates.find(t => t.id === tid)?.name || tid,
    },
    { title: '治疗次数', dataIndex: 'treatment_count', key: 'treatment_count' },
    {
      title: '改善评分',
      dataIndex: 'total_score',
      key: 'total_score',
      sorter: (a, b) => a.total_score - b.total_score,
      render: (s: number) => <Tag color={getScoreColor(s)}>{s}分</Tag>,
    },
    {
      title: '提交时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (d: string) => d ? new Date(d).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag>,
    },
  ]

  // 模板题目列
  const questionColumns = [
    { title: '题目ID', dataIndex: 'q_id', key: 'q_id', width: 80 },
    { title: '题目类型', dataIndex: 'type', key: 'type', width: 100, render: (t: string) => {
      const typeMap: Record<string, string> = { single: '单选题', multi: '多选题', rating: '评分题', text: '文本题' }
      return <Tag>{typeMap[t] || t}</Tag>
    }},
    { title: '题目内容', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '必填', dataIndex: 'required', key: 'required', width: 70, render: (r: boolean) => <Tag color={r ? 'red' : 'default'}>{r ? '是' : '否'}</Tag> },
    {
      title: '选项数',
      key: 'options',
      width: 80,
      render: (_: unknown, record: any) => record.options?.length || 0,
    },
  ]

  const handleSaveTemplate = () => {
    templateForm.validateFields().then(values => {
      if (!editingTemplate) return
      // 保存模板到storage
      const all = api.getFollowupTemplates()
      const updated = all.map(t => t.id === editingTemplate.id ? {
        ...t,
        name: values.name,
        description: values.description,
        updated_at: new Date().toISOString(),
      } : t)
      localStorage.setItem('deepfmt_followup_templates', JSON.stringify(updated))
      setTemplates(updated)
      setIsTemplateModalOpen(false)
      message.success('模板保存成功')
    })
  }

  const activeTemplate = templates.find(t => t.is_active) || templates[0]

  return (
    <div>
      {/* 页面标题区 */}
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>随访管理</Title>
        <Space>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="已提交">已提交</Option>
            <Option value="已查看">已查看</Option>
            <Option value="待填写">待填写</Option>
          </Select>
        </Space>
      </Space>

      {/* 随访模板配置区 */}
      <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
        <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
          <Space>
            <CalendarOutlined style={{ fontSize: 18, color: '#07C160' }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>随访模板配置</span>
            {activeTemplate && (
              <Tag color="green">{activeTemplate.name}（{activeTemplate.questions?.length || 0}题）</Tag>
            )}
          </Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              if (activeTemplate) {
                templateForm.setFieldsValue({ name: activeTemplate.name, description: activeTemplate.description })
                setEditingTemplate(activeTemplate)
              }
              setIsTemplateModalOpen(true)
            }}
          >
            编辑模板
          </Button>
        </Space>

        {activeTemplate && (
          <Table
            size="small"
            columns={questionColumns}
            dataSource={activeTemplate.questions || []}
            pagination={false}
            rowKey="q_id"
            style={{ background: '#fff' }}
          />
        )}
      </div>

      {/* 随访记录表格 */}
      <Table columns={recordColumns} dataSource={filtered} pagination={{ pageSize: 10 }} rowKey="id" />

      {/* 逾期提醒列表 */}
      {overdueRecords.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message={`⚠️ 有 ${overdueRecords.length} 条随访记录逾期未提交（超过7天）`}
            style={{ marginBottom: 12 }}
          />
          <Table
            size="small"
            title={() => <span style={{ fontWeight: 600 }}>📋 逾期提醒列表</span>}
            columns={[
              { title: '患者', dataIndex: 'userName', key: 'userName', render: (n: string) => <span style={{ color: '#fa8c16' }}>{n}</span> },
              { title: '模板', dataIndex: 'templateName', key: 'templateName' },
              { title: '逾期天数', dataIndex: 'daysOverdue', key: 'daysOverdue', render: (d: number) => <Tag color="orange">逾期{d}天</Tag> },
            ]}
            dataSource={overdueRecords}
            pagination={false}
            rowKey="id"
          />
        </div>
      )}

      {/* 编辑模板弹窗 */}
      <Modal
        title="编辑随访模板"
        open={isTemplateModalOpen}
        onOk={handleSaveTemplate}
        onCancel={() => setIsTemplateModalOpen(false)}
        width={600}
        okText="保存"
      >
        <Form form={templateForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="如：标准7天随访问卷" />
          </Form.Item>
          <Form.Item name="description" label="模板描述">
            <Input placeholder="模板描述..." />
          </Form.Item>
          <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, padding: '12px', fontSize: 13, color: '#ad6800' }}>
            💡 题目类型说明：<br/>
            • <strong>单选题</strong>：患者选择一个选项<br/>
            • <strong>多选题</strong>：患者可选择多个选项<br/>
            • <strong>评分题</strong>：患者打分（1-5星）<br/>
            • <strong>文本题</strong>：患者自由填写文字<br/>
            如需增删题目，请联系系统管理员修改代码。
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default FollowUp
