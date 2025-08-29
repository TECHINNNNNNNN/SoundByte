import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tokenManager } from "../services/tokenManager";
import api from "../services/api";
import SoundByteLoader from "./SoundByteLoader";

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const hasExchangedCode = useRef(false);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const success = searchParams.get("success");
            const error = searchParams.get("error");

            if (error) {
                console.error('OAuth authentication failed:', error);
                navigate('/login');
                return;
            }

            if (success === "true") {
                // Check if we have an auth code to exchange for tokens
                const authCode = searchParams.get("code");

                if (authCode && !hasExchangedCode.current) {
                    // Mark as attempted immediately to prevent double execution
                    hasExchangedCode.current = true;

                    // Exchange auth code for tokens (for cross-domain support)
                    try {
                        const response = await api.post('/auth/exchange', { code: authCode });
                        if (response.data.accessToken && response.data.refreshToken) {
                            tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
                        }

                        // Now fetch user info and update auth state after successful exchange
                        await checkAuth();
                        navigate('/dashboard');
                    } catch (error: any) {
                        console.error('Failed to exchange auth code or get user info:', error);
                        // Try one more time after a short delay (cookies might need time to propagate)
                        setTimeout(async () => {
                            try {
                                await checkAuth();
                                navigate('/dashboard');
                            } catch (retryError) {
                                console.error('Retry failed:', retryError);
                                navigate('/login');
                            }
                        }, 1000);
                    }
                }
            } else {
                navigate('/login');
            }
        }

        handleOAuthCallback();
    }, [searchParams, navigate, checkAuth])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6">
            <div className="text-center">
                <SoundByteLoader size="large" message="Completing authentication..." />
                <p className="mt-6 text-sm text-gray-500">You’ll be redirected to your dashboard shortly.</p>
            </div>
        </div>
    );
}

export default AuthCallback;