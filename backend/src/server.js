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

const app = express()
const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 for dev, 100 for prod
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
})

app.use(limiter)

// webhooks need raw body
app.use("/api/webhooks", webhookRoutes)

// CORS configuration that supports multiple origins
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // In production, use the environment variable
        // In development, allow localhost origins
        const allowedOrigins = process.env.NODE_ENV === 'production' 
            ? [process.env.CLIENT_URL || process.env.FRONTEND_URL].filter(Boolean)
            : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
}))

app.use(passport.initialize())

app.use("/api/auth", authRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/conversations", messageRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/digests", digestRoutes)
app.use("/api/payments", paymentRoutes)


app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use((err, _req, res, _next) => {
    console.error("Error:", err)
    res.status(500).json({ message: "SoundByte API is currently experiencing issues. Please try again later." })
})

app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" })
})

import { startScheduler } from './services/scheduler.service.js'

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 SoundByte API running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    
    // Start the digest scheduler
    startScheduler()
})