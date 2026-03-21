import { useState, useEffect } from 'react'
import { Table, Tag, Typography, Select, Space, Button, Modal, Form, Input, message, Alert } from 'antd'
import { PlusOutlined, EditOutlined, WarningOutlined, CalendarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api, FollowupRecord, FollowupTemplate, User } from '../lib/api'

const { Title } = Typography

const FollowUp = () => {
  const [records, setRecords] = useState<FollowupRecord[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [templates, setTemplates] = useState<FollowupTemplate[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false)
  const [templateForm] = Form.useForm()
  const [followupForm] = Form.useForm()
  const [editingTemplate, setEditingTemplate] = useState<FollowupTemplate | null>(null)

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

  // 状态颜色优化：待填写=orange, 已提交=green, 逾期=red
  const statusColor: Record<string, string> = {
    '待填写': 'orange',
    '已提交': 'green',
    '已查看': 'green',
    '逾期': 'red',
  }

  // 判断是否逾期（待填写 且 超过截止日期）
  const isOverdue = (record: FollowupRecord): boolean => {
    if (record.status !== '待填写') return false
    const dueDateStr = (record as any).due_date
    if (!dueDateStr) return false
    return new Date(dueDateStr) < new Date()
  }

  const getStatusTag = (record: FollowupRecord) => {
    const overdue = isOverdue(record)
    const s = overdue ? '逾期' : record.status
    return <Tag color={statusColor[s]}>{s}</Tag>
  }

  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter)

  // 逾期提醒
  const overdueRecords = records.filter(r => isOverdue(r)).map(r => {
    const user = users.find(u => u.id === r.user_id)
    const template = templates.find(t => t.id === r.template_id)
    return {
      ...r,
      userName: user?.name || r.user_id,
      templateName: template?.name || r.template_id,
    }
  })

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
      title: '截止日期',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (d: string) => d || '-',
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
      render: (_: unknown, record: FollowupRecord) => getStatusTag(record),
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

  const handleAddFollowup = () => {
    followupForm.validateFields().then(values => {
      const newRecord: FollowupRecord = {
        id: `REC_${Date.now()}`,
        user_id: values.user_id,
        template_id: values.template_id,
        treatment_count: Number(values.treatment_count) || 1,
        answers: {},
        total_score: 0,
        submitted_at: '',
        status: '待填写',
      }
      const all = api.getFollowupRecords()
      all.push(newRecord)
      localStorage.setItem('deepfmt_followup_records', JSON.stringify(all))
      // 附加 due_date 到记录（用扩展字段）
      const withDue = { ...newRecord, due_date: values.due_date || '' }
      setRecords(prev => [...prev, withDue as FollowupRecord])
      setIsFollowupModalOpen(false)
      followupForm.resetFields()
      message.success('新增随访成功')
    })
  }

  const activeTemplate = templates.find(t => t.is_active) || templates[0]

  const userOptions = users.map(u => ({ value: u.id, label: `${u.name}（${u.phone}）` }))
  const templateOptions = templates.map(t => ({ value: t.id, label: t.name }))

  return (
    <div>
      {/* 页面标题区 */}
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>随访管理</Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: '待填写', label: '待填写' },
              { value: '已提交', label: '已提交' },
              { value: '已查看', label: '已查看' },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { followupForm.resetFields(); setIsFollowupModalOpen(true) }}
          >
            新增随访
          </Button>
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
            message={`⚠️ 有 ${overdueRecords.length} 条随访记录逾期未提交`}
            style={{ marginBottom: 12 }}
          />
          <Table
            size="small"
            title={() => <span style={{ fontWeight: 600 }}>📋 逾期提醒列表</span>}
            columns={[
              { title: '患者', dataIndex: 'userName', key: 'userName', render: (n: string) => <span style={{ color: '#cf1322' }}>{n}</span> },
              { title: '模板', dataIndex: 'templateName', key: 'templateName' },
              { title: '截止日期', dataIndex: 'due_date', key: 'due_date', render: (d: string) => d || '-' },
              { title: '状态', render: () => <Tag color="red">逾期</Tag> },
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
            <Input.TextArea placeholder="模板描述..." rows={3} />
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

      {/* 新增随访弹窗 */}
      <Modal
        title="新增随访"
        open={isFollowupModalOpen}
        onOk={handleAddFollowup}
        onCancel={() => { setIsFollowupModalOpen(false); followupForm.resetFields() }}
        width={600}
        okText="添加"
      >
        <Form form={followupForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="user_id" label="选择患者" rules={[{ required: true, message: '请选择患者' }]}>
            <Select
              placeholder="请选择患者"
              showSearch
              filterOption={(input, option) =>
                (option?.label as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={userOptions}
            />
          </Form.Item>
          <Form.Item name="template_id" label="问卷模板" rules={[{ required: true, message: '请选择问卷模板' }]}>
            <Select placeholder="请选择问卷模板" options={templateOptions} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="treatment_count" label="治疗次数" style={{ flex: 1 }}>
              <Input type="number" placeholder="如：1" min={1} />
            </Form.Item>
            <Form.Item name="due_date" label="截止日期" style={{ flex: 1 }}>
              <Input placeholder="如：2026-03-25" />
            </Form.Item>
          </Space>
          <div style={{ background: '#f0f5ff', border: '1px solid #adc6ff', borderRadius: 6, padding: '12px', fontSize: 13, color: '#1677ff' }}>
            💡 新增随访将创建一条「待填写」状态的随访记录，请提醒患者在截止日期前完成填写。
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default FollowUp
