import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import session from "express-session"
import passport from "passport"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/auth.js"
import "./config/passport.js"
import cookieParser from "cookie-parser"
import conversationRoutes from "./routes/conversations.js"
import messageRoutes from "./routes/messages.js"
import aiRoutes from "./routes/ai.routes.js"
import digestRoutes from "./routes/digests.js"
import paymentRoutes from "./routes/payments.js"
import webhookRoutes from "./routes/webhooks.js"

dotenv.config()

// Catch unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // Do not exit; keep server alive during development for visibility
});

const app = express()
const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Very early health check (before any middleware)
app.get('/health', (_req, res) => {
    console.log('[HEALTH] /health hit')
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Simple request logger in development to verify requests reach Express
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        if (req.path !== '/health') {
            console.log(`[REQ] ${req.method} ${req.originalUrl}`)
        }
        next()
    })
}

// Rate limit only in production (avoid any chance of dev misbehavior)
if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_MAX || 2000),
        message: "Too many requests, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => req.method === 'OPTIONS' || req.path === '/health',
    })
    app.use(limiter)
}

// CORS: relax in development to eliminate preflight issues
if (process.env.NODE_ENV !== 'production') {
    app.use(cors({ origin: true, credentials: true }))
} else {
    app.use(cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true)
            const allowedOrigins = [process.env.CLIENT_URL || process.env.FRONTEND_URL].filter(Boolean)
            const isVercelPreview = origin && origin.includes('.vercel.app')
            if (allowedOrigins.includes(origin) || isVercelPreview) return callback(null, true)
            console.warn(`CORS blocked origin: ${origin}`)
            return callback(null, false)
        },
        credentials: true,
    }))
}

// webhooks need raw body
app.use("/api/webhooks", webhookRoutes)

// Note: additional dynamic CORS rules removed for development simplicity

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

// Session middleware
if (process.env.SESSION_SECRET) {
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }
    }))
} else {
    console.warn('⚠️  SESSION_SECRET not set - session middleware disabled')
}

app.use(passport.initialize())

app.use("/api/auth", authRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/conversations", messageRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/digests", digestRoutes)
app.use("/api/payments", paymentRoutes)


app.use((err, _req, res, _next) => {
    console.error("Error:", err)
    res.status(500).json({ message: "SoundByte API is currently experiencing issues. Please try again later." })
})

app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" })
})

import { startScheduler } from './services/scheduler.service.js'

// Start the server (and keep a reference to prevent accidental GC)
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SoundByte API running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    
    // Start the digest scheduler
    startScheduler()
})

// Keep process alive
process.stdin.resume()