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
import PaymentSuccess from './pages/Payment/Success'
import PaymentCanceled from './pages/Payment/Canceled'
import { Toaster } from 'react-hot-toast'
import './index.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#374151',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              fontWeight: '500',
            },
            success: {
              style: {
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #86efac',
                color: '#166534',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f0fdf4',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1px solid #fca5a5',
                color: '#991b1b',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fef2f2',
              },
            },
            loading: {
              style: {
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                border: '1px solid #d8b4fe',
                color: '#6b21a8',
              },
              iconTheme: {
                primary: '#a855f7',
                secondary: '#faf5ff',
              },
            },
          }}
        />
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
            
            {/* Payment routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/canceled" element={<PaymentCanceled />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App