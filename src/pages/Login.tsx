import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const ADMIN_USER = {
  id: 'U_admin01',
  phone: 'admin',
  password: 'e10adc3949ba59abbe56e057f20f883e',
  name: '管理员',
  gender: '男',
  age: 30,
  disease: '',
  disease_type: '',
  treatment_count: 0,
  treatment_status: '',
  current_progress: '',
  improvement_rate: '',
  doctor: '',
  hospital: '',
  followup_count: 0,
  avatar: '🔐',
  created_at: '2026-03-20T00:00:00Z',
  updated_at: '2026-03-20T00:00:00Z',
  last_login: '',
  status: '正常',
  notes: '系统管理员'
}

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = (values: { account: string; password: string }) => {
    setLoading(true)

    // 体验模式：admin / admin123 直接放行
    if (values.account === 'admin' && values.password === 'admin123') {
      const user = { ...ADMIN_USER, last_login: new Date().toISOString() }
      localStorage.setItem('deepfmt_current_user', JSON.stringify(user))
      localStorage.setItem('deepfmt_initialized', 'true')
      message.success('体验模式登录成功，欢迎管理员')
      window.location.href = '/dashboard'
      return
    }

    message.error('账号或密码错误，请使用 admin / admin123')
    setLoading(false)
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
          <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>DeepFMT</div>
          <div style={{ fontSize: 16, marginBottom: 40, opacity: 0.9 }}>肠菌移植诊疗服务系统</div>
          <div style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.85 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>高效管理患者数据</div>
              <div>集中管理患者档案、治疗记录与随访数据</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>智能化随访追踪</div>
              <div>自动生成随访计划，实时监控康复进度</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>科学统计分析</div>
              <div>多维度数据报表，辅助临床决策</div>
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
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 }}>管理员登录</div>
            <div style={{ fontSize: 14, color: '#666' }}>请输入账号密码以访问管理后台</div>
          </div>

          <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item name="account" rules={[{ required: true, message: '请输入管理员账号' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#07C160' }} />}
                placeholder="请输入管理员账号"
                size="large"
                style={{ borderRadius: 8 }}
                autoComplete="off"
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#07C160' }} />}
                placeholder="请输入密码"
                size="large"
                style={{ borderRadius: 8 }}
                autoComplete="new-password"
              />
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

            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: '#f0fdf4',
              borderRadius: 8,
              border: '1px solid #bbf7d0',
              fontSize: 13,
              color: '#166534',
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>体验账号</div>
              <div>账号：<strong>admin</strong>&nbsp;&nbsp;密码：<strong>admin123</strong></div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login
