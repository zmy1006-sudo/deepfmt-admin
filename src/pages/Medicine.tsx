import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api, MedicineItem, User } from '../lib/api'

const { Title } = Typography

const Medicine = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string>('')
  const [patientSearch, setPatientSearch] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setMedicines(api.getMedicineList())
    setUsers(api.getUsers())
  }

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || userId
  }

  const filtered = patientSearch
    ? medicines.filter(m => getUserName(m.user_id).toLowerCase().includes(patientSearch.toLowerCase()))
    : medicines

  const statusColor: Record<string, string> = {
    '服用中': 'green',
    '已停药': 'orange',
    '已完成': 'blue',
  }

  const columns: ColumnsType<MedicineItem> = [
    {
      title: '患者姓名',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
      render: (uid: string) => (
        <span style={{ fontWeight: 500 }}>{getUserName(uid)}</span>
      ),
    },
    { title: '药品名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '剂量', dataIndex: 'dosage', key: 'dosage', ellipsis: true },
    {
      title: '服用频率',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 110,
      render: (f: string) => <Tag color="blue">{f}</Tag>,
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 110,
      render: (d: string) => d || '-',
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 110,
      render: (d: string) => d || '-',
    },
    {
      title: '已服用天数',
      key: 'taken_days',
      width: 110,
      render: (_: unknown, record: MedicineItem) => (
        <span style={{ color: record.taken_dates?.length > 0 ? '#07C160' : '#999' }}>
          {record.taken_dates?.length || 0}天
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: MedicineItem) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#1677ff', padding: 0 }}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} style={{ padding: 0 }}>删除</Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record: MedicineItem) => {
    setIsEditMode(true)
    setEditingId(record.id)
    form.setFieldsValue({
      user_id: record.user_id,
      name: record.name,
      dosage: record.dosage,
      frequency: record.frequency,
      start_date: record.start_date || undefined,
      end_date: record.end_date || undefined,
      status: record.status,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条用药记录吗？',
      onOk: () => {
        const all = api.getMedicineList()
        const updated = all.filter(m => m.id !== id)
        localStorage.setItem('deepfmt_medicine', JSON.stringify(updated))
        loadData()
        message.success('删除成功')
      },
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const data: MedicineItem = {
        id: isEditMode ? editingId : `MED_${Date.now()}`,
        user_id: values.user_id,
        name: values.name,
        dosage: values.dosage,
        frequency: values.frequency,
        reminder_times: values.reminder_times || [],
        start_date: values.start_date || '',
        end_date: values.end_date || '',
        status: values.status || '服用中',
        taken_dates: isEditMode ? (medicines.find(m => m.id === editingId)?.taken_dates || []) : [],
      }
      if (isEditMode) {
        const all = api.getMedicineList()
        const updated = all.map(m => m.id === editingId ? { ...m, ...data } : m)
        localStorage.setItem('deepfmt_medicine', JSON.stringify(updated))
        message.success('更新成功')
      } else {
        const all = api.getMedicineList()
        all.push(data)
        localStorage.setItem('deepfmt_medicine', JSON.stringify(all))
        message.success('添加成功')
      }
      setIsModalOpen(false)
      form.resetFields()
      loadData()
    })
  }

  const userSelectOptions = users.map(u => ({ value: u.id, label: `${u.name}（${u.phone}）` }))
  const frequencyOptions = ['每日1次', '每日2次', '每日3次', '每日4次', '睡前1次', '每周1次'].map(f => ({ value: f, label: f }))
  const statusOptions = [
    { value: '服用中', label: '服用中' },
    { value: '已停药', label: '已停药' },
    { value: '已完成', label: '已完成' },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>用药管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索患者姓名"
            style={{ width: 200 }}
            onSearch={setPatientSearch}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsEditMode(false); form.resetFields(); setIsModalOpen(true) }}>
            添加用药
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
        title={isEditMode ? '编辑用药' : '添加用药'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => { setIsModalOpen(false); form.resetFields() }}
        width={600}
        okText={isEditMode ? '保存' : '添加'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="user_id" label="患者姓名" rules={[{ required: true, message: '请选择患者' }]}>
            <Select
              placeholder="请选择患者"
              showSearch
              filterOption={(input, option) =>
                (option?.label as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={userSelectOptions}
            />
          </Form.Item>
          <Form.Item name="name" label="药品名称" rules={[{ required: true, message: '请输入药品名称' }]}>
            <Input placeholder="如：双歧杆菌胶囊" />
          </Form.Item>
          <Form.Item name="dosage" label="剂量" rules={[{ required: true, message: '请输入剂量' }]}>
            <Input.TextArea placeholder="如：每日2次，每次3粒" rows={2} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="frequency" label="服用频率" rules={[{ required: true, message: '请选择频率' }]} style={{ flex: 1 }}>
              <Select placeholder="请选择频率" options={frequencyOptions} />
            </Form.Item>
            <Form.Item name="status" label="状态" style={{ flex: 1 }} initialValue="服用中">
              <Select options={statusOptions} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="start_date" label="开始日期" style={{ flex: 1 }}>
              <Input placeholder="如：2025-10-15" />
            </Form.Item>
            <Form.Item name="end_date" label="结束日期" style={{ flex: 1 }}>
              <Input placeholder="如：2026-04-15" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}

export default Medicine
