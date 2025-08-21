import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎧 SoundByte</h1>
          <div className="space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/playground')}
                  className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white/10"
                >
                  Playground
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-white hover:text-gray-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your News,<br />
            Delivered as Audio
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Subscribe to topics you care about. Get personalized audio digests 
            delivered to your inbox daily, weekly, or monthly.
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            {user ? 'Go to Dashboard' : 'Start Free Trial'}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-white">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Personalized Topics</h3>
            <p className="text-purple-100">
              Choose exactly what news and topics you want to hear about
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-white">
            <div className="text-3xl mb-4">🎙️</div>
            <h3 className="text-xl font-bold mb-2">Podcast-Style Audio</h3>
            <p className="text-purple-100">
              Natural conversations between AI hosts discussing your topics
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-white">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Your Schedule</h3>
            <p className="text-purple-100">
              Daily, weekly, or monthly delivery at your preferred time
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h3>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 mx-auto mb-4">
              1
            </div>
            <p className="text-white font-semibold">Choose Topics</p>
            <p className="text-purple-100 text-sm mt-2">
              Select what interests you
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 mx-auto mb-4">
              2
            </div>
            <p className="text-white font-semibold">Set Schedule</p>
            <p className="text-purple-100 text-sm mt-2">
              Pick frequency & time
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 mx-auto mb-4">
              3
            </div>
            <p className="text-white font-semibold">We Generate</p>
            <p className="text-purple-100 text-sm mt-2">
              AI creates your audio digest
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 mx-auto mb-4">
              4
            </div>
            <p className="text-white font-semibold">Listen Anywhere</p>
            <p className="text-purple-100 text-sm mt-2">
              Get audio in your inbox
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Listening?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands who get their news delivered as personalized audio digests.
            No credit card required.
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            {user ? 'Create Your First Digest' : 'Start Free Today'}
          </button>
        </div>
      </div>
    </div>
  )
}