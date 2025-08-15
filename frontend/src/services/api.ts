import axios from "axios"

// Define types manually to avoid axios type import issues
interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    interceptors: {
        request: {
            use: (onFulfilled: (config: AxiosRequestConfig) => AxiosRequestConfig, onRejected?: (error: AxiosError) => Promise<AxiosError>) => void;
        };
        response: {
            use: (onFulfilled: (response: AxiosResponse) => AxiosResponse, onRejected?: (error: AxiosError) => Promise<any>) => void;
        };
    };
}
type AxiosRequestConfig = any;
type AxiosResponse<T = any> = {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
};
type AxiosError = {
    response?: {
        status: number;
        data: any;
    };
    config?: AxiosRequestConfig;
    message: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Type definitions based on your backend API and Prisma schema
export interface User {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
}

export interface AuthResponse {
    message: string;
    user: User;
}

export interface RefreshResponse {
    message: string;
}

export interface UserResponse {
    user: User;
}

export interface ErrorResponse {
    message?: string;
    error?: string;
}

type RefreshSubscriber = () => void;

// Extend AxiosRequestConfig to include our custom _retry property
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    headers?: any;
}

class ApiClient {
    private isRefreshing: boolean;
    private refreshSubscribers: RefreshSubscriber[];
    private instance: AxiosInstance;

    constructor() {
        this.isRefreshing = false;
        this.refreshSubscribers = [];

        this.instance = (axios as any).create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            withCredentials: true, // Critical: Always send cookies with requests
            headers: {
                "Content-Type": "application/json",
            }
        })

        this.setupInterceptors()
    }

    private setupInterceptors(): void {
        // Response interceptor - Handle token refresh automatically
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response, // Pass through successful responses
            async (error: AxiosError) => {
                const originalRequest = error.config as ExtendedAxiosRequestConfig;

                // Check if it's a 401 error and we haven't already tried to refresh
                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;

                    // If already refreshing, queue this request
                    if (this.isRefreshing) {
                        return new Promise<AxiosResponse>((resolve) => {
                            this.refreshSubscribers.push(() => {
                                resolve(this.instance(originalRequest))
                            })
                        })
                    }

                    // Start refresh process
                    this.isRefreshing = true;

                    try {
                        // Call refresh endpoint - cookies are sent automatically with withCredentials: true
                        await this.instance.post<RefreshResponse>("/auth/refresh")

                        // Process queued requests
                        this.refreshSubscribers.forEach((callback: RefreshSubscriber) => callback());
                        this.refreshSubscribers = [];

                        // Retry original request - cookies will be sent automatically
                        return this.instance(originalRequest)

                    } catch (refreshError) {
                        console.error("Token refresh failed:", refreshError)

                        // Clear any stored auth state in context
                        this.refreshSubscribers = [];

                        // Redirect to login page
                        window.location.href = "/login"
                        return Promise.reject(refreshError)

                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error)
            }
        )
    }


    get<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
        return this.instance.get<T>(url, config)
    }

    post<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
        return this.instance.post<T>(url, data, config)
    }

    put<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
        return this.instance.put<T>(url, data, config)
    }

    delete<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
        return this.instance.delete<T>(url, config)
    }

    patch<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
        return this.instance.patch<T>(url, data, config)
    }
}

const api = new ApiClient();
export default api;