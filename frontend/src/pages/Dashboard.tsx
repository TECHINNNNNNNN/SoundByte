import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import GradientMesh from '../components/GradientMesh'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen relative">
      <GradientMesh />
      
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-black text-gradient flex items-center gap-3">
              <span className="text-4xl animate-pulse">🎧</span>
              SoundByte
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 text-purple-700 font-medium rounded-full hover:bg-purple-50 transition-all duration-200 hover:shadow-soft"
              >
                Digests
              </button>
              <button
                onClick={() => navigate('/playground')}
                className="px-6 py-2.5 text-purple-700 font-medium rounded-full hover:bg-purple-50 transition-all duration-200 hover:shadow-soft"
              >
                Playground
              </button>
              <Link 
                to="/profile" 
                className="px-6 py-2.5 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all duration-200"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium hover:shadow-glow transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gradient">
                Welcome back, {user?.name || user?.email?.split('@')[0]}!
              </h2>
              <p className="text-gray-600 mt-2">
                Ready to explore today's audio content?
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Digest Dashboard Card */}
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-left hover:shadow-glow transform hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-4 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
              <span className="text-2xl">📰</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 mb-2">
              Audio Digests
            </h3>
            <p className="text-gray-600 text-sm">
              Set up automated audio summaries delivered to your inbox daily, weekly, or monthly.
            </p>
            <div className="mt-4 text-purple-600 font-medium text-sm flex items-center gap-1">
              Manage digests
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Playground Card */}
          <button
            onClick={() => navigate('/playground')}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-left hover:shadow-glow transform hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 mb-2">
              Chat Playground
            </h3>
            <p className="text-gray-600 text-sm">
              Ask questions about current events and get instant audio summaries powered by AI.
            </p>
            <div className="mt-4 text-purple-600 font-medium text-sm flex items-center gap-1">
              Start chatting
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Profile Card */}
          <button
            onClick={() => navigate('/profile')}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-left hover:shadow-glow transform hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mb-4 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 mb-2">
              Your Profile
            </h3>
            <p className="text-gray-600 text-sm">
              Manage your account settings, preferences, and subscription details.
            </p>
            <div className="mt-4 text-purple-600 font-medium text-sm flex items-center gap-1">
              View profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-gradient">0</div>
            <p className="text-gray-600 text-sm mt-1">Active Digests</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-gradient">0</div>
            <p className="text-gray-600 text-sm mt-1">Audio Generated</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-gradient">0</div>
            <p className="text-gray-600 text-sm mt-1">Conversations</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard