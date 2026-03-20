import { useState, useEffect } from 'react'
import { Card, Col, Row, Statistic, Typography, Table, Tag } from 'antd'
import {
  TeamOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api, User, FollowupRecord } from '../lib/api'

const { Title } = Typography

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([])
  const [followupRecords, setFollowupRecords] = useState<FollowupRecord[]>([])

  useEffect(() => {
    const loadData = () => {
      const userList = api.getUsers()
      const records = api.getFollowupRecords()
      setUsers(userList)
      setFollowupRecords(records)
    }
    loadData()
  }, [])

  const totalPatients = users.length
  const inTreatment = users.filter(u => u.treatment_status === '治疗中').length
  const completed = users.filter(u => u.treatment_status === '已完成').length
  const followupCompleted = followupRecords.filter(r => r.status === '已提交' || r.status === '已查看').length
  const followupPending = followupRecords.filter(r => r.status === '待填写').length

  const recentFollowups = [...followupRecords]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 5)

  const recentColumns: ColumnsType<FollowupRecord> = [
    {
      title: '患者',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId: string) => {
        const user = users.find(u => u.id === userId)
        return user?.name || userId
      },
    },
    {
      title: '治疗次数',
      dataIndex: 'treatment_count',
      key: 'treatment_count',
    },
    {
      title: '评分',
      dataIndex: 'total_score',
      key: 'total_score',
      render: (score: number) => (
        <Tag color={score >= 20 ? 'green' : score >= 15 ? 'blue' : 'orange'}>
          {score}分
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '已查看': 'green',
          '已提交': 'cyan',
          '待填写': 'orange',
        }
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
      },
    },
    {
      title: '提交时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>数据概览</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="患者总数" value={totalPatients} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="治疗中" value={inTreatment} prefix={<MedicineBoxOutlined />} valueStyle={{ color: '#07C160' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="已完成" value={completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="随访记录" value={followupCompleted} suffix={`/ ${followupRecords.length}`} prefix={<CalendarOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Card hoverable>
            <Statistic title="待填写随访" value={followupPending} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card hoverable>
            <Statistic title="随访完成率" value={followupRecords.length > 0 ? Math.round(followupCompleted / followupRecords.length * 100) : 0} suffix="%" prefix={<CalendarOutlined />} valueStyle={{ color: '#13c2c2' }} />
          </Card>
        </Col>
      </Row>
      <Card title="近期随访记录" style={{ marginTop: 24 }}>
        <Table columns={recentColumns} dataSource={recentFollowups} pagination={false} size="small" rowKey="id" />
      </Card>
    </div>
  )
}

export default Dashboard
