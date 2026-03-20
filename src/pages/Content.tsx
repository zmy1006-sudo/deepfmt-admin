import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api, ScienceItem } from '../lib/api'

const { Title, TextArea } = Typography
const { Option } = Select

const Content = () => {
  const [contents, setContents] = useState<ScienceItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => { loadContents() }, [])

  const loadContents = () => {
    setContents(api.getScienceList())
  }

  const categoryColor: Record<string, string> = {
    '基础知识': 'blue',
    '适应症': 'green',
    '流程': 'cyan',
    '注意事项': 'orange',
  }

  const columns: ColumnsType<ScienceItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => <Tag color={categoryColor[c] || 'default'}>{c}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'is_published',
      key: 'is_published',
      render: (pub: boolean) => (
        <Tag color={pub ? 'green' : 'default'}>{pub ? '已发布' : '草稿'}</Tag>
      ),
    },
    { title: '阅读量', dataIndex: 'read_count', key: 'read_count', sorter: (a, b) => a.read_count - b.read_count },
    { title: '作者', dataIndex: 'author', key: 'author' },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (d: string) => new Date(d).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ScienceItem) => (
        <Space size="middle">
          <Button type="link" onClick={() => handlePublishToggle(record)}>{record.is_published ? '下架' : '发布'}</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  const handlePublishToggle = (record: ScienceItem) => {
    api.updateScience(record.id, { is_published: !record.is_published })
    loadContents()
    message.success(record.is_published ? '已下架' : '已发布')
  }

  const handleEdit = (record: ScienceItem) => {
    setIsEditMode(true)
    setEditingId(record.id)
    form.setFieldsValue({ title: record.title, category: record.category, question: record.question, answer: record.answer, is_published: record.is_published, author: record.author })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({ title: '确认删除', content: '确定要删除这条内容吗？', onOk: () => { api.deleteScience(id); loadContents(); message.success('删除成功') } })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const data = { ...values, is_published: values.is_published ?? false }
      if (isEditMode) { api.updateScience(editingId, data); message.success('更新成功') } else { api.addScience({ id: `SCI_${Date.now()}`, tags: [], read_count: 0, collect_count: 0, sort_order: 99, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data }); message.success('添加成功') }
      setIsModalOpen(false)
      form.resetFields()
      loadContents()
    })
  }

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>内容管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsEditMode(false); form.resetFields(); setIsModalOpen(true) }}>添加内容</Button>
      </Space>
      <Table columns={columns} dataSource={contents} pagination={{ pageSize: 10 }} rowKey="id" />
      <Modal title={isEditMode ? '编辑内容' : '添加内容'} open={isModalOpen} onOk={handleSubmit} onCancel={() => { setIsModalOpen(false); form.resetFields() }} width={700} okText={isEditMode ? '保存' : '添加'}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}><Input /></Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select><Option value="基础知识">基础知识</Option><Option value="适应症">适应症</Option><Option value="流程">流程</Option><Option value="注意事项">注意事项</Option></Select>
          </Form.Item>
          <Form.Item name="question" label="问题"><Input /></Form.Item>
          <Form.Item name="answer" label="答案"><TextArea rows={5} /></Form.Item>
          <Form.Item name="author" label="作者" initialValue="管理员"><Input /></Form.Item>
          <Form.Item name="is_published" label="状态" valuePropName="checked" initialValue={false}>
            <Select><Option value={true}>已发布</Option><Option value={false}>草稿</Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Content
