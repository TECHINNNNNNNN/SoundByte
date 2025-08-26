import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tokenManager } from "../services/tokenManager";
import api from "../services/api";

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();

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
                
                if (authCode) {
                    // Exchange auth code for tokens (for cross-domain support)
                    try {
                        const response = await api.post('/auth/exchange', { code: authCode });
                        if (response.data.accessToken && response.data.refreshToken) {
                            tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
                        }
                    } catch (error) {
                        console.error('Failed to exchange auth code:', error);
                    }
                }
                
                // Now fetch user info and update auth state
                try {
                    await checkAuth();
                    navigate('/dashboard');
                } catch (error) {
                    console.error('Failed to get user info after OAuth:', error);
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        }

        handleOAuthCallback();
    }, [searchParams, navigate, checkAuth])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
}

export default AuthCallback;