import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, Descriptions, Typography, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getPatients, addPatient, updatePatient, deletePatient, Patient } from '../lib/storage'

const { Title } = Typography
const { Option } = Select

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string>('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = () => {
    const data = getPatients()
    setPatients(data)
  }

  const columns: ColumnsType<Patient> = [
    {
      title: '患者ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '治疗中': 'blue',
          '已完成': 'green',
          '随访中': 'orange',
        }
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
      },
    },
    {
      title: '入院日期',
      dataIndex: 'admissionDate',
      key: 'admissionDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Patient) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => {
              setSelectedPatient(record)
              setIsDetailModalOpen(true)
            }}
          >
            查看
          </Button>
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

  const handleAdd = () => {
    setIsEditMode(false)
    setEditingKey('')
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Patient) => {
    setIsEditMode(true)
    setEditingKey(record.key)
    form.setFieldsValue({
      name: record.name,
      age: record.age,
      gender: record.gender,
      phone: record.phone,
      status: record.status,
      admissionDate: record.admissionDate,
      disease: record.disease || '',
      treatmentCount: record.treatmentCount || 1,
      improvement: record.improvement || 0
    })
    setIsModalOpen(true)
  }

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个患者吗？',
      onOk: () => {
        deletePatient(key)
        loadPatients()
        message.success('删除成功')
      }
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const today = new Date().toISOString().split('T')[0]
      
      if (isEditMode) {
        updatePatient(editingKey, values)
        message.success('患者更新成功')
      } else {
        addPatient({
          ...values,
          admissionDate: values.admissionDate || today,
          disease: values.disease || 'FMT治疗',
          treatmentCount: values.treatmentCount || 1,
          improvement: values.improvement || 0
        })
        message.success('患者添加成功')
      }
      setIsModalOpen(false)
      form.resetFields()
      loadPatients()
    })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>患者管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加患者
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={patients}
        pagination={{ pageSize: 10 }}
        rowKey="key"
      />

      <Modal
        title={isEditMode ? '编辑患者' : '添加患者'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        okText={isEditMode ? '保存' : '添加'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入患者姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
            <Select>
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="电话" rules={[{ required: true, message: '请输入电话' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="治疗中">
            <Select>
              <Option value="治疗中">治疗中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="随访中">随访中</Option>
            </Select>
          </Form.Item>
          <Form.Item name="disease" label="疾病">
            <Input placeholder="如：便秘型肠易激" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="患者详情"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setSelectedPatient(null)
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedPatient && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="患者ID">{selectedPatient.id}</Descriptions.Item>
            <Descriptions.Item label="姓名">{selectedPatient.name}</Descriptions.Item>
            <Descriptions.Item label="年龄">{selectedPatient.age}</Descriptions.Item>
            <Descriptions.Item label="性别">{selectedPatient.gender}</Descriptions.Item>
            <Descriptions.Item label="电话">{selectedPatient.phone}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedPatient.status === '治疗中' ? 'blue' : selectedPatient.status === '已完成' ? 'green' : 'orange'}>
                {selectedPatient.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="入院日期">{selectedPatient.admissionDate}</Descriptions.Item>
            {selectedPatient.disease && <Descriptions.Item label="疾病">{selectedPatient.disease}</Descriptions.Item>}
            {selectedPatient.treatmentCount && <Descriptions.Item label="治疗次数">{selectedPatient.treatmentCount}</Descriptions.Item>}
            {selectedPatient.improvement && <Descriptions.Item label="改善程度">{selectedPatient.improvement}%</Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Patients
