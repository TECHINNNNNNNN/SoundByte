import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import AuthCallback from './components/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import DigestDashboard from './pages/DigestDashboard'
import ChatLayout from './components/Layout/ChatLayout'
import ChatInterface from './components/Chat/ChatInterface'
import Digest from './pages/Digest'
import './index.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* Main digest dashboard */}
            <Route path="/dashboard" element={<DigestDashboard />} />
            <Route path="/digest/:digestId" element={<Digest />} />

            {/* Playground - existing chat interface */}
            <Route path="/playground" element={<ChatLayout />}>
              <Route index element={<ChatInterface />} />
              <Route path="chat/:conversationId" element={<ChatInterface />} />
            </Route>

            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App