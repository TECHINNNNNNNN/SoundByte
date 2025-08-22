import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import SoundByteIcon from '../components/SoundByteIcon'
import GradientMesh from '../components/GradientMesh'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <GradientMesh />
      {/* Navigation */}
      <nav className="">
        <div className="container mx-auto px-16">
          <div className="flex justify-between items-center">
            <SoundByteIcon size={100} animated={true} />
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
          <div className="bg-white/25 backdrop-blur-3xl rounded-2xl shadow p-6">
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
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 cursor-pointer transition">
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