import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { api } from '../lib/api'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: { account: string; password: string; remember: boolean }) => {
    setLoading(true)
    try {
      const user = api.adminLogin(values.account, values.password)
      if (user) {
        message.success('登录成功，欢迎 ' + user.name)
        navigate('/dashboard', { replace: true })
      } else {
        message.error('账号或密码错误')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        maxWidth: 900,
        width: '100%',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        minHeight: 500,
      }}>
        {/* 左侧 */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #07C160 0%, #059669 100%)',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#fff',
        }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
            DeepFMT
          </div>
          <div style={{ fontSize: 16, marginBottom: 40, opacity: 0.9 }}>
            肠菌移植诊疗服务系统
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.85 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>高效管理患者数据</div>
              <div>集中管理患者档案、治疗记录与随访数据，提升诊疗效率</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>智能化随访追踪</div>
              <div>自动生成随访计划，实时监控患者康复进度，确保治疗效果</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>科学统计分析</div>
              <div>多维度数据报表，直观展示治疗成果，辅助临床决策</div>
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div style={{
          flex: 1,
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 }}>
              管理员登录
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              请输入账号密码以访问管理后台
            </div>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="account"
              rules={[{ required: true, message: '请输入管理员账号' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#07C160' }} />}
                placeholder="请输入管理员账号"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#07C160' }} />}
                placeholder="请输入密码"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 16 }}>
              <span style={{ color: '#07C160', cursor: 'pointer' }}>记住登录状态</span>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  background: '#07C160',
                  borderColor: '#07C160',
                  borderRadius: 8,
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                登录
              </Button>
            </Form.Item>

            <div style={{ marginTop: 16, fontSize: 12, color: '#999', textAlign: 'center' }}>
              测试账号：admin &nbsp;|&nbsp; 密码：admin123
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login
