import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
                // Tokens are already set as cookies by the backend
                // Just need to fetch user info and update auth state
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