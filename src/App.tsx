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
import Login from './pages/Login'
import Video from './pages/Video'
import KnowledgeBase from './pages/KnowledgeBase'
import Medicine from './pages/Medicine'
import { ensureInitialized } from './lib/dataInit'
import './App.css'

// 初始化localStorage数据（懒加载）
ensureInitialized()

// 登录判断：localStorage 中是否有当前用户
const isLoggedIn = localStorage.getItem('deepfmt_current_user') !== null

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 登录页 */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          {/* 受保护的路由 */}
          <Route
            path="/"
            element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" replace />}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="followup" element={<FollowUp />} />
            <Route path="content" element={<Content />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="video" element={<Video />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="medicine" element={<Medicine />} />
          </Route>
          {/* 未匹配路由重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
