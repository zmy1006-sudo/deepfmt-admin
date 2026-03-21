import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Form, Input, Select, Switch, message, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api } from '../lib/api'

const { Title } = Typography
const TextArea = Input.TextArea

const categoryColor: Record<string, string> = {
  '专家讲座': 'blue', '治疗视频': 'green', '科普动画': 'purple',
}

const CAT_OPTIONS = [
  { value: '专家讲座', label: '专家讲座' },
  { value: '治疗视频', label: '治疗视频' },
  { value: '科普动画', label: '科普动画' },
]
const FILTER_OPTIONS = [{ value: '全部', label: '全部' }, ...CAT_OPTIONS]

interface VI { id: string; title: string; description: string; cover_url: string; video_url: string; duration: string; category: string; speaker: string; views: number; created_at: string; updated_at: string }

const Video = () => {
  const [videos, setVideos] = useState<VI[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [form] = Form.useForm()

  const loadVideos = () => {
    const raw: VI[] = (api as any).getVideoList ? (api as any).getVideoList() : []
    setVideos(raw.length ? raw : [{
      id: 'VID_001', title: '肠道菌群与FMT科普', description: '介绍FMT基础知识',
      cover_url: '', video_url: '', duration: '15:30', category: '专家讲座',
      speaker: '王建国 主任医师', views: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }])
  }

  useEffect(() => { loadVideos() }, [])

  const filtered = categoryFilter === '全部' ? videos : videos.filter(v => v.category === categoryFilter)

  const columns: ColumnsType<VI> = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '时长', dataIndex: 'duration', key: 'duration', width: 80 },
    { title: '播放', dataIndex: 'views', key: 'views', width: 80, render: n => n.toLocaleString() },
    { title: '主讲人', dataIndex: 'speaker', key: 'speaker', ellipsis: true },
    { title: '分类', dataIndex: 'category', key: 'category', render: c => <Tag color={categoryColor[c] || 'default'}>{c}</Tag> },
    {
      title: '操作', key: 'action', width: 140,
      render: (_: unknown, record: VI) => (
        <Space size="middle">
          <Button type="link" style={{ color: '#1677ff' }} icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record: VI) => {
    setIsEditMode(true); setEditingId(record.id)
    form.setFieldsValue({ title: record.title, category: record.category, speaker: record.speaker, video_url: record.video_url, cover_url: record.cover_url, duration: record.duration, description: record.description })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({ title: '确认删除', content: '确定要删除这个视频吗？', onOk: () => { (api as any).deleteVideo ? (api as any).deleteVideo(id) : null; loadVideos(); message.success('删除成功') } })
  }

  const handleAdd = () => { setIsEditMode(false); setEditingId(''); form.resetFields(); form.setFieldsValue({ category: '专家讲座' }); setIsModalOpen(true) }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const v = values as any
      if (isEditMode) {
        ;(api as any).updateVideo ? (api as any).updateVideo(editingId, v) : null
      } else {
        ;(api as any).addVideo ? (api as any).addVideo({ id: `VID_${Date.now()}`, views: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), title: v.title || '', category: v.category || '专家讲座', speaker: v.speaker || '', video_url: v.video_url || '', cover_url: v.cover_url || '', duration: v.duration || '', description: v.description || '' }) : null
      }
      message.success(isEditMode ? '更新成功' : '添加成功')
      setIsModalOpen(false); form.resetFields(); loadVideos()
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>视频管理</Title>
        <Space>
          <Select value={categoryFilter} onChange={setCategoryFilter} options={FILTER_OPTIONS} style={{ width: 120 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加视频</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} rowKey="id" />
      <Modal title={isEditMode ? '编辑视频' : '添加视频'} open={isModalOpen} onOk={handleSubmit} onCancel={() => { setIsModalOpen(false); form.resetFields() }} width={600} okText={isEditMode ? '保存' : '添加'}>
        <Form form={form} layout="vertical" initialValues={{ category: '专家讲座' }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入视频标题' }]}>
            <Input placeholder="请输入视频标题" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="category" label="分类" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select placeholder="请选择分类" options={CAT_OPTIONS} />
            </Form.Item>
            <Form.Item name="duration" label="时长" style={{ flex: 1 }}>
              <Input placeholder="如 15:30" />
            </Form.Item>
          </div>
          <Form.Item name="speaker" label="主讲人">
            <Input placeholder="主讲人姓名和职称" />
          </Form.Item>
          <Form.Item name="cover_url" label="封面图URL">
            <Input placeholder="输入封面图片URL地址" />
          </Form.Item>
          <Form.Item name="video_url" label="视频URL">
            <Input placeholder="输入视频播放地址或B站链接" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入视频简介" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
export default Video
