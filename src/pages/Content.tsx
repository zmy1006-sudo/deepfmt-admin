import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getContents, addContent, updateContent, deleteContent, ContentItem } from '../lib/storage'

const { Title, TextArea } = Typography
const { Option } = Select

const Content = () => {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    loadContents()
  }, [])

  const loadContents = () => {
    const data = getContents()
    setContents(data)
  }

  const columns: ColumnsType<ContentItem> = [
    {
      title: '内容ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const colorMap: Record<string, string> = {
          '科普知识': 'blue',
          '治疗科普': 'green',
          '护理知识': 'orange',
          'FAQ': 'purple',
        }
        return <Tag color={colorMap[category] || 'default'}>{category}</Tag>
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ContentItem) => {
        const color = status === '已发布' ? 'green' : 'default'
        return (
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record.key, value)}
            style={{ width: 100 }}
            size="small"
          >
            <Option value="已发布">已发布</Option>
            <Option value="草稿">草稿</Option>
          </Select>
        )
      },
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ContentItem) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleStatusChange = (key: string, status: string) => {
    updateContent(key, { status })
    loadContents()
    message.success('状态已更新')
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setEditingKey('')
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: ContentItem) => {
    setIsEditMode(true)
    setEditingKey(record.key)
    form.setFieldsValue({
      title: record.title,
      category: record.category,
      author: record.author,
      content: record.content,
      status: record.status
    })
    setIsModalOpen(true)
  }

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条内容吗？',
      onOk: () => {
        deleteContent(key)
        loadContents()
        message.success('删除成功')
      }
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (isEditMode) {
        updateContent(editingKey, {
          ...values,
          status: values.status || '草稿'
        })
        message.success('内容更新成功')
      } else {
        addContent({
          ...values,
          status: values.status || '草稿'
        })
        message.success('内容添加成功')
      }
      setIsModalOpen(false)
      form.resetFields()
      loadContents()
    })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>内容管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加内容
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={contents}
        pagination={{ pageSize: 10 }}
        rowKey="key"
      />

      <Modal
        title={isEditMode ? '编辑内容' : '添加内容'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={700}
        okText={isEditMode ? '保存' : '添加'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select>
              <Option value="科普知识">科普知识</Option>
              <Option value="治疗科普">治疗科普</Option>
              <Option value="护理知识">护理知识</Option>
              <Option value="FAQ">FAQ</Option>
            </Select>
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true, message: '请输入作者' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="草稿">
            <Select>
              <Option value="已发布">已发布</Option>
              <Option value="草稿">草稿</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Content
