import { Card, Col, Row, Statistic, Typography, Table, Progress } from 'antd'
import { RiseOutlined, StarOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface MonthlyData {
  key: string
  month: string
  newPatients: number
  completedTreatments: number
  followUpCount: number
  effectivenessRate: number
}

const monthlyData: MonthlyData[] = [
  { key: '1', month: '2024-01', newPatients: 85, completedTreatments: 72, followUpCount: 156, effectivenessRate: 92 },
  { key: '2', month: '2023-12', newPatients: 78, completedTreatments: 65, followUpCount: 142, effectivenessRate: 88 },
  { key: '3', month: '2023-11', newPatients: 92, completedTreatments: 78, followUpCount: 168, effectivenessRate: 90 },
  { key: '4', month: '2023-10', newPatients: 68, completedTreatments: 58, followUpCount: 125, effectivenessRate: 85 },
  { key: '5', month: '2023-09', newPatients: 75, completedTreatments: 62, followUpCount: 138, effectivenessRate: 87 },
]

const columns: ColumnsType<MonthlyData> = [
  {
    title: '月份',
    dataIndex: 'month',
    key: 'month',
  },
  {
    title: '本月新增',
    dataIndex: 'newPatients',
    key: 'newPatients',
    sorter: (a, b) => a.newPatients - b.newPatients,
  },
  {
    title: '完成治疗',
    dataIndex: 'completedTreatments',
    key: 'completedTreatments',
    sorter: (a, b) => a.completedTreatments - b.completedTreatments,
  },
  {
    title: '随访次数',
    dataIndex: 'followUpCount',
    key: 'followUpCount',
    sorter: (a, b) => a.followUpCount - b.followUpCount,
  },
  {
    title: '有效率',
    dataIndex: 'effectivenessRate',
    key: 'effectivenessRate',
    render: (rate: number) => (
      <Progress percent={rate} size="small" status={rate >= 90 ? 'success' : rate >= 80 ? 'normal' : 'exception'} />
    ),
    sorter: (a, b) => a.effectivenessRate - b.effectivenessRate,
  },
]

const Statistics = () => {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>统计分析</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="有效率"
              value={89}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均评分"
              value={85.6}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="随访次数"
              value={1256}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月新增"
              value={85}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="月度统计" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={monthlyData}
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default Statistics
