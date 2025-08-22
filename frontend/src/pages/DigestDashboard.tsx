import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import digestService, { type Digest, type CreateDigestDto } from '../services/digest.service'
import GradientMesh from '../components/GradientMesh'
import SoundByteIcon from '../components/SoundByteIcon'
import AudioPlayer from '../components/AudioPlayer'

export default function DigestDashboard() {
  const [digests, setDigests] = useState<Digest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState<CreateDigestDto>({
    title: '',
    searchQuery: '',
    frequency: 'daily',
    audioLength: 5,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredHour: 9,
    useDefaultEmail: true
  })

  useEffect(() => {
    fetchDigests()
  }, [])

  const fetchDigests = async () => {
    try {
      const data = await digestService.getDigests()
      setDigests(data)
    } catch (error) {
      console.error('Failed to fetch digests:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDigest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await digestService.createDigest(formData)
      setShowForm(false)
      setFormData({
        title: '',
        searchQuery: '',
        frequency: 'daily',
        audioLength: 5,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredHour: 9,
        useDefaultEmail: true
      })
      fetchDigests()
    } catch (error) {
      console.error('Failed to create digest:', error)
    }
  }

  const deleteDigest = async (id: string) => {
    if (!confirm('Delete this digest?')) return
    try {
      await digestService.deleteDigest(id)
      fetchDigests()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const toggleActive = async (digest: Digest) => {
    try {
      await digestService.updateDigest(digest.id, { isActive: !digest.isActive })
      fetchDigests()
    } catch (error) {
      console.error('Failed to update:', error)
    }
  }

  const generateNow = async (digestId: string) => {
    try {
      setGeneratingId(digestId)
      await digestService.generateDigest(digestId)

      // Refresh to show new delivery
      await fetchDigests()

      // Show success message
      alert(`Digest generated successfully! Audio has been sent to your email.`)
    } catch (error) {
      console.error('Failed to generate:', error)
      alert('Failed to generate digest. Please try again.')
    } finally {
      setGeneratingId(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-purple-400"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative">
      <GradientMesh />
      {/* Header */}
      <div className="backdrop-blur-3xl border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-gradient flex items-center gap-3">
              <SoundByteIcon size={150} animated={true} />
              SoundByte
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/playground')}
                className="px-6 py-2.5 text-purple-700 font-medium rounded-full bg-purple-50 transition-all duration-200 hover:shadow-glow hover:scale-[1.02] transform cursor-pointer"
              >
                Playground
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-2.5 text-gray-700 font-medium rounded-full bg-pink-50 transition-all duration-200 hover:shadow-glow hover:scale-[1.02] transform cursor-pointer"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-black text-gradient mb-6">Create Audio Digest</h2>
            <form onSubmit={createDigest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AI News Daily"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What to search for</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., artificial intelligence breakthroughs"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  value={formData.searchQuery}
                  onChange={(e) => setFormData({ ...formData, searchQuery: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Audio Length</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    value={formData.audioLength}
                    onChange={(e) => setFormData({ ...formData, audioLength: Number(e.target.value) })}
                  >
                    <option value="2">2 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    value={formData.preferredHour}
                    onChange={(e) => setFormData({ ...formData, preferredHour: Number(e.target.value) })}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm cursor-not-allowed"
                    value={formData.timezone}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-glow transform hover:scale-[1.02] transition-all duration-200"
                >
                  Create Digest
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Digests Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Digest Card */}

          {/* Existing Digests */}
          {digests.map((digest) => {
            const latestDelivery = digest.deliveries?.[0]
            const isGenerating = generatingId === digest.id

            return (
              <div key={digest.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 card-hover group">
                <div
                  onClick={() => navigate(`/digest/${digest.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">{digest.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleActive(digest)
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${digest.isActive
                        ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-700 border border-green-200'
                        : 'bg-gray-100/80 text-gray-600 border border-gray-200'
                        }`}
                    >
                      {digest.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">"{digest.searchQuery}"</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Frequency:</span>
                      <span className="font-medium">{digest.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Length:</span>
                      <span className="font-medium">{digest.audioLength} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next delivery:</span>
                      <span className="font-medium">
                        {digest.nextGenerationAt
                          ? new Date(digest.nextGenerationAt).toLocaleDateString()
                          : 'Not scheduled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total deliveries:</span>
                      <span className="font-medium">{digest._count?.deliveries || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Audio Player for Latest Delivery - Outside clickable area */}
                {latestDelivery && latestDelivery.audioUrl && (
                  <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                    <AudioPlayer
                      src={latestDelivery.audioUrl}
                      title="Latest Episode"
                      subtitle={`Generated: ${new Date(latestDelivery.createdAt).toLocaleDateString()}`}
                      variant="compact"
                    />
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDigest(digest.id)
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      generateNow(digest.id)
                    }}
                    disabled={isGenerating}
                    className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-700 ${isGenerating
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-600  hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-soft cursor-pointer'
                      }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Now'
                    )}
                  </button>
                </div>
              </div>
            )
          })}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-h-[320px] flex flex-col items-center justify-center gap-4 hover:shadow-glow transform hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                <span className="text-4xl text-purple-600">+</span>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  Create New Digest
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Set up automated audio summaries
                </p>
              </div>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}