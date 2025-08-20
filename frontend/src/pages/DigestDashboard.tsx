import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import digestService, { type Digest, type CreateDigestDto } from '../services/digest.service'

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
      const result = await digestService.generateDigest(digestId)
      
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🎧 SoundByte Digests
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/playground')}
                className="px-4 py-2 text-purple-600 hover:text-purple-800"
              >
                Playground →
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition"
          >
            + Create New Audio Digest
          </button>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Create Audio Digest</h2>
            <form onSubmit={createDigest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AI News Daily"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">What to search for</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., artificial intelligence breakthroughs"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.searchQuery}
                  onChange={(e) => setFormData({...formData, searchQuery: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Audio Length</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.audioLength}
                    onChange={(e) => setFormData({...formData, audioLength: Number(e.target.value)})}
                  >
                    <option value="2">2 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Time</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.preferredHour}
                    onChange={(e) => setFormData({...formData, preferredHour: Number(e.target.value)})}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i-12} PM`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    value={formData.timezone}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Create Digest
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Digests List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {digests.map((digest) => {
            const latestDelivery = digest.deliveries?.[0]
            const isGenerating = generatingId === digest.id
            
            return (
              <div key={digest.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{digest.title}</h3>
                  <button
                    onClick={() => toggleActive(digest)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      digest.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
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

                {/* Audio Player for Latest Delivery */}
                {latestDelivery && latestDelivery.audioUrl && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Latest audio:</p>
                    <audio controls className="w-full">
                      <source src={latestDelivery.audioUrl} type="audio/wav" />
                      <source src={latestDelivery.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated: {new Date(latestDelivery.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex justify-between">
                  <button
                    onClick={() => deleteDigest(digest.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => generateNow(digest.id)}
                    disabled={isGenerating}
                    className={`text-sm font-medium ${
                      isGenerating 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-purple-600 hover:text-purple-800 cursor-pointer'
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
        </div>

        {digests.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No digests yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Create your first digest →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}