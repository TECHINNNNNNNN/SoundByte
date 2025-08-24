import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import LandingGradientMesh from '../components/LandingGradientMesh'
import SoundByteIcon from '../components/SoundByteIcon'
import AudioPlayer from '../components/AudioPlayer'
import {
  Target,
  Mic,
  Zap,
  Smartphone,
  Lock,
  Sparkles,
  Check
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [terminalText, setTerminalText] = useState('')
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)

  const terminalSequence = [
    { text: '> soundbyte init', delay: 500 },
    { text: '\nSetting up your digest...', delay: 1000 },
    { text: '\n\nTitle: Tech News Daily', delay: 800 },
    { text: '\nInterests: AI, Web Development, Cloud', delay: 1200 },
    { text: '\nFrequency: Daily at 8:00 AM', delay: 1000 },
    { text: '\n\nGenerating audio digest...', delay: 1500 },
    { text: '\n✓ Audio ready!', delay: 800, complete: true }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let currentText = ''

    const typeSequence = async () => {
      for (const item of terminalSequence) {
        await new Promise(resolve => setTimeout(resolve, item.delay))

        for (let i = 0; i < item.text.length; i++) {
          currentText += item.text[i]
          setTerminalText(currentText)
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        if (item.complete) {
          setTimeout(() => setShowAudioPlayer(true), 500)
        }
      }
    }

    typeSequence()
  }, [])

  return (
    <div className="min-h-screen relative">
      <LandingGradientMesh />

      {/* Navigation - Transparent at top, capsule glass when scrolled */}
      <nav className="fixed top-0 w-full z-50">
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'py-3' : 'py-1'}`}>
          <div className={`${scrolled ? 'max-w-3xl' : 'max-w-7xl'} mx-auto mt-5`}>
            <div className={`flex justify-between items-center h-16 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled
              ? 'rounded-full bg-white/50 backdrop-blur-xl border border-white/20 shadow-sm px-4'
              : 'border border-transparent'
              }`}>
              <div className="flex items-center gap-3">
                <SoundByteIcon size={150} animated={true} />
                <span className="text-lg font-semibold text-gray-900">SoundByte</span>
              </div>

              <div className="flex items-center gap-6">
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative group"
                    >
                      Dashboard
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
                    </button>
                    <button
                      onClick={() => navigate('/playground')}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative group"
                    >
                      Playground
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative group"
                    >
                      Sign In
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-105 transform"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split: headline & CTA (left), terminal preview (right) */}
      <section className="pt-32 pb-20 px-6 lg:px-8 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline + CTA */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05]">
                  <span className="block">News that</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">speaks to you</span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-xl">
                  Turn long reads into bite-sized, podcast-quality audio. Choose interests, set a schedule, hit play.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                  className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:shadow-xl hover:scale-105 transform"
                >
                  {user ? 'Create Your First Digest' : 'Start Free Trial'}
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full font-medium border border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all hover:scale-105 transform"
                >
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right: Fancy Terminal with typing. Audio player appears outside below to avoid layout shift */}
            <div className="relative group">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-purple-500/15 to-pink-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-gray-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono">soundbyte ~ terminal</span>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden="true" />
                  <div className="px-6 py-5 font-mono text-sm text-green-300 whitespace-pre-wrap min-h-[240px]">
                    {terminalText}
                    <span className="animate-pulse">_</span>
                  </div>
                </div>
              </div>

              {/* Reserved space below terminal for audio player */}
              <div className="mt-4">
                <div className="relative rounded-2xl border border-white/10 bg-gray-950/30 backdrop-blur-xl overflow-hidden shadow-xl transition-all">
                  <div className="min-h-[120px]">
                    {!showAudioPlayer ? (
                      <div className="p-4 animate-pulse">
                        <div className="h-4 w-40 bg-white/15 rounded mb-2" />
                        <div className="h-3 w-64 bg-white/10 rounded" />
                      </div>
                    ) : (
                      <div className="p-3">
                        <AudioPlayer
                          src="https://soundbyte-audio-news.s3.ap-southeast-2.amazonaws.com/audio/digest-cmek34uxk0003ufdig7n9nbuo-1755855975212.wav"
                          title="Tech News Daily"
                          subtitle="Your personalized audio digest"
                          variant="compact"
                          className="shadow-none"
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => navigate(user ? '/dashboard' : '/register')}
                            className="text-xs px-3 py-2 rounded-full border border-white/15 text-gray-200 hover:bg-white/10 transition-colors"
                          >
                            {user ? 'Generate New Digest' : 'Make My First Digest'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium, clean, subtle terminal motif wrapper */}
      <section id="features" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 hover:tracking-wide transition-all duration-300">
              Designed for listeners
            </h2>
            <p className="text-xl text-gray-600 hover:text-gray-900 transition-colors">
              Every feature crafted to make your audio experience exceptional.
            </p>
          </div>

          {/* Terminal-styled wrapper around features */}
          <div className="relative rounded-3xl border border-gray-200/70 bg-white/70 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/70">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/90" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/90" />
                <span className="w-3 h-3 rounded-full bg-green-400/90" />
              </div>
              <span className="text-xs text-gray-500 font-mono">features.sh</span>
            </div>

            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:tracking-wide transition-all">
                  Curated for You
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Select topics that matter to you. Our AI curates content from trusted sources, ensuring relevance and quality.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mic className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:tracking-wide transition-all">
                  Natural Voices
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience podcast-quality audio with AI hosts that sound natural, engaging, and easy to listen to.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:tracking-wide transition-all">
                  Smart Scheduling
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Daily, weekly, or monthly. Set your schedule and never miss what's important to you.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:tracking-wide transition-all">
                  Listen Anywhere
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Stream from any device. Download for offline listening. Your audio library, always accessible.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:tracking-wide transition-all">
                  Privacy First
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your preferences stay private. No tracking, no data selling. Just personalized audio for you.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:tracking-wide transition-all">
                  AI-Powered
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI creates engaging narratives from complex topics, making everything easy to understand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Clean steps with subtle terminal prompt motif */}
      <section className="py-20 px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 hover:tracking-wide transition-all duration-300">
              Simple as 1-2-3
            </h2>
            <p className="text-xl text-gray-600 hover:text-gray-900 transition-colors">
              Get started in minutes, not hours.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-6 items-start group rounded-2xl border border-gray-200/70 bg-white/80 backdrop-blur-xl p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:tracking-wide transition-all"><span className="font-mono text-gray-400 mr-2">$</span>Choose your interests</h3>
                <p className="text-lg text-gray-600">
                  Select from technology, business, science, culture, and more. Customize sources and topics to match your preferences perfectly.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start group rounded-2xl border border-gray-200/70 bg-white/80 backdrop-blur-xl p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:tracking-wide transition-all"><span className="font-mono text-gray-400 mr-2">$</span>Set your schedule</h3>
                <p className="text-lg text-gray-600">
                  Pick when you want to receive your audio digest. Morning commute? Lunch break? Evening wind-down? It's your choice.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start group rounded-2xl border border-gray-200/70 bg-white/80 backdrop-blur-xl p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:tracking-wide transition-all"><span className="font-mono text-gray-400 mr-2">$</span>Listen and enjoy</h3>
                <p className="text-lg text-gray-600">
                  Receive professionally produced audio content. Stream instantly or download for offline listening wherever you go.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean Apple style */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 hover:tracking-wide transition-all duration-300">
            Ready to transform
            <span className="block">how you consume news?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands who've already made the switch to audio.
            <span className="block mt-2">No credit card required. Cancel anytime.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="px-10 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:shadow-xl hover:scale-105 hover:tracking-wide text-lg transform"
            >
              {user ? 'Create Your First Digest' : 'Start Free Today'}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full font-medium border border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all text-lg hover:scale-105 transform"
            >
              Sign In
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2 hover:text-gray-700 transition-colors">
              <Check className="w-5 h-5 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2 hover:text-gray-700 transition-colors">
              <Check className="w-5 h-5 text-green-500" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2 hover:text-gray-700 transition-colors">
              <Check className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <SoundByteIcon size={24} animated={false} />
              <span className="text-sm text-gray-600">© 2024 SoundByte. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors relative group">
                Privacy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors relative group">
                Terms
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}