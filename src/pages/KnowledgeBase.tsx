import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Form, Input, Select, Switch, message, Typography, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExperimentOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api } from '../lib/api'
import type { KBItem } from '../lib/dataInit'

const { Title, TextArea } = Typography


const categoryOptions = ['基础知识','适应症','流程','注意事项'].map(v=>({value:v,label:v}))
const KnowledgeBase = () => {
  const [kbList, setKbList] = useState<KBItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('全部')
  const [keywordSearch, setKeywordSearch] = useState<string>('')
  const [testKeyword, setTestKeyword] = useState<string>('')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadKB()
  }, [])

  const loadKB = () => {
    // 获取所有KB（包括未启用的）
    const raw = localStorage.getItem('deepfmt_chat_kb')
    const all: KBItem[] = raw ? JSON.parse(raw) : []
    setKbList(all)
  }

  const categories = ['全部', '基础知识', '适应症', '流程', '注意事项']

  const getFiltered = () => {
    let list = [...kbList]
    if (categoryFilter !== '全部') list = list.filter(k => k.category === categoryFilter)
    if (keywordSearch) {
      const kw = keywordSearch.toLowerCase()
      list = list.filter(k =>
        k.question.toLowerCase().includes(kw) ||
        k.answer.toLowerCase().includes(kw) ||
        k.keywords.some(kk => kk.toLowerCase().includes(kw))
      )
    }
    return list
  }

  const handleTest = () => {
    if (!testKeyword.trim()) {
      message.warning('请输入测试关键字')
      return
    }
    const result = api.matchAnswer(testKeyword)
    if (result) {
      setHighlightedId(result.id)
      message.success(`匹配到: ${result.question}`)
    } else {
      setHighlightedId(null)
      message.info('未找到匹配项')
    }
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setEditingId('')
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: KBItem) => {
    setIsEditMode(true)
    setEditingId(record.id)
    form.setFieldsValue({
      keywords: record.keywords.join(','),
      question: record.question,
      answer: record.answer,
      category: record.category,
      is_active: record.is_active,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条问答吗？',
      onOk: () => {
        const all = localStorage.getItem('deepfmt_chat_kb')
        const list: KBItem[] = all ? JSON.parse(all) : []
        const updated = list.filter(k => k.id !== id)
        localStorage.setItem('deepfmt_chat_kb', JSON.stringify(updated))
        loadKB()
        message.success('删除成功')
      },
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const keywords = values.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      const data: KBItem = {
        id: isEditMode ? editingId : `KB_${Date.now()}`,
        keywords,
        question: values.question,
        answer: values.answer,
        category: values.category,
        is_active: values.is_active ?? true,
        hit_count: isEditMode ? (kbList.find(k => k.id === editingId)?.hit_count || 0) : 0,
      }
      const all = localStorage.getItem('deepfmt_chat_kb')
      const list: KBItem[] = all ? JSON.parse(all) : []
      if (isEditMode) {
        const updated = list.map(k => k.id === editingId ? data : k)
        localStorage.setItem('deepfmt_chat_kb', JSON.stringify(updated))
        message.success('更新成功')
      } else {
        list.push(data)
        localStorage.setItem('deepfmt_chat_kb', JSON.stringify(list))
        message.success('添加成功')
      }
      setIsModalOpen(false)
      form.resetFields()
      loadKB()
    })
  }

  const categoryColor: Record<string, string> = {
    '基础知识': 'blue',
    '适应症': 'green',
    '流程': 'cyan',
    '注意事项': 'orange',
  }

  const columns: ColumnsType<KBItem> = [
    {
      title: '关键字',
      dataIndex: 'keywords',
      key: 'keywords',
      width: 200,
      render: (kws: string[]) => (
        <Space wrap size={[4, 4]}>
          {kws.slice(0, 3).map(k => <Tag key={k} color="purple">{k}</Tag>)}
          {kws.length > 3 && <Tag>+{kws.length - 3}</Tag>}
        </Space>
      ),
    },
    { title: '问题', dataIndex: 'question', key: 'question', ellipsis: true },
    {
      title: '答案摘要',
      dataIndex: 'answer',
      key: 'answer',
      ellipsis: true,
      render: (a: string) => (
        <Tooltip title={a}>
          <span>{a.slice(0, 50)}{a.length > 50 ? '...' : ''}</span>
        </Tooltip>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 90,
      render: (c: string) => <Tag color={categoryColor[c] || 'default'}>{c}</Tag>,
    },
    {
      title: '命中次数',
      dataIndex: 'hit_count',
      key: 'hit_count',
      width: 90,
      render: (n: number) => <span style={{ color: n > 0 ? '#07C160' : '#999' }}>{n}</span>,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: KBItem) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  const filtered = getFiltered()

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>知识库管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索关键字/问题/答案"
            style={{ width: 220 }}
            onSearch={setKeywordSearch}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加问答
          </Button>
        </Space>
      </Space>

      {/* 匹配测试区 */}
      <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
        <Space>
          <ExperimentOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontWeight: 500 }}>匹配测试：</span>
          <Input
            placeholder="输入患者提问，测试知识库匹配..."
            style={{ width: 340 }}
            value={testKeyword}
            onChange={e => setTestKeyword(e.target.value)}
            onPressEnter={handleTest}
          />
          <Button type="default" onClick={handleTest}>测试</Button>
          {highlightedId && (
            <Tag color="green">✓ 已匹配</Tag>
          )}
        </Space>
      </div>

      {/* 分类筛选 */}
      <Space style={{ marginBottom: 12 }}>
        {categories.map(c => (
          <Tag
            key={c}
            color={categoryFilter === c ? 'blue' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px' }}
            onClick={() => setCategoryFilter(c)}
          >
            {c}
          </Tag>
        ))}
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        rowKey="id"
        rowClassName={(record) => record.id === highlightedId ? 'ant-table-row-highlight' : ''}
      />

      <Modal
        title={isEditMode ? '编辑问答' : '添加问答'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => { setIsModalOpen(false); form.resetFields() }}
        width={700}
        okText={isEditMode ? '保存' : '添加'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="keywords" label="关键字" rules={[{ required: true, message: '请输入关键字' }]}>
            <Input placeholder="多个用逗号分隔，如：便秘,排便困难" />
          </Form.Item>
          <Form.Item name="question" label="问题" rules={[{ required: true, message: '请输入问题' }]}>
            <Input placeholder="请输入问题" />
          </Form.Item>
          <Form.Item name="answer" label="答案" rules={[{ required: true, message: '请输入答案' }]}>
            <TextArea rows={5} placeholder="请输入详细答案..." />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]} style={{ flex: 1 }}>
              <Select placeholder="请选择分类" options={categoryOptions} />
            </Form.Item>
            <Form.Item name="is_active" label="状态" style={{ flex: 1 }} initialValue={true}>
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}

export default KnowledgeBase
