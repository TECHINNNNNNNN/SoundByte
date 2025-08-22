import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SoundByteIcon from '../components/SoundByteIcon'
import GradientMesh from '../components/GradientMesh'
import { useSubscription } from '../hooks/useSubscription'
import { createCheckoutSession, createPortalSession } from '../services/stripe'

const Profile = () => {
  const { user } = useAuth()
  const location = useLocation()
  const {
    isLoading,
    hasSubscription,
    remainingTokens,
    tokenLimit,
    percentageUsed,
    refetch
  } = useSubscription()
  console.log(hasSubscription)

  // Refresh subscription data when returning from payment
  useEffect(() => {
    // Check if we're coming back from a successful payment
    const params = new URLSearchParams(location.search)
    if (params.get('payment') === 'success' || params.get('session_id')) {
      // Wait a moment for webhooks to process, then refresh
      refetch()
    }
  }, [location])

  const handleUpgrade = async () => {
    try {
      const checkoutUrl = await createCheckoutSession()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    }
  }

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await createPortalSession()
      window.location.href = portalUrl
    } catch (error) {
      console.error('Failed to create portal session:', error)
      alert('Failed to open subscription management. Please try again.')
    }
  }

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
          <div className="relative z-10 rounded-2xl bg-white border border-white/20 ring-1 ring-white/10 shadow-soft p-8 card-hover">
            <div className="absolute top-4 right-4 flex items-center gap-2 select-none">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] ring-1 ring-white/40" aria-hidden="true"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] ring-1 ring-white/40" aria-hidden="true"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f] ring-1 ring-white/40" aria-hidden="true"></span>
            </div>
            <h2 className="text-2xl font-semibold mb-6">Your Profile</h2>

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

            {/* Subscription Section */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <h3 className="text-lg font-semibold mb-4">Subscription</h3>

              {isLoading ? (
                <p className="text-gray-600">Loading subscription data...</p>
              ) : (
                <div className="space-y-4">
                  {/* Subscription Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Status:</span>
                    <span className={`font-semibold ${hasSubscription ? 'text-green-600' : 'text-gray-600'}`}>
                      {hasSubscription ? 'Pro (Active)' : 'Free'}
                    </span>
                  </div>

                  {/* Token Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Token Usage:</span>
                      <span className="text-sm text-gray-600">
                        {tokenLimit - remainingTokens} / {tokenLimit} tokens
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${percentageUsed > 80 ? 'bg-red-500' :
                          percentageUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      />
                    </div>

                    {percentageUsed > 80 && (
                      <p className="text-sm text-red-600 mt-1">
                        Warning: You've used {percentageUsed}% of your monthly tokens
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {hasSubscription ? (
                      <button
                        onClick={handleManageSubscription}
                        className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:shadow-glow hover:scale-[1.02] transform cursor-pointer transition"
                      >
                        Manage Subscription
                      </button>
                    ) : (
                      <button
                        onClick={handleUpgrade}
                        className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-glow hover:scale-[1.02] transform cursor-pointer transition"
                      >
                        Upgrade to Pro ($19.99/month)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:shadow-glow hover:scale-[1.02] transform cursor-pointer transition">
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