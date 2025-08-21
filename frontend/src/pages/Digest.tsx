import { useParams, useNavigate } from "react-router-dom";
import digestService from "../services/digest.service";
import { useEffect, useState } from "react";
import type { Digest } from "../services/digest.service";
import GradientMesh from "../components/GradientMesh";
import SoundByteIcon from "../components/SoundByteIcon";

const Digest = () => {
    const { digestId } = useParams();
    const navigate = useNavigate();
    const [digest, setDigest] = useState<Digest | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

    const deliveries = digest?.deliveries || [];

    useEffect(() => {
        setIsLoading(true);
        const fetchDigest = async () => {
            try {
                const digest = await digestService.getDigest(digestId as string);
                setDigest(digest);
            } catch (error) {
                console.error('Failed to fetch digest:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDigest();
    }, [digestId])

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-purple-400"></div>
                </div>
            </div>
        );
    }

    if (!digest) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Digest not found</h2>
                <p className="text-gray-600 mb-6">This digest may have been deleted or doesn't exist.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all duration-200"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <GradientMesh />

            {/* Header Navigation */}
            <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Album Header */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Album Art */}
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 shadow-glow flex items-center justify-center">
                            <SoundByteIcon size={200} animated={true} />
                        </div>

                        {/* Album Info */}
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-2">Audio Digest</p>
                            <h1 className="text-4xl md:text-5xl font-black text-gradient mb-4">{digest.title}</h1>
                            <p className="text-lg text-gray-600 mb-6">"{digest.searchQuery}"</p>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Frequency:</span>
                                    <span className="font-semibold text-gray-700">{digest.frequency}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="font-semibold text-gray-700">{digest.audioLength} min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Episodes:</span>
                                    <span className="font-semibold text-gray-700">{deliveries.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${digest.isActive
                                        ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-700 border border-green-200'
                                        : 'bg-gray-100/80 text-gray-600 border border-gray-200'
                                        }`}>
                                        {digest.isActive ? 'Active' : 'Paused'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Track List */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Episodes</h2>

                    {deliveries.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🎵</div>
                            <p className="text-gray-600 text-lg">No episodes yet</p>
                            <p className="text-gray-500 text-sm mt-2">Episodes will appear here once generated</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {deliveries.map((delivery, index) => (
                                <div
                                    key={delivery.id}
                                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                                >
                                    {/* Track Number */}
                                    <div className="w-10 h-10 flex items-center justify-center text-gray-400 font-bold">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>

                                    {/* Play Button */}
                                    <button
                                        onClick={() => setSelectedTrack(delivery.id)}
                                        className={`w-12 h-12 rounded-full text-white flex items-center justify-center hover:shadow-glow transition-all duration-200 group-hover:scale-110 ${selectedTrack === delivery.id
                                            ? 'bg-gradient-to-r from-green-300 to-emerald-300'
                                            : 'bg-gradient-to-r from-purple-300 to-pink-300'
                                            }`}
                                    >
                                        {selectedTrack === delivery.id ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 12l-4.463 4.969-4.537-4.969h3c0-4.97 4.03-9 9-9 2.395 0 4.565.942 6.179 2.468l-2.004 2.231c-1.081-1.05-2.553-1.699-4.175-1.699-3.309 0-6 2.691-6 6h3zm10.463-4.969l-4.463 4.969h3c0 3.309-2.691 6-6 6-1.623 0-3.094-.65-4.175-1.699l-2.004 2.231c1.613 1.526 3.784 2.468 6.179 2.468 4.97 0 9-4.03 9-9h3l-4.537-4.969z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Track Info */}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                                            Episode {index + 1}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(delivery.createdAt).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    {/* Duration */}
                                    <div className="text-sm text-gray-500">
                                        {digest.audioLength} min
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Audio Player */}
                    {selectedTrack && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-600">Now Playing</p>
                                    <p className="font-semibold text-gray-900">
                                        Episode {deliveries.findIndex(d => d.id === selectedTrack) + 1}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedTrack(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <audio
                                controls
                                className="w-full"
                                src={deliveries.find(d => d.id === selectedTrack)?.audioUrl}
                                autoPlay
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Digest;