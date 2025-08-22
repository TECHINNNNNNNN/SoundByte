import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import SoundByteIcon from '../components/SoundByteIcon'
import GradientMesh from '../components/GradientMesh'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen relative">
      <GradientMesh />
      {/* Navigation */}
      <nav className="">
        <div className="container mx-auto px-16">
          <div className="flex justify-between items-center">
            <Link to="/dashboard">
              <SoundByteIcon size={100} animated={true} />
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-600 bg-pink-100 px-4 py-2 rounded-xl hover:shadow-glow hover:scale-[1.02] transform cursor-pointer transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Glassmorphism card container
             PURPOSE: Creates a translucent, blurred card with soft borders and subtle shadows
             UX: Adds macOS-style traffic light dots at the top-right for familiar OS chrome
             NOTE: Uses only Tailwind utilities and our custom shadow helpers for compatibility */}
          <div className="relative rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 ring-1 ring-white/10 shadow-soft p-8 card-hover">
            {/* macOS-style traffic lights (top-right as requested) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 select-none">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] ring-1 ring-white/40" aria-hidden="true"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] ring-1 ring-white/40" aria-hidden="true"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f] ring-1 ring-white/40" aria-hidden="true"></span>
            </div>
            <h2 className="text-2xl font-semibold mb-6">Your Profile</h2>

            {/* Avatar */}
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{user?.name || 'User'}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <div className="border-t pt-4 border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-800">{user?.name || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-800">{user?.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <button className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-glow hover:scale-[1.02] transform cursor-pointer transition">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile