import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import FollowUp from './pages/FollowUp'
import Content from './pages/Content'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import { initStorage } from './lib/storage'
import './App.css'

// 初始化localStorage数据
initStorage()

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="followup" element={<FollowUp />} />
            <Route path="content" element={<Content />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
