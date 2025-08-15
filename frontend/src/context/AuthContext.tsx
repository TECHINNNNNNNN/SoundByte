import { createContext, useContext, useState, useEffect } from "react";
import api, { type User, type AuthResponse, type UserResponse } from '../services/api'

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Check authentication status
    const checkAuth = async () => {
        try {
            // Try to get user info - cookies will be sent automatically
            const response = await api.get<UserResponse>("/auth/me")
            setUser(response.data.user)
            setIsAuthenticated(true)
        } catch (error) {
            // User is not authenticated or tokens are invalid
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    // Initialize auth state on app load
    useEffect(() => {
        const initAuth = async () => {
            await checkAuth()
            setIsLoading(false)
        }
        initAuth()
    }, [])

    // Handle login (email/password)
    const login = async (email: string, password: string) => {
        try {
            const response = await api.post<AuthResponse>("/auth/login", { email, password })
            const { user } = response.data

            setUser(user)
            setIsAuthenticated(true)

            return { success: true }
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Login failed"
            }
        }
    }

    // Handle registration
    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
            const { user } = response.data

            setUser(user)
            setIsAuthenticated(true)

            return { success: true }
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Registration failed"
            }
        }
    }

    // Handle logout
    const logout = async () => {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            console.error("Error logging out:", error)
        } finally {
            // Clear auth state
            setIsAuthenticated(false)
            setUser(null)
        }
    }

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}