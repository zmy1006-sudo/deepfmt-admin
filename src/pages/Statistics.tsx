import { useState, useEffect } from 'react'
import { Card, Col, Row, Statistic, Typography, Progress } from 'antd'
import { RiseOutlined, StarOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons'
import { api, FollowupRecord } from '../lib/api'

const { Title } = Typography

const Statistics = () => {
  const [records, setRecords] = useState<FollowupRecord[]>([])

  useEffect(() => { setRecords(api.getFollowupRecords()) }, [])

  const total = records.length
  const completed = records.filter(r => r.status === '已提交' || r.status === '已查看').length
  const submitted = records.filter(r => r.status !== '待填写').length
  const improved = records.filter(r => r.total_score >= 60).length

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const improvementRate = submitted > 0 ? Math.round((improved / submitted) * 100) : 0
  const avgScore = submitted > 0 ? Math.round(records.filter(r => r.status !== '待填写').reduce((s, r) => s + r.total_score, 0) / submitted) : 0

  // 简单柱状图（按月份模拟）
  const chartData = [
    { label: '1月', value: 85 },
    { label: '2月', value: 72 },
    { label: '3月', value: 91 },
    { label: '4月', value: 68 },
    { label: '5月', value: 78 },
  ]
  const maxVal = Math.max(...chartData.map(d => d.value))

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>统计分析</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable><Statistic title="随访完成率" value={completionRate} suffix="%" prefix={<CalendarOutlined />} valueStyle={{ color: '#07C160' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable><Statistic title="改善率（≥60分）" value={improvementRate} suffix="%" prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable><Statistic title="平均评分" value={avgScore} prefix={<StarOutlined />} valueStyle={{ color: '#faad14' }} precision={0} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable><Statistic title="总记录数" value={total} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="各月完成率趋势">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, paddingBottom: 8 }}>
              {chartData.map(d => (
                <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 12, marginBottom: 4, color: '#666' }}>{d.value}%</div>
                  <div style={{ width: '100%', maxWidth: 48, background: '#07C160', borderRadius: '4px 4px 0 0', height: `${(d.value / maxVal) * 150}px`, transition: 'height 0.3s' }} />
                  <div style={{ fontSize: 12, marginTop: 4, color: '#999' }}>{d.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="改善率统计">
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>改善率</span><span style={{ color: '#52c41a', fontWeight: 600 }}>{improvementRate}%</span>
              </div>
              <Progress percent={improvementRate} strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>完成率</span><span style={{ color: '#07C160', fontWeight: 600 }}>{completionRate}%</span>
              </div>
              <Progress percent={completionRate} strokeColor="#07C160" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>总提交数</span><span style={{ color: '#1890ff', fontWeight: 600 }}>{submitted}</span>
              </div>
              <Progress percent={submitted > 0 ? 100 : 0} strokeColor="#1890ff" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Statistics
