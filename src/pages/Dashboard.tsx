import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined, SmileOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface TreatmentRecord {
  key: string
  patientName: string
  treatmentDate: string
  status: string
  score: number
}

const recentRecords: TreatmentRecord[] = [
  { key: '1', patientName: '张三', treatmentDate: '2024-01-15', status: '治疗中', score: 85 },
  { key: '2', patientName: '李四', treatmentDate: '2024-01-14', status: '已完成', score: 92 },
  { key: '3', patientName: '王五', treatmentDate: '2024-01-14', status: '随访中', score: 78 },
  { key: '4', patientName: '赵六', treatmentDate: '2024-01-13', status: '已完成', score: 88 },
  { key: '5', patientName: '钱七', treatmentDate: '2024-01-13', status: '治疗中', score: 80 },
]

const columns: ColumnsType<TreatmentRecord> = [
  {
    title: '患者姓名',
    dataIndex: 'patientName',
    key: 'patientName',
  },
  {
    title: '治疗日期',
    dataIndex: 'treatmentDate',
    key: 'treatmentDate',
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
    title: '评分',
    dataIndex: 'score',
    key: 'score',
    sorter: (a, b) => a.score - b.score,
  },
]

const Dashboard = () => {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>数据概览</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="患者总数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="治疗中"
              value={156}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={892}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="随访完成"
              value={680}
              prefix={<SmileOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近治疗记录" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={recentRecords}
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default Dashboard
