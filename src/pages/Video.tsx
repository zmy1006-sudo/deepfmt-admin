import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Typography, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlaySquareOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api } from '../lib/api'

const { Title, TextArea } = Typography
const { Option } = Select

interface VideoItemUI {
  id: string
  title: string
  description: string
  cover_url: string
  video_url: string
  duration: string
  category: string
  play_count: number
  speaker: string
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

const Video = () => {
  const [videos, setVideos] = useState<VideoItemUI[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('全部')
  const [form] = Form.useForm()

  useEffect(() => {
    // 初始化示例视频数据
    const existingVideos = api.getVideoList()
    if (existingVideos.length === 0) {
      api.addVideo({
        id: 'VID_001',
        title: '肠道菌群与健康',
        description: '详细介绍肠道菌群的重要性...',
        cover_url: 'https://picsum.photos/seed/vid1/400/225',
        video_url: '',
        duration: '15:30',
        category: '专家讲座',
        author: '王建国 主任医师',
        views: 2341,
        created_at: new Date().toISOString(),
      } as any)
    }
    loadVideos()
  }, [])

  const loadVideos = () => {
    const raw = api.getVideoList()
    const list: VideoItemUI[] = raw.map((v: any) => ({
      ...v,
      play_count: v.views || 0,
      speaker: v.author || '',
      is_featured: false,
      is_published: true,
    }))
    setVideos(list)
  }

  const categories = ['全部', '专家讲座', '治疗视频', '科普动画']
  const filtered = categoryFilter === '全部' ? videos : videos.filter(v => v.category === categoryFilter)

  const categoryColor: Record<string, string> = {
    '专家讲座': 'blue',
    '治疗视频': 'green',
    '科普动画': 'purple',
  }

  const columns: ColumnsType<VideoItemUI> = [
    {
      title: '封面',
      dataIndex: 'cover_url',
      key: 'cover',
      width: 120,
      render: (url: string) => url ? (
        <img src={url} alt="封面" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} />
      ) : <div style={{ width: 80, height: 45, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlaySquareOutlined /></div>,
    },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => <Tag color={categoryColor[c] || 'default'}>{c}</Tag>,
    },
    { title: '时长', dataIndex: 'duration', key: 'duration', width: 80 },
    {
      title: '播放量',
      dataIndex: 'play_count',
      key: 'play_count',
      width: 90,
      render: (n: number) => n.toLocaleString(),
    },
    { title: '主讲人', dataIndex: 'speaker', key: 'speaker', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'is_published',
      key: 'is_published',
      width: 80,
      render: (pub: boolean) => <Tag color={pub ? 'green' : 'default'}>{pub ? '已发布' : '草稿'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: VideoItemUI) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record: VideoItemUI) => {
    setIsEditMode(true)
    setEditingId(record.id)
    form.setFieldsValue({
      title: record.title,
      cover_url: record.cover_url,
      video_url: record.video_url,
      category: record.category,
      speaker: record.speaker,
      duration: record.duration,
      description: record.description,
      is_published: record.is_published,
      play_count: record.play_count,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个视频吗？',
      onOk: () => {
        const list = api.getVideoList()
        const updated = list.filter(v => v.id !== id)
        localStorage.setItem('deepfmt_videos', JSON.stringify(updated))
        loadVideos()
        message.success('删除成功')
      },
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const data: any = {
        title: values.title,
        cover_url: values.cover_url || '',
        video_url: values.video_url || '',
        category: values.category,
        author: values.speaker || '',
        duration: values.duration || '',
        description: values.description || '',
      }
      if (isEditMode) {
        api.updateVideo(editingId, data)
        message.success('更新成功')
      } else {
        const newVideo = {
          id: `VID_${Date.now()}`,
          title: values.title,
          description: values.description || '',
          cover_url: values.cover_url || '',
          video_url: values.video_url || '',
          duration: values.duration || '',
          category: values.category,
          author: values.speaker || '',
          views: 0,
          created_at: new Date().toISOString(),
        }
        api.addVideo(newVideo as any)
        message.success('添加成功')
      }
      setIsModalOpen(false)
      form.resetFields()
      loadVideos()
    })
  }

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>视频管理</Title>
        <Space>
          <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 140 }}>
            {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsEditMode(false); form.resetFields(); setIsModalOpen(true) }}>
            添加视频
          </Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        rowKey="id"
      />

      <Modal
        title={isEditMode ? '编辑视频' : '添加视频'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => { setIsModalOpen(false); form.resetFields() }}
        width={700}
        okText={isEditMode ? '保存' : '添加'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入视频标题' }]}>
            <Input placeholder="请输入视频标题" />
          </Form.Item>
          <Form.Item name="cover_url" label="封面URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="video_url" label="视频URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]} style={{ flex: 1 }}>
              <Select placeholder="请选择分类">
                <Option value="专家讲座">专家讲座</Option>
                <Option value="治疗视频">治疗视频</Option>
                <Option value="科普动画">科普动画</Option>
              </Select>
            </Form.Item>
            <Form.Item name="speaker" label="主讲人" style={{ flex: 1 }}>
              <Input placeholder="如：王建国 主任医师" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="duration" label="时长" style={{ flex: 1 }}>
              <Input placeholder="如：15:30" />
            </Form.Item>
            <Form.Item name="is_published" label="发布状态" style={{ flex: 1 }} valuePropName="checked" initialValue={true}>
              <Select>
                <Option value={true}>已发布</Option>
                <Option value={false}>草稿</Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="视频简介..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Video
