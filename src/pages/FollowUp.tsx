import { Table, Tag, Typography, Select, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Option } = Select

interface FollowUpRecord {
  key: string
  patientName: string
  followUpDate: string
  symptomImprovement: string
  score: number
  nextFollowUpDate: string
  status: string
}

const mockFollowUps: FollowUpRecord[] = [
  { key: '1', patientName: '张三', followUpDate: '2024-01-15', symptomImprovement: '显著改善', score: 90, nextFollowUpDate: '2024-01-22', status: '已完成' },
  { key: '2', patientName: '李四', followUpDate: '2024-01-14', symptomImprovement: '明显改善', score: 82, nextFollowUpDate: '2024-01-21', status: '待随访' },
  { key: '3', patientName: '王五', followUpDate: '2024-01-13', symptomImprovement: '有所改善', score: 75, nextFollowUpDate: '2024-01-20', status: '已完成' },
  { key: '4', patientName: '赵六', followUpDate: '2024-01-12', symptomImprovement: '显著改善', score: 88, nextFollowUpDate: '2024-01-19', status: '已完成' },
  { key: '5', patientName: '钱七', followUpDate: '2024-01-11', symptomImprovement: '无明显变化', score: 60, nextFollowUpDate: '2024-01-18', status: '待随访' },
]

const FollowUp = () => {
  const columns: ColumnsType<FollowUpRecord> = [
    {
      title: '患者姓名',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: '随访日期',
      dataIndex: 'followUpDate',
      key: 'followUpDate',
    },
    {
      title: '症状改善状态',
      dataIndex: 'symptomImprovement',
      key: 'symptomImprovement',
      render: (improvement: string) => {
        const colorMap: Record<string, string> = {
          '显著改善': 'green',
          '明显改善': 'blue',
          '有所改善': 'cyan',
          '无明显变化': 'orange',
          '恶化': 'red',
        }
        return <Tag color={colorMap[improvement] || 'default'}>{improvement}</Tag>
      },
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: '下次随访日期',
      dataIndex: 'nextFollowUpDate',
      key: 'nextFollowUpDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === '已完成' ? 'green' : 'orange'
        return <Tag color={color}>{status}</Tag>
      },
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>随访管理</Title>
        <Space>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部状态</Option>
            <Option value="completed">已完成</Option>
            <Option value="pending">待随访</Option>
          </Select>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={mockFollowUps}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}

export default FollowUp
