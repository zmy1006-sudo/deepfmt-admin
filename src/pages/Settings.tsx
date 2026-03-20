import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Typography, message, Row, Col, Divider } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { STORAGE_KEYS } from '../lib/storage'

const { Title } = Typography
const { SYSTEM_NAME_KEY = 'deepfmt_system_name', ADMIN_EMAIL_KEY = 'deepfmt_admin_email' } = { SYSTEM_NAME_KEY: 'deepfmt_system_name', ADMIN_EMAIL_KEY: 'deepfmt_admin_email' }

const Settings = () => {
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    form.setFieldsValue({
      systemName: localStorage.getItem(SYSTEM_NAME_KEY) || 'DeepFMT 肠菌移植诊疗服务系统',
      adminEmail: localStorage.getItem(ADMIN_EMAIL_KEY) || 'admin@deepfmt.com',
    })
  }, [form])

  const handleSave = () => {
    const values = form.getFieldsValue()
    localStorage.setItem(SYSTEM_NAME_KEY, values.systemName || 'DeepFMT')
    localStorage.setItem(ADMIN_EMAIL_KEY, values.adminEmail || '')
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      message.success('保存成功')
    }, 500)
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>系统设置</Title>
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="基本信息" bordered={false}>
            <Form form={form} layout="vertical">
              <Form.Item name="systemName" label="系统名称" rules={[{ required: true, message: '请输入系统名称' }]}>
                <Input placeholder="请输入系统名称" />
              </Form.Item>
              <Form.Item name="adminEmail" label="管理员邮箱">
                <Input type="email" placeholder="请输入管理员邮箱" />
              </Form.Item>
              <Divider />
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave} style={{ background: '#07C160', borderColor: '#07C160' }}>
                保存设置
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统信息" bordered={false}>
            <div style={{ lineHeight: 2.2 }}>
              <div><strong>版本号：</strong>v2.0.0</div>
              <div><strong>技术栈：</strong>React + TypeScript + Vite + Ant Design</div>
              <div><strong>数据存储：</strong>LocalStorage（与患者端共享）</div>
              <div><strong>系统状态：</strong><span style={{ color: '#07C160' }}>运行正常</span></div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Settings
