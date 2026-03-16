import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Divider, Space } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

const { Title } = Typography

interface SettingsForm {
  systemName: string
  adminEmail: string
  siteDescription: string
}

const Settings = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSave = (values: SettingsForm) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log('保存设置:', values)
      message.success('设置保存成功')
      setLoading(false)
    }, 500)
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>系统设置</Title>
      
      <Card title="基本设置" style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            systemName: 'deepFMT 管理后台',
            adminEmail: 'admin@deepfmt.com',
            siteDescription: '肠道菌群移植(FMT)管理系统',
          }}
          onFinish={handleSave}
        >
          <Form.Item
            name="systemName"
            label="系统名称"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>

          <Form.Item
            name="adminEmail"
            label="管理员邮箱"
            rules={[
              { required: true, message: '请输入管理员邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入管理员邮箱" />
          </Form.Item>

          <Form.Item
            name="siteDescription"
            label="系统描述"
          >
            <Input.TextArea rows={3} placeholder="请输入系统描述" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                保存设置
              </Button>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Settings
