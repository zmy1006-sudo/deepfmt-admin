import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Descriptions, Typography, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api, User } from '../lib/api'

const { Title } = Typography
const { Option } = Select

const Patients = () => {
  const [patients, setPatients] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string>('')
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { loadPatients() }, [])

  const loadPatients = () => {
    setPatients(api.getUsers())
  }

  const statusColor = (status: string) => {
    const m: Record<string, string> = { '治疗中': 'blue', '已完成': 'green', '待启动第2次': 'orange', '随访中': 'cyan' }
    return m[status] || 'default'
  }

  const columns: ColumnsType<User> = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '性别', dataIndex: 'gender', key: 'gender' },
    { title: '年龄', dataIndex: 'age', key: 'age', render: (a: number) => a || '-' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '疾病', dataIndex: 'disease', key: 'disease', render: (d: string) => d || '-' },
    { title: '治疗次数', dataIndex: 'treatment_count', key: 'treatment_count', render: (c: number) => c ?? 0 },
    {
      title: '状态',
      dataIndex: 'treatment_status',
      key: 'treatment_status',
      render: (s: string) => <Tag color={statusColor(s)}>{s || '-'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setSelectedPatient(record); setIsDetailModalOpen(true) }}>查看</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record: User) => {
    setIsEditMode(true)
    setEditingId(record.id)
    form.setFieldsValue({ name: record.name, gender: record.gender, age: record.age, phone: record.phone, disease: record.disease, treatment_count: record.treatment_count, treatment_status: record.treatment_status, disease_type: record.disease_type })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({ title: '确认删除', content: '确定要删除这个患者吗？', onOk: () => { api.deleteUser(id); loadPatients(); message.success('删除成功') } })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const data = { ...values, age: Number(values.age) || 0, treatment_count: Number(values.treatment_count) || 0 }
      if (isEditMode) { api.updateUser(editingId, data); message.success('更新成功') } else { api.addUser({ id: `U_${Date.now()}`, phone: values.phone || `ph${Date.now()}`, password: 'e10adc3949ba59abbe56e057f20f883e', avatar: '👤', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_login: '', status: '正常', notes: '', followup_count: 0, improvement_rate: '', doctor: '', hospital: '', current_progress: '', ...data }); message.success('添加成功') }
      setIsModalOpen(false)
      form.resetFields()
      loadPatients()
    })
  }

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>患者管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsEditMode(false); form.resetFields(); setIsModalOpen(true) }}>添加患者</Button>
      </Space>
      <Table columns={columns} dataSource={patients} pagination={{ pageSize: 10 }} rowKey="id" />
      <Modal title={isEditMode ? '编辑患者' : '添加患者'} open={isModalOpen} onOk={handleSubmit} onCancel={() => { setIsModalOpen(false); form.resetFields() }} width={600} okText={isEditMode ? '保存' : '添加'}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入患者姓名' }]}><Input /></Form.Item>
          <Form.Item name="age" label="年龄"><Input type="number" /></Form.Item>
          <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
            <Select><Option value="男">男</Option><Option value="女">女</Option></Select>
          </Form.Item>
          <Form.Item name="phone" label="电话" rules={[{ required: true, message: '请输入电话' }]}><Input /></Form.Item>
          <Form.Item name="disease" label="疾病"><Input placeholder="如：便秘型肠易激" /></Form.Item>
          <Form.Item name="disease_type" label="疾病类型"><Input /></Form.Item>
          <Form.Item name="treatment_count" label="治疗次数"><Input type="number" /></Form.Item>
          <Form.Item name="treatment_status" label="治疗状态" initialValue="治疗中">
            <Select><Option value="治疗中">治疗中</Option><Option value="已完成">已完成</Option><Option value="待启动第2次">待启动第2次</Option></Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal title="患者详情" open={isDetailModalOpen} onCancel={() => { setIsDetailModalOpen(false); setSelectedPatient(null) }} footer={[<Button key="close" onClick={() => setIsDetailModalOpen(false)}>关闭</Button>]} width={600}>
        {selectedPatient && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="姓名">{selectedPatient.name}</Descriptions.Item>
            <Descriptions.Item label="性别">{selectedPatient.gender}</Descriptions.Item>
            <Descriptions.Item label="年龄">{selectedPatient.age}</Descriptions.Item>
            <Descriptions.Item label="电话">{selectedPatient.phone}</Descriptions.Item>
            <Descriptions.Item label="疾病">{selectedPatient.disease || '-'}</Descriptions.Item>
            <Descriptions.Item label="疾病类型">{selectedPatient.disease_type || '-'}</Descriptions.Item>
            <Descriptions.Item label="治疗次数">{selectedPatient.treatment_count ?? 0}</Descriptions.Item>
            <Descriptions.Item label="治疗状态"><Tag color={statusColor(selectedPatient.treatment_status || '')}>{selectedPatient.treatment_status || '-'}</Tag></Descriptions.Item>
            <Descriptions.Item label="当前进度">{selectedPatient.current_progress || '-'}</Descriptions.Item>
            <Descriptions.Item label="改善程度">{selectedPatient.improvement_rate || '-'}</Descriptions.Item>
            <Descriptions.Item label="负责医生">{selectedPatient.doctor || '-'}</Descriptions.Item>
            <Descriptions.Item label="医院">{selectedPatient.hospital || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(selectedPatient.created_at).toLocaleDateString('zh-CN')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Patients
